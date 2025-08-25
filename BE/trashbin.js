const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

// 전국 휴지통 정보 조회 API
exports.trashbin = async function(req, res){
    try {
        const response = await axios.get('http://api.data.go.kr/openapi/tn_pubr_public_trash_can_api', {
            params: {
                serviceKey: 'WayDWc5UdijdBLRXZaVNSeY+TyLIE8gDtDjLMm70Vjt5Kiz3XJ6o9NLm04QDSd9iWu1v8tO2gvb/pwE3NXl3pw==', 
                pageNo: req.query.pageNo || '1',          // 페이지 번호
                numOfRows: req.query.numOfRows || '10',   // 한 페이지에 조회할 데이터 수
                type: 'json',                             
                SIDO_NM: req.query.SIDO_NM || '',        // 시도명 (서울특별시, 경기도 등)
                LCTN_ROAD_NM_ADDR: req.query.LCTN_ROAD_NM_ADDR || '', // 소재지 도로명 주소
                LAT: req.query.LAT || '',                 // 위도
                LOT: req.query.LOT || ''                  // 경도
            }
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(response.data);
    } catch (error) {
        console.error('휴지통 API 호출 오류:', error.message);
        res.status(500).json({ error: '휴지통 데이터 조회 실패' });
    }
};
