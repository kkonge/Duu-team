const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'duu_secret_key'; //secret key는 암호화?? 환경 변수로 설정?? 필요

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

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

exports.user_register = function(req, res){
    const {id, password} = req.body;
    
    if(!id ||!password){
        return res.status(400).json({success: false, message: '아이디와 비밀번호를 입력해 주세요.'});
    }

    db.query(`SELECT * FROM users WHERE id=?`,[id],(error, user)=>{
      if(error){
        return res.status(500).json({success: false, message: '서버 에러'});
      }
      if(user.length >0){
        return res.status(400).json({success: false, message: '이미 존재하는 아이디 입니다.'});
      }

      db.query(`INSERT INTO users(id, password) VALUES(?,?)`,[id, password],(error2, result2)=>{
        if(error2){
          return res.status(500).json({success: false, message: '서버 에러'});
        }
        return res.json({success: true, message:'회원가입에 성공하였습니다.'});
      });
    }); 
};

exports.user_update= function(req, res){
  const {new_id, new_password, id} = req.body;
  db.query(`UPDATE users SET id=?, password=? WHERE id=?`, [new_id, new_password, id], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }
    return res.status(200).json({success: true, message: '사용자 정보 저장되었습니다.'})
  })
};

exports.delete_user = function(req ,res){
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

exports.user_login = function(req, res){
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