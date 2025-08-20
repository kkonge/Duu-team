const express = require('express');
const mysql = require('mysql2');
const app = express();
const db = require('./db.js');

app.use(express.json());


exports.walk_save = function(req, res){
  const { user_id, distance, walk_time, started_at, ended_at, route } = req.body;

  if (!user_id || !Array.isArray(route) || route.length === 0) {
    return res.status(400).json({ error: '필수 데이터 누락' });
  }

  db.beginTransaction(txErr => {
    if (txErr) return res.status(500).json({ error: txErr.message });

    // 1. walks 테이블에 산책 요약 정보 저장
    db.query(
      'INSERT INTO walks (user_id, distance, walk_time, started_at, ended_at) VALUES (?, ?, ?, ?, ?)',
      [user_id, distance, walk_time, started_at, ended_at],
      (err, result) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }

        const walk_id = result.insertId;

        // 2. walk_routes 테이블에 산책 경로 좌표들 저장
        const routes = route.map(pt => [
          walk_id,
          pt.lat,
          pt.lng,
          pt.ts ? pt.ts.replace('T', ' ').replace('Z', '') : new Date()
        ]);

        db.query(
          'INSERT INTO walk_routes (walk_id, latitude, longitude, timestamp) VALUES ?',
          [routes],
          err2 => {
            if (err2) {
              return db.rollback(() => res.status(500).json({ error: err2.message }));
            }
            db.commit(commitErr => {
              if (commitErr) {
                return db.rollback(() => res.status(500).json({ error: commitErr.message }));
              }
              res.json({ status: 'ok', walk_id });
            });
          }
        );
      }
    );
  });
}
