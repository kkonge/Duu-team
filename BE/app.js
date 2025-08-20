const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const usersFunction = require('./users.js');
const petsFunction = require('./pets.js');
const multer = require('multer');
const diary = require('./diary.js');
const walkFunction = require('./walks.js');

app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({  //storage 선언 
  destination: function(req, file, cb){
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb){
    cb(null, Date.now() + '-' + file.originalname);
  }
}); 

app.use('/user', express.static('uploads'));
app.use('/uploads', express.static('uploads'));


const upload = multer({   //미들웨어
  storage: storage, 
  limits: {files :5 }
});  

app.set('views', './views_file');
app.set('view engine', 'html');

//-----------------------------------------------------------------------

app.get('/', (req, res) => {    //임시 이미지 업로드 보는용 코드
  res.sendFile(__dirname + '/views_file/upload.html');
});

app.post('/diary/upload', upload.array('photos', 5), (req, res) => {  //일기 업로드
  diary.diary_upload(req, res);
});

app.get('/diary_photo', usersFunction.verifyToken, (req, res) => { //갤러리에서 보이는 사진 경로 가져오기
  diary.diary_photo(req, res);
});


app.get('/home', (req, res)=>{      //홈화면 어떻게 할지 프론트 팀이랑 상의
  usersFunction.home(req, res);
});

app.post('/user_register', (req, res)=>{  //사용자 등록
  usersFunction.user_register(req, res);
});

app.post('/pet_register', (req, res)=>{  //강아지 등록 
  petsFunction.pet_register(req, res)
});

app.post('/login', (req, res)=>{ //사용자 로그인
  usersFunction.user_login(req, res);
})

app.put('/user_update', (req, res)=>{   //사용자 정보 갱신 
  usersFunction.user_update(req, res);
});

app.put('/pet_update', (req, res)=>{   //강아지 정보 갱신 
  petsFunction.pet_update(req, res);
});

app.delete('/delete_user', (req, res)=>{  //사용자 정보 완전 삭제 
  usersFunction.delete_user(req ,res);
});

app.delete('/delete_pet', (req, res)=>{ //강아지 정보 완전 삭제 
  petsFunction.delete_pet(req, res);
  console.log("확인용 ");
});

// 사용자 정보 조회
app.get('/user_info', usersFunction.verifyToken, usersFunction.user_info);

app.post('/walks/save', (req, res) => {
  walkFunction.walk_save(req, res);
});

app.use((err, req, res, next) => { // 미들웨어 multer 에러 핸들러
  if (err instanceof multer.MulterError) {
    return res.status(500).send('업로드 에러: ' + err.message);
  } else if (err) {
    return res.status(500).send('서버 에러: ' + err.message);
  }
  next();
});

app.listen(3000,()=>{
  console.log('server is running on 3000 port');
});