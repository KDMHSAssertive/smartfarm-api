const express = require("express");
const crypto = require('crypto');
const app = express.Router();

app.use("/", (req, res, next) => {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV == "production") res.end("NOT AVAILABLE: production mode");
    else next();
})

app.get('/', (req, res) => {
    console.log("test");
    res.end("test");
})

app.get('/crypto', (req, res) => {
    crypto.randomBytes(120, (err, buf) => {
        crypto.pbkdf2(req.body.pw, buf.toString("base64"), 257070, 64, "sha512", (err, key) => {
            res.json({
                salt: buf.toString("base64"),
                enc: key.toString("base64")
            })
        })
    })
})

app.get('/clientId', (req, res) => {
    const salt = req.ip=="localhost" || req.ip == undefined ? ["127","0","0","1"] : req.ip.split(".")
    // console.log(salt);
    // console.log("" + new Date().getHours() + new Date().getMilliseconds() + new Date().getUTCFullYear() + "0"*(salt[0].length-3) + salt[0] + "0"*(salt[1].length-3) + salt[1] + "0"*(salt[2].length-3) + salt[2] + "0"*(salt[3].length-3) + salt[3]);
    // console.log("0"*(salt[0].length-3 > 0 ? salt[0].length-3 : -1 * salt[0].length-3) + salt[0] + "0"*(salt[1].length-3 > 0 ? salt[1].length-3 : -1 * salt[1].length-3) + salt[1] + "0"*(salt[2].length-3 > 0 ? salt[2].length-3 : -1 * salt[2].length-3) + salt[2] + "0"*(salt[3].length-3 > 0 ? salt[3].length-3 : -1 * salt[3].length-3) + salt[3]);
    // console.log(salt[0].length-3 > 0 ? salt[0].length-3 : -1 * salt[0].length-3)
    // console.log(salt[1].length-3 > 0 ? salt[1].length-3 : -1 * salt[1].length-3)
    // console.log(salt[2].length-3 > 0 ? salt[2].length-3 : -1 * salt[2].length-3)
    // console.log(salt[3].length-3 > 0 ? salt[3].length-3 : -1 * salt[3].length-3)
    res.end();
})



module.exports = app;