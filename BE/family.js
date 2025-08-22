const express = require('express');
const app = express();
const db = require('./db');
const generateInviteCode = require('nanoid').nanoid; // nanoid 사용 예시

app.use(express.json());

//초대 코드 생성 
exports.family_invite =  async function(req, res) {
  const { family_id } = req.body;
  const code = generateInviteCode();
  await db.query(
    "INSERT INTO invite_codes (family_id, code, created_at, expires_at, used) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), false)",
    [family_id, code]
  );
  res.send({ code });
};

// 초대 코드 입력 후 가족 가입
exports.family_join = async function(req, res) {
  const { userId, code } = req.body;
  const [invite] = await db.query(
    "SELECT * FROM invite_codes WHERE code = ? AND used = false AND expires_at > NOW()",
    [code]
  );
  if (!invite) return res.status(400).send('Invalid or expired code');

  await db.query("UPDATE users SET family_id = ? WHERE id = ?", [invite.family_id, userId]);
  await db.query("UPDATE invite_codes SET used = true WHERE inviteCode_id = ?", [invite.inviteCode_id]);

  res.send('Joined family');
};
