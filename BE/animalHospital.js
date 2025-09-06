const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const proj4 = require('proj4');

// EPSG:5174 정의 (중부원점TM)
const epsg5174 = '+proj=tmerc +lat_0=38 +lon_0=127 +k=1.0 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs';
const wgs84 = proj4.WGS84;

function convertEPSG5174ToWGS84(x, y) {
  return proj4(epsg5174, wgs84, [parseFloat(x), parseFloat(y)]);
}

let cachedData = null;

const csvFilePath = path.join('C:', 'Users', 'kunhy', 'OneDrive', '바탕 화면', '02_03_01_P_CSV', 'fulldata_02_03_01_P_동물병원.csv');
//여긴 돌리는 컴퓨터나 csv 파일 위치에 따라 경로 달라짐 

function loadCSVtoMemory() { // <- csv 파일 경로 들어감 
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath) // <- csv 파일 경로 들어감 
      .pipe(csv())
      .on('data', (data) => {
        if (data['좌표정보x(epsg5174)'] && data['좌표정보y(epsg5174)']) {
          const [lng, lat] = convertEPSG5174ToWGS84(data['좌표정보x(epsg5174)'], data['좌표정보y(epsg5174)']);
          data.latitude = lat;
          data.longitude = lng;
        } else {
          data.latitude = null;
          data.longitude = null;
        }
        results.push(data);
      })
      .on('end', () => {
        cachedData = results;
        console.log('CSV 파일 메모리에 로드 완료, 총 행:', results.length);
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// 서버 시작 시 데이터 캐싱
loadCSVtoMemory().catch(console.error);

router.get('/', (req, res) => {
  if (!cachedData) {
    return res.status(503).json({ error: '데이터를 로드 중입니다. 잠시 후 다시 시도하세요.' });
  }

  const city = req.query.city;
  let filtered = cachedData;

  if (city) {
    filtered = cachedData.filter(item =>
      item['소재지전체주소'] && item['소재지전체주소'].includes(city)
    );
  }

  res.json(filtered);
});

module.exports = router;
