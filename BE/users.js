const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'duu_secret_key'; //secret key는 암호화?? 환경 변수로 설정?? 필요
const SECRET_REFRESH_KEY ='duu_secret_refresh_key';

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: { files: 1 }  // 프로필 사진은 1장만 허용
});

exports.verifyToken = function(req, res, next) { // 토큰 검증 미들웨어 & 토큰 만기 시 refreshtoken으로 새 accesstoken 발급  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const refreshToken = req.headers['x-refresh-token']; // 클라이언트가 리프레시 토큰을 헤더로 보낸다고 가정

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 없습니다.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      // 토큰이 만료되었고 리프레시 토큰이 있는 경우
      if (err.name === 'TokenExpiredError' && refreshToken) {
        
        // DB에서 리프레시 토큰 검증
        db.query(`SELECT * FROM users WHERE refresh_token=?`, [refreshToken], (dbErr, results) => {
          if (dbErr) {
            console.error('DB 조회 에러:', dbErr);
            return res.status(500).json({ success: false, message: '서버 오류' });
          }
          
          if (results.length === 0) {
            return res.status(403).json({ success: false, message: '다시 로그인해주세요.' });
          }

          // 리프레시 토큰 JWT 검증
          jwt.verify(refreshToken, SECRET_REFRESH_KEY, (refreshErr, refreshUser) => {
            if (refreshErr) {
              return res.status(403).json({ success: false, message: '다시 로그인해주세요.' });
            }

            // 새 액세스 토큰 발급
            const newAccessToken = jwt.sign({ id: refreshUser.id }, SECRET_KEY, { expiresIn: '1h' });
            
            // req.user에 사용자 정보 설정
            req.user = refreshUser;
            
            // 응답 헤더에 새 토큰 추가 (클라이언트가 저장할 수 있도록)
            res.set('x-new-access-token', newAccessToken);
            next();
          });
        });
        
      } else {
        // 리프레시 토큰이 없거나 다른 토큰 에러인 경우
        return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다.' });
      }
    } else {
      // 액세스 토큰이 유효한 경우
      req.user = user;
      next();
    }
  });
};

exports.registerStart = (req, res) => { //단계별 회원가입 1 - 이메일, 비밀번호 먼저 저장 
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '이메일과 비밀번호가 필요합니다.' });
  }
  db.query('SELECT * FROM users WHERE id = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 에러' });
    if (results.length > 0) return res.status(400).json({ success: false, message: '이미 존재하는 이메일입니다.' });

    db.query('INSERT INTO users (uid, password) VALUES (?, ?)', [email, password], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: '서버 에러' });
      return res.json({ success: true, message: '회원가입 1단계 완료' });
    });
  });
}; 

exports.user_profile = function(req, res){ //단계별 회원가입 2 - 프로필 작성 
  const {username, Nickname, DateOfBirth, email} = req.body;

  if(!username || !DateOfBirth || !Nickname || !email){
    return res.status(400).json({ success: false, message: '사용자 이름과 별명 그리고 생년월일이 필요합니다.'});
  }
  db.query('SELECT * FROM users WHERE id = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 에러' });

    db.query('UPDATE users SET username=?, Nickname=?, birth_date=? WHERE id=?', [username, Nickname, DateOfBirth, email], (err2) => {
      if (err2) {
        return res.status(500).json({ success: false, message: '서버 에러' });
      }
      return res.json({ success: true, message: '회원가입 2단계 완료'});
    });
  });
};

exports.uploadProfilePhoto = function(req, res) { //단계별 회원가입 - 프로필 사진 넣는 것 
  const userId = req.body.uid;
  const photo = req.file;  // 한 장만 업로드 받으므로 req.file 사용

  if (!userId) {
    return res.status(400).json({ success: false, message: '사용자 ID가 누락되었습니다.' });
  }
  if (!photo) {
    return res.status(400).json({ success: false, message: '프로필 사진이 업로드되지 않았습니다.' });
  }

  // 1. 기존 프로필 사진이 있는지 확인 후 업데이트 or 삽입
  db.query(`SELECT * FROM user_photo WHERE uid = ?`, [userId], (err, results) => {
    if (err) {
      console.error('DB 조회 에러:', err);
      return res.status(500).json({ success: false, message: '서버 오류' });
    }

    if (results.length > 0) {
      // 기존 프로필 사진이 있으면 경로, 이름 업데이트
      db.query(
        `UPDATE user_photo SET photo_path = ?, original_name = ?, created_at = NOW() WHERE uid = ?`,
        [photo.path, photo.originalname, userId],
        (updateErr) => {
          if (updateErr) {
            console.error('프로필 사진 업데이트 에러:', updateErr);
            return res.status(500).json({ success: false, message: '서버 오류' });
          }
          return res.json({ success: true, message: '프로필 사진이 업데이트되었습니다.' });
        }
      );
    } else {
      // 프로필 사진 없으면 새로 삽입
      db.query(
        `INSERT INTO user_photo (uid, photo_path, original_name, created_at) VALUES (?, ?, ?, NOW())`,
        [userId, photo.path, photo.originalname],
        (insertErr) => {
          if (insertErr) {
            console.error('프로필 사진 삽입 에러:', insertErr);
            return res.status(500).json({ success: false, message: '서버 오류' });
          }
          return res.json({ success: true, message: '프로필 사진이 저장되었습니다.' });
        }
      );
    }
  });
};

exports.user_update= function(req, res){ //사용자 정보 갱신
  const {new_id, new_username, new_password, id} = req.body;
  db.query(`UPDATE users SET id=?, username=?, password=? WHERE id=?`, [new_id, new_username, new_password, id], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }
    return res.status(200).json({success: true, message: '사용자 정보 저장되었습니다.'})
  })
};

exports.delete_user = function(req ,res){ //사용자 정보 완전 삭제
  const {id} = req.body;
  db.query('DELETE FROM users WHERE id=?', [id], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '데이터 베이스 오류'})
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '올바른 아이디를 써주세요.' });
    }
  })
};

exports.user_login = function(req, res){ //사용자 로그인, 액세스 토큰 1개 
  const {id, password} = req.body;

  if (!id || !password){
    return res.status(400).json({success: false, message: '아이디와 비밀번호를 입력해 주세요.'});
  }

  db.query(`SELECT * FROM users WHERE id=? AND password=?`, [id, password], (error, user)=>{
    if (error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }

    if (user.length === 0){
      return res.status(401).json({success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.'});
    }
    const token = jwt.sign({ id: user[0].id }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({success: true, message: '로그인 성공', token});
  })
}

exports.user_login = function(req, res){ //사용자 로그인, 액세스 토큰, 리프레시 토큰 
  const {id, password} = req.body;

  if (!id || !password){
    return res.status(400).json({success: false, message: '아이디와 비밀번호를 입력해 주세요.'});
  }

  db.query(`SELECT * FROM users WHERE id=? AND password=?`, [id, password], (error, user)=>{
    if (error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }

    if (user.length === 0){
      return res.status(401).json({success: false, message: '아이디 또는 비밀번호가 잘못되었습니다.'});
    }
    const token = jwt.sign({ id: user[0].id }, SECRET_KEY, { expiresIn: '1h' });

    const refreshToken = jwt.sign({id: user[0].id}, SECRET_REFRESH_KEY, {expiresIn: '7d'});
    db.query(`UPDATE users SET refresh_token=? WHERE id=?`, [refreshToken, user[0].id],(err2)=>{
      if(err2){
        console.log('리프레시 토큰 저장 에러:', err2);
        return res.status(400).json({success: false, message: '서버 에러'});
      }
    });
    return res.json({success: true, message: '로그인 성공', token, refreshToken});
  })
};

exports.user_info = function(req, res){ //사용자 정보 조회
  const { id } = req.user;
  db.query(`SELECT * FROM users WHERE id=?`, [id], (error, user)=>{
    if (error) {
      return res.status(500).json({ success: false, message: '서버 에러' });
    }
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    const { password, ...userWithoutPassword } = user[0];
    return res.json({ success: true, user: user[0] });
  });
}