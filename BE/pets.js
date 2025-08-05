const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');

app.use(express.json())

exports.pet_register = function(req, res){
    const {age, name, gender, breed} = req.body;
  if(!age || !name ||!gender || !breed ){
    return res.status(400).json({success: false, message: '나이, 이름, 성별, 종을 입력해 주세요.'});
  }

    db.query(`SELECT * FROM pets WHERE name=?`,[name],(error, pet)=>{
      if(error){
        return res.status(500).json({success: false, message: '서버 에러'});
      }
      if(pet.length >0){
        return res.status(400).json({success: false, message: '이미 존재하는 강아지 입니다.'});
      }
      db.query(`INSERT INTO pets(age, name, gender, breed) VALUES(?,?,?,?)`,[age, name, gender, breed],(error2, result)=>{
        if(error2){
          return res.status(500).json({success: false, message: '서버 에러'});
        }
        return res.json({success: true, message:'강아지 등록에 성공하였습니다.'});
      });
    }); 
};

exports.pet_update= function(req, res){
  const {new_age, new_name, new_gender, new_breed} = req.body;
  db.query(`UPDATE users SET age=?, name=?, gender=?, breed=? WHERE id=?`, 
    [new_age, new_name, new_gender, new_breed, id], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }
    return res.status(200).json({success: true, message: '강아지 정보 저장되었습니다.'})
  })
};

exports.delete_pet = function(req, res){
  const {name} = req.body;
  db.query('DELETE FROM pets WHERE name=?', [name], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '데이터 베이스 오류'})
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '해당 이름의 강아지가 없습니다.' });
    }
  })
};