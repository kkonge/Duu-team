const express = require('express');
const app = express();
const db = require('./db');
const cors = require('cors');
const usersFunction = require('./users.js');
const petsFunction = require('./pets.js');

app.use(express.json());
app.use(cors());

app.get('/home', (req, res)=>{      //홈화면 어떻게 할지 프론트 팀이랑 상의
  usersFunction.home(req, res);
});

app.post('/user_register', (req, res)=>{  //사용자 등록
  usersFunction.user_register(req, res);
});

app.post('/pet_register', (req, res)=>{  //강아지 등록 
  petsFunction.pet_register(req, res)
});

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
});
app.delete('/deleteㅇpdpdp_pet', (req, res)=>{ //강아지 정보 완전 삭제 
  console.log('dsdad');
});

app.listen(3000,()=>{
  console.log('server is running on 3000 port');
});