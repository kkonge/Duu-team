const mysql = require('mysql2');

const db = mysql.createPool({
  host:'localhost',
  user:'root',
  password:'', //각자 로컬 환경에 맞게 설정
  database: 'duu', //각자 로컬 환경에 맞게 설정
  waitForConnections: true,
  connectionLimit: 10, //최대 연결 수
  queueLimit: 0, //대기열 제한 없음
});

module.exports = db;