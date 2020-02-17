'use strict';

const express = require("express");
const app = express.Router();
const path = require("path");
const oauth2orize = require('@poziworld/oauth2orize');
const passport = require('passport');
const login = require('connect-ensure-login');

const {user, authCode, authClient} = require("../mysql");

const utils = require('../util');


// Create OAuth 2.0 Server
const server = oauth2orize.createServer();


// Register serialization and deserialization functions

server.serializeClient((client, done) => {
    done(null, client.id)
});

server.deserializeClient((id, done) => {
    user.findUser("id", id, (error, userInfo) => {
        if (error) return done(error);
        return done(null, userInfo);
    })
})


// Register grant types

// code
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = utils.getUid(20);
    authCode.saveCode(code, client.id, redirectUri, user.id, user.username, (error, result) => {
        if (error) return done(error);
        return done(null, code);
    })
}))




// Router

app.post('/register/client', [
    login.ensureLoggedIn(),
    (req, res, next) => {
        user.findUser("userid", req.session.passport.user, (err, userInfo) => {
            
        })
    }
])

app.get('/authorize', [
    login.ensureLoggedIn(),
    server.authorization((clientId, redirectUri, scope) => {
        
    })
])



module.exports = app;