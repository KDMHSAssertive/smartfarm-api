const express = require("express");
const passport = require("passport");
const login = require("connect-ensure-login");
const app = express.Router();

function getTime() {
    var date = new Date().getDate();
    if (date < 10) {
        date = '0' + date
    }

    var month = new Date().getMonth()+1;
    if (month < 10) {
        month = '0' + month
    }

    var hour = new Date().getHours();
    if (hour < 10) {
        hour = '0' + hour
    }

    var minute = new Date().getMinutes();
    if (minute < 10) {
        minute = '0' + minute
    }

    var second = new Date().getSeconds();
    if (second < 10) {
        second = '0' + second
    }


    return '' + new Date().getFullYear() + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}


app.get('/', (req, res) => {
    console.log(req.session);
    res.send("test");
})

app.get('/login', (req, res) => {
    let resdata = {};
    if (req.query.failed == "true") {

    }

    res.end("HI! LOGIN");
})

app.post('/login',
    (req, res, next) => {
        console.log("login request");
        next();
    },
    passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login?failed=true'
    })
);

app.all('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})



module.exports = app;