const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');

app.use(express.json())


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
}
