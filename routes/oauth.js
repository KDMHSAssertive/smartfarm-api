'use strict';

const express = require("express");
const app = express.Router();
const path = require("path");
const oauth2orize = require('@poziworld/oauth2orize');
const passport = require('passport');
const {res_end} = require("./common");
const login = require('connect-ensure-login');
const crypto = require("crypto");

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

app.post('*', [
    (req, res, next) => {
        // console.log("access");
        next();
    },
    login.ensureLoggedIn({}),
    (req, res, next) => {
        // console.log("sdrgf");
        user.findUser("userid", req.session.passport.user, (err, userInfo) => {
            if (err) res_end(res, 500, err, "check user", undefined);
            else if (userInfo.length == 0) res_end(res, 401, "Cannot find user: " + req.session.passport.user, "check user", undefined);
            else {
                // console.log(userInfo[0].acclevel);
                req.userAccLevel = userInfo[0].acclevel;
                next();
            }
        })
    }
])

app.post('/register/client', (req, res, next) => {
    // console.log(typeof req.userAccLevel);
    if (req.userAccLevel != 0) res_end(res, 403, "User not permission: " + req.session.passport.user, "check user", undefined);
    else {
        // create client id & client secret
        const clientSalt = req.ip=="localhost" || req.ip == undefined ? ["127","0","0","1"] : req.ip.split(".");
        const clientId = "OAS" + new Date().getHours() + "0"*(clientSalt[0].length-3) + clientSalt[0] + new Date().getMilliseconds() + "0"*(clientSalt[2].length-3) + clientSalt[2] + new Date().getUTCFullYear() + "0"*(clientSalt[1].length-3) + clientSalt[1] + "0"*(clientSalt[2].length-3) + clientSalt[2] + "0"*(clientSalt[3].length-3) + clientSalt[3] + "-" + utils.getUid(20) + ".api.sfam.shop";
        crypto.randomBytes(4500, (err, buf) => {
            crypto.scrypt(req.session.passport.user, buf.toString("base64"), 30, (err, derivedKey) => {
                const clientSecret = derivedKey.toString("base64");
                // console.log(clientId);
                // console.log(derivedKey.toString("base64"));
                authClient.saveClient(clientId, clientSecret, req.session.passport.user, (err, result) => {
                    console.log(err);
                    console.log(result);
                    if (err) res_end(res, 500, err, "registerClient", undefined);
                    else res_end(res, 200, undefined, undefined, {clientId, clientSecret});
                })
            })
        })
    }
})

app.get('/authorize', [
    login.ensureLoggedIn(),
    server.authorization((clientId, redirectUri, scope) => {
        
    })
])



module.exports = app;