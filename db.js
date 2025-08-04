const mysql = require('mysql2');

const db = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'kunhyung0823@',
  database: 'application'
});

db.connect();

module.exports = db;