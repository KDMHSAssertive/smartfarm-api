const express = require("express");
const crypto = require('crypto');
const app = express.Router();

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



module.exports = app;