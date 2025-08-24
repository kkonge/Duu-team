const express = require('express');
const app = express();
const db = require('./db');
const multer = require('multer');
const cors = require('cors');

app.use(express.json());

app.set('views', './views_file');
app.set('view engine', 'html');

const storage = multer.diskStorage({  //storage 선언 
  destination: function(req, file, cb){
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
}); 
const upload = multer({   //미들웨어
  storage: storage, 
  limits: {files :5 }
}); 


exports.diary_upload = function(req ,res){
    const { title, content, user_id } = req.body;
    const id = user_id;
    const photos = req.files;

    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    // 필수 필드 체크
    if (!id || !title || !content) {
        return res.status(400).json({ success: false, message: '필수 필드가 누락되었습니다.' });
    }

    // 1. diaries 테이블에 일기 저장
    db.query(
        `INSERT INTO diaries (id, title, content, created_at) VALUES (?, ?, ?, NOW())`,
        [id, title, content],
        (err, diaryResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: '서버 오류 발생' });
        }

        const diary_id = diaryResult.insertId;

        // 2. 사진 저장
        if (photos && photos.length > 0) {
            let completed = 0;
            let hasError = false;

            photos.forEach(photo => {
            db.query(
                `INSERT INTO diary_photo (id, diary_id, photo_path, original_name, created_at) VALUES (?, ?, ?, ?, NOW())`,
                [id, diary_id, photo.path, photo.originalname],
                (err2) => {
                if (err2) {
                    console.error(err2);
                    if (!hasError) {
                    hasError = true;
                    return res.status(500).json({ success: false, message: '서버 오류 발생(사진 저장 중)' });
                    }
                }
                completed++;
                // 모든 사진 Insert 완료 시 응답
                if (completed === photos.length && !hasError) {
                    return res.send('일기와 사진 저장 성공');
                }
                }
            );
            });
        } else {
            // 사진 없으면 바로 성공 응답
            return res.send('일기만 저장 성공');
        }
        }
    );
}

app.use((err, req, res, next) => { // 미들웨어 multer 에러 핸들러
  if (err instanceof multer.MulterError) {
    return res.status(500).send('업로드 에러: ' + err.message);
  } else if (err) {
    return res.status(500).send('서버 에러: ' + err.message);
  }
  next();
});


exports.diary_photo = function(req, res){  //response로 전체 사진들의 경로가 저장되어있는 배열 전달, 갤러리용 
    const userId = req.user.id; 
    db.query(`SELECT * FROM diary_photo WHERE id=? ORDER BY created_at DESC`,[userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'DB 오류' });
            }
            const photos = results.map(photo => {  //사진 경로들 저장 
            return {
            id: photo.id,
            diary_id: photo.diary_id,
            photo_path: photo.photo_path,
            original_name: photo.original_name,
            created_at: photo.created_at,
            photo_url: `http://서버주소/${photo.photo_path}` // 이 부분은 앱에 맞춰서 수정해야할 가능성o 
            };
        });
        res.json({ success: true, photos });
        }
    );
};

exports.diaryFirstPhotos = function(req, res){  //일기 페이지에서 날짜 별로 보이는 한장의 사진들 반환 
    const userId = req.user.id; 
    db.query(`SELECT * FROM diary_photo WHERE id=? ORDER BY created_at DESC`, [userId],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'DB 오류' });
            }

            // 날짜별 그룹핑용 객체
            const groupedByDate = {};

            results.forEach(photo => {
                // created_at에서 날짜 부분만 추출 (YYYY-MM-DD)
                const dateKey = photo.created_at.toISOString().slice(0,10);
                
                // 해당 날짜에 사진이 없으면 최초 사진 넣기
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = {
                        id: photo.id,
                        diary_id: photo.diary_id,
                        photo_path: photo.photo_path,
                        original_name: photo.original_name,
                        created_at: photo.created_at,
                        photo_url: `http://서버주소/${photo.photo_path}`
                    };
                }
            });

            // groupedByDate의 값들만 배열로 변환
            const photos = Object.values(groupedByDate);

            res.json({ success: true, photos });
        }
    );
};