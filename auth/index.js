'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

const { user } = require("../mysql");


// LocalStrategy
// for user login functions

passport.use(new LocalStrategy((username, password, done) => {
    user.encFindUser(username, password, (err, results) => {
        if (err) return done(err);
        else if (results.result == false || results.data.length == 0) return done(new Error("Cannot find user: " + username));
        // console.log(results.data);
        console.log("logined: " + results.data.name); return done(null, results.data);
    })
}))

passport.serializeUser((user, done) => done(null, user.userid));
passport.deserializeUser((userid, done) => user.findUser("userid", userid, done));



// BasicStrategy & ClientPasswordStrategy
// for authenticate registered OAuth clients



// client verification

function verifyClient(clientId, clientSecret, done) {
    // mysql.read('')
}