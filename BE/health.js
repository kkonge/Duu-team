const express = require('express');
const app = express();
const axios = require('axios');
const db = require('./db');
const { verifyToken } = require('./usersFunction');

app.use(express.json());

exports.saveHealthData = async function(req, res) {
    const uid = req.user?.id || req.user?.uid;

    const pet_id = req.body.pet_id ?? req.params.pet_id ?? req.query.pet_id;
    const weight = req.body.weight ?? req.query.weight;
    const walk_minutes = req.body.walk_minutes ?? req.query.walk_minutes;
    const condition = req.body.condition ?? req.query.condition;
    const next_vaccination = req.body.next_vaccination ?? req.query.next_vaccination;

    if (!uid) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.'});
    }
    if (!pet_id || weight == null || walk_minutes == null || !condition || !next_vaccination) {
        return res.status(400).json({
            success: false,
            message: 'pet_id, weight, walk_minutes, condition, next_vaccination 필드가 필요합니다.',
        });
    }

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const [weightResult] = await conn.execute(
            `INSERT INTO pet_weight (pet_id, created_by, weight, created_at) VALUES (?, ?, ?, NOW())`,
            [pet_id, uid, weight]
        );

        const [walkResult] = await conn.execute(
            `INSERT INTO walks (pet_id, created_by, distance, walk_time, started_at, ended_at, created_at) VALUES (?, ?, NULL, ?, NULL, NULL, NOW())`,
            [pet_id, uid, walk_minutes]
        );

        const [petUpdate] = await conn.execute(
            `UPDATE pets SET \`condition\` = ?, vaccination = ? WHERE pet_id = ?`,
            [condition, next_vaccination, pet_id]
        );

        await conn.commit();

        return res.json({
            success: true,
            message: '건강 데이터가 성공적으로 저장되었습니다.',
            data: {
                pet_id,
                weight_id: weightResult.insertId,
                walk_id: walkResult.insertId,
                updated_rows: petUpdate.affectedRows > 0,
            },
        });
    } catch (error) {
        if (conn) await conn.rollback();
        console.error('[saveHealthData] Error:', error);
        return res.status(500).json({ success: false, message: '서버 오류로 저장에 실패했습니다.'});
    } finally {
        if (conn) conn.release();
    }
};

exports.getRecentHealth = async function (req, res) {
    const uid = req.user?.id || req.user?.uid;
    const pet_id = req.query.pet_id ?? req.params.pet_id ?? req.body.pet_id;
    const limitRaw = req.query.limit ?? 6;
    const limit = Math.max(1, Math.min(parseInt(limitRaw, 10) || 6, 50));

    if (!uid) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.'});
    }
    if (!pet_id) {
        return res.status(400).json({ success: false, message: 'pet_id가 필요합니다.'});
    }

    let conn;
    try {
        conn = await db.getConnection();

        const [weightRows] = await conn.execute(
            `SELECT weight_id, weight, created_at FROM pet_weight WHERE pet_id = ? ORDER BY created_at DESC, weight_id DESC LIMIT ?`,
            [pet_id, limit]
        );

        const [walkRows] = await conn.execute(
            `SELECT walk_id, walk_time, created_at FROM walks WHERE pet_id = ? ORDER BY created_at DESC, walk_id DESC LIMIT ?`,
            [pet_id, limit]
        );

        const toSeries = (rows, valueKey) => rows
            .map(r => ({
                value: Number(r[valueKey]),
                data: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
            })).revers();

        return res.json({
            success: true,
            data: {
                weight: toSeries(weightRows, 'weight'),
                walking: toSeries(walkRows, 'walk_time'),
            },
        });
        } catch (err) {
            console.error('[getRecentHealth] Error:', err);
            return res.status(500).json({ success: false, message: '서버 오류로 데이터를 불러오지 못했습니다.'});
        } finally {
            if (conn) conn.release();
        }
};


let HEALTH_COL_CACHE = null;

async function getHealthCheckColumns(conn) {
    if (HEALTH_COL_CACHE) return HEALTH_COL_CACHE;
    const [cols] = await conn.execute(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'health_check'`
    );
    HEALTH_COL_CACHE = new Set(cols.map(c => c.COLUMN_NAME));
    return HEALTH_COL_CACHE;
}

exports.saveSelfCheck = async function (req, res) {
    const uid = req.user?.id || req.user?.uid;
    const pet_id = req.body.pet_id ?? req.params.pet_id ?? req.query.pet_id;

    if (!uid) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.'});
    }
    if (!pet_id) {
        return res.status(400).json({ success: false, message: 'pet_id가 필요합니다.'});
    }

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        const COLS = await getHealthCheckColumns(conn);

        const AUTO_COLS = new Set(['hc_id']);
        const hasCreatedAt = COLS.has('created_at');

        const payload = { ...req.body };
        delete payload.pet_id;

        const insertCols = [];
        const insertVals = [];
        const placeholders = [];

        insertCols.push('pet_id');
        insertVals.push(pet_id);
        placeholders.push('?');

        for (const [k, v] of Object.entries(payload)) {
            if (!COLS.has(k)) continue;
            if (AUTO_COLS.has(k)) continue;
            insertCols.push(k);
            insertVals.push(v);
            placeholders.push('?');
        }

        if (insertCols.length === 1 && !hasCreatedAt) {
            return res.status(400).json({
                success: false,
                message: '저장할 수 있는 데이터가 없습니다.',
            });
        }

        let createdAtFragment = '';
        if (hasCreatedAt) {
            insertCols.push('created_at');
            createdAtFragment = ', NOW()';
        }

        const sql = `INSERT INTO health_check (${insertCols.map(c => `\`${c}\``).join(', ')})
        VALUES (${placeholders.join(', ')}${createdAtFragment})`;

        const [result] = await conn.execute(sql, insertVals);
        await conn.commit();

        return res.json({
            success: true,
            message: '자가진단 데이터가 성공적으로 저장되었습니다.',
            data: { hc_id: result.insertId, pet_id },
        });
    } catch (err) {
        if (conn) await conn.rollback();
        connsole.error('[saveSelfCheck] Error:', err);
        return res.status(500).json({ success: false, message: '서버 오류로 저장에 실패했습니다.'});
    } finally {
        if (conn) conn.release();
    }
};

exports.getSelfCheckHistory = async function (req, res) {
    const uid = req.user?.id || req.user?.uid;
    const pet_id = req.query.pet_id ?? req.params.pet_id ?? req.body.pet_id;
    const limitRaw = req.query.lemit ?? 0;
    const limit = Math.max(0, Math.min(parseInt(limitRaw, 10) || 0, 200));

    if (!uid) {
        return res.status(401).json({ success: false, message: '인증이 필요합니다.'});
    }
    if (!pet_id) {
        return res.status(400).json({ success: false, message: 'pet_id가 필요합니다.'});
    }

    let conn;
    try {
        conn = await db.getConnection();

        const baseSql = `SELECT * FROM health_check WHERE pet_id = ? ORDER BY created_at DESC, hc_id DESC`;
        const params = [pet_id];

        const sql = limit > 0 ? `${baseSql} LIMIT ?` : baseSql;
        if (limit > 0) params.push(limit);

        const [rows] = await conn.execute(sql, params);

        return res.json({
            success: true,
            count: rows.length,
            data: rows,
        });
    } catch (err) {
        console.error('[getSelfCheckHistory] Error:', err);
        return res.status(500).json({ success: false, message: '서버 오류로 데이터를 불러오지 못했습니다.'});
    } finally {
        if (conn) conn.release();
    }
};