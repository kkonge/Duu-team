const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const multer = require('multer');

// 강아지 프로필 사진용 multer 설정
const petStorage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'dog_profile_upload/'); // uploads 없이 바로 dog_profile_upload 폴더
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
}); 

const petUpload = multer({
  storage: petStorage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

app.use('/dog_profile_upload', express.static('dog_profile_upload'));
app.use(express.json())

exports.pet_register = function(req, res){ //강아지 추가 한번에 하는 방식 
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

exports.pet_register_profile = function(req, res) {
    const { id, family_id, createdBy } = req.body;
    const profilePhoto = req.file; 

    if (!id || !family_id) {
        return res.status(400).json({success: false, message: '사용자 ID와 가족 ID를 입력해 주세요.'});
    }

    if (!profilePhoto) {
        return res.status(400).json({success: false, message: '프로필 사진을 선택해 주세요.'});
    }

    // 프로필 사진 URL 생성
    const photoUrl = `http://서버주소/dog_profile_upload/${profilePhoto.filename}`;

    db.query(
        `INSERT INTO pets(id, family_id, photoUrl, createdBy) VALUES(?, ?, ?, ?)`,
        [id, family_id, photoUrl, createdBy || id],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).json({success: false, message: '서버 에러'});
            }
            return res.json({
                success: true, 
                message: '프로필 사진이 등록되었습니다.',
                petId: result.insertId,
                photoUrl: photoUrl
            });
        }
    );
};

exports.pet_register_step2 = function(req, res) { // 2단계: 기본 정보
    const { petId, name, breed, birth, sex } = req.body;
    const userId = req.user.id;

    if (!petId || !name || !breed) {
        return res.status(400).json({success: false, message: '강아지 ID, 이름, 견종을 입력해 주세요.'});
    }
    db.query(`SELECT * FROM pets WHERE pet_id=? AND (id=? OR createdBy=?)`, [petId, userId, userId], (error, pet) => {
        if (error) {
            return res.status(500).json({success: false, message: '서버 에러'});
        }
        
        if (pet.length === 0) {
            return res.status(404).json({success: false, message: '등록된 강아지를 찾을 수 없습니다.'});
        }
        db.query(
            `UPDATE pets SET name=?, breed=?, birth=?, sex=?, updatedAt=NOW() WHERE pet_id=?`,
            [name, breed, birth || null, sex || null, petId],
            (error2) => {
                if (error2) {
                    console.error(error2);
                    return res.status(500).json({success: false, message: '서버 에러'});
                }
                
                return res.json({
                    success: true, 
                    message: '기본 정보가 등록되었습니다.'
                });
            }
        );
    });
};


exports.pet_register_end = function(req, res) { // 3단계: 추가 정보
    const { petId, neutered, weight, unit, notes } = req.body;
    const userId = req.user.id;

    if (!petId) {
        return res.status(400).json({success: false, message: '강아지 ID를 입력해 주세요.'});
    }

    // 해당 사용자의 강아지인지 확인
    db.query(`SELECT * FROM pets WHERE id=? AND (id=? OR createdBy=?)`, [petId, userId, userId], (error, pet) => {
        if (error) {
            return res.status(500).json({success: false, message: '서버 에러'});
        }
        
        if (pet.length === 0) {
            return res.status(404).json({success: false, message: '등록된 강아지를 찾을 수 없습니다.'});
        }

        // 3단계 정보 업데이트 (최종 완료)
        db.query(
            `UPDATE pets SET neutered=?, weight=?, unit=?, notes=?, updatedAt=NOW() WHERE id=?`,
            [
                neutered !== undefined ? neutered : false, 
                weight || null, 
                unit || 'kg', 
                notes || null, 
                petId
            ],
            (error2) => {
                if (error2) {
                    console.error(error2);
                    return res.status(500).json({success: false, message: '서버 에러'});
                }
                return res.json({
                    success: true, 
                    message: '강아지 등록이 완료되었습니다!'
                });
            }
        );
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