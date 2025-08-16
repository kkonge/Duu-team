const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');

app.use(express.json())

exports.pet_register = function(req, res){
    const { id, familyId, name, breed, birth, sex, neutered, weight, unit, notes, photoUrl, createdBy } = req.body;
  if(!id || !familyId ||!name || !breed ){
    return res.status(400).json({success: false, message: '아이디, 가족아이디, 이름, 종을 입력해 주세요.'});
  }

    db.query(`SELECT * FROM pets WHERE id=? AND name=?`,[id, name],(error, pet)=>{
      if(error){
        return res.status(500).json({success: false, message: '서버 에러'});
      }
      if(pet.length >0){
        return res.status(400).json({success: false, message: '이미 존재하는 강아지 입니다.'});
      }
      db.query(`INSERT INTO pets(id, familyId, name, breed, birth, sex, neutered, weight, unit, notes, photoUrl, createdBy) VALUES(?,?,?,?)`,
        [id, familyId, 
            name, 
            breed, 
            birth || null, 
            sex || null, 
            neutered || false, 
            weight || null, 
            unit || 'kg', 
            notes || null, 
            photoUrl || null, 
            createdBy || id],(error2, result)=>{
        if(error2){
          return res.status(500).json({success: false, message: '서버 에러'});
        }
        return res.json({success: true, message:'강아지 등록에 성공하였습니다.'});
      });
    }); 
};


exports.pet_update= function(req, res){
  const {
    id, familyId, name, breed, birth, sex, neutered,
    weight, unit, notes, photoUrl, createdBy, oldName
  } = req.body;

  if (!id || !oldName) {
    return res.status(400).json({ success: false, message: 'id와 기존 이름(oldName)은 필수 입력입니다.' });
  }
  db.query(`UPDATE pets SET
      familyId = ?,
      name = ?,
      breed = ?,
      birth = ?,
      sex = ?,
      neutered = ?,
      weight = ?,
      unit = ?,
      notes = ?,
      photoUrl = ?,
      createdBy = ?,
      updatedAt = CURRENT_TIMESTAMP
    WHERE id=? AND name =?
  `, [familyId || null,
      name || null,
      breed || null,
      birth || null,
      sex || null,
      neutered || false,
      weight || null,
      unit || 'kg',
      notes || null,
      photoUrl || null,
      createdBy || null,
      id, oldName
    ], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '서버 에러'});
    }
    return res.status(200).json({success: true, message: '강아지 정보 저장되었습니다.'})
  })
};


exports.delete_pet = function(req, res){
  const {name, id} = req.body;
  db.query('DELETE FROM pets WHERE name=? AND id=?', [name, id], (error, result)=>{
    if(error){
      return res.status(500).json({success: false, message: '데이터 베이스 오류'})
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '해당 이름의 강아지가 없습니다.' });
    }
  })
};