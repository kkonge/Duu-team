const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'duu_secret_key'; //secret key는 암호화?? 환경 변수로 설정?? 필요

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

exports.verifyToken = function(req, res, next) { // 토큰 검증 미들웨어
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '토큰이 없습니다.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '유효하지 않은 토큰입니다.' });
    }
    req.user = user;
    next();
  });
}

exports.home = function(req, res){
  try{
    db.query(`SELECT * FROM users`, (error, users)=>{
      if(error){
        return res.status(500).json({success: false, message: '서버 에러'});
      }
      db.query(`SELECT * FROM pets`, (error2, pets)=>{
        if(error2){
          return res.status(500).json({success: false, message: '서버 에러'});
        }
        res.json({users, pets});
      });
    });
  } catch(e){
    return res.status(500).json({success: false, message: '서버 에러'});
  }
}

exports.user_register = function(req, res){ //회원가입 한번에 입력 받아서 넣는 방식 
    const {id, username, password} = req.body;
    
    if(!id ||!username ||!password){
        return res.status(400).json({success: false, message: '아이디와 사용자의 이름, 그리고 비밀번호를 입력해 주세요.'});
    } 

    db.query(`SELECT * FROM users WHERE id=?`,[id],(error, user)=>{
      if(error){
        return res.status(500).json({success: false, message: '서버 에러'});
      }
      if(user.length >0){
        return res.status(400).json({success: false, message: '이미 존재하는 아이디 입니다.'});
      }

      db.query(`INSERT INTO users(id,username, password) VALUES(?,?,?)`,[id,username, password],(error2, result2)=>{
        if(error2){
          return res.status(500).json({success: false, message: '서버 에러'});
        }
        return res.json({success: true, message:'회원가입에 성공하였습니다.'});
      });
    }); 
};

exports.registerStart = (req, res) => { //단계별 회원가입 - 이메일, 비밀번호 먼저 저장 
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '이메일과 비밀번호가 필요합니다.' });
  }
  db.query('SELECT * FROM users WHERE id = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 에러' });
    if (results.length > 0) return res.status(400).json({ success: false, message: '이미 존재하는 이메일입니다.' });

    db.query('INSERT INTO users (id, password) VALUES (?, ?)', [email, password], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: '서버 에러' });
      return res.json({ success: true, message: '회원가입 1단계 완료' });
    });
  });
}; 

exports.updateRelation = (req, res) => { //단계별 회원가입 - relation 업데이트  
  const { email, relation } = req.body;
  if (!email || !relation) {
    return res.status(400).json({ success: false, message: '이메일과 관계 정보가 필요합니다.' });
  }
  db.query('UPDATE users SET relation = ? WHERE id = ?', [relation, email], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: '서버 에러' });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: '사용자 없음' });
    return res.json({ success: true, message: '추가 정보 업데이트 완료' });
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

exports.user_login = function(req, res){ //사용자 로그인
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