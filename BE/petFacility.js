const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());


exports.pet_facility = function(req, res) {
    let api = async () => {
        let response = null;
        try {
            response = await axios.get("https://apis.data.go.kr/B551011/KorPetTourService/areaBasedList", {
                params: {
                    "ServiceKey": "WayDWc5UdijdBLRXZaVNSeY+TyLIE8gDtDjLMm70Vjt5Kiz3XJ6o9NLm04QDSd9iWu1v8tO2gvb/pwE3NXl3pw==",
                    "MobileOS": "ETC",
                    "MobileApp": "MungLog",
                    "_type": "json",
                    "areaCode": req.query.areaCode || "",
                    "contentTypeId": req.query.contentTypeId || "",
                    "numOfRows": req.query.numOfRows || "10",
                    "pageNo": req.query.pageNo || "1"
                }
            });
        } catch (e) {
            console.log(e);
        }
        return response;
    };
    
    api().then((response) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(response.data.response.body);
    });
};