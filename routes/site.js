const express = require("express");
const passport = require("passport");
const login = require("connect-ensure-login");
const app = express.Router();


app.get('/', (req, res) => {
    console.log(req.session);
    res.send("test");
})

app.get('/login', (req, res) => {
    let resdata = {};
    if (req.query.failed == "true") {

    }
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