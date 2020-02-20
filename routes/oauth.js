'use strict';

const express = require("express");
const app = express.Router();
const path = require("path");
const oauth2orize = require('@poziworld/oauth2orize');
const passport = require('passport');
const {res_end} = require("./common");
const {isAuthable} = require("../permChk");
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


// token
server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    const token = utils.getUid(256);
    db.accessTokens.save(token, user.id, client.clientId, (error) => {
        if (error) return done(error);
        return done(null, token);
    });
}));




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
    if (!isAuthable.register(req.userAccLevel)) res_end(res, 403, "User not permission: " + req.session.passport.user, "check user", undefined);
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

app.post('/register/redirectUri', (req, res, next) => {
    if (!isAuthable.register(req.userAccLevel)) res_end(res, 403, "User not permission: " + req.session.passport.user, "check user", undefined);
    else {
        const clientId = req.body.clientId,
        clientSecret = req.body.clientSecret, 
        redirectUri = req.body.redirectUri;

        if (!clientId) res_end(res, 400, "Cannot found: 'clientId'", "checkParams", undefined);
        else if (!clientSecret) res_end(res, 400, "Cannot found: 'clientSecret'", "checkParams", undefined);
        else if (!redirectUri || typeof redirectUri != "object") res_end(res, 400, "Cannot found or Unappropriate type: 'redirectUri'", "checkParams", undefined);
        else {
            authClient.findClient(clientId, (err, result) => {
                console.log(err);
                console.log(result);
                if (err) res_end(res, 500, err, "findClient", undefined);
                else if (result.length == 0) res_end(res, 500, "Cannot find clientId: " + clientId, "findClient", undefined);
                else  {
                    const extRedirectUri = (result[0].redirectUri != undefined || result[0].redirectUri != null) ? result[0].redirectUri.split(",") : [];
                    let notFormat = [];
                    let incWildCard = [];
                    redirectUri.forEach(element => {
                        // format check
                        if (!(element.includes("http://" || "https://"))) notFormat.push(element);
                        // wildcard check
                        else if (element.includes("*" || "_")) incWildCard.push(element);
                        // ok
                        else extRedirectUri.push(element); 
                    });

                    const extRedirectUriToString = extRedirectUri.toString();

                    if (notFormat.length != 0) res_end(res, 400, "Unappropriate Uri format: 'http://' or 'https://' is necessity", "checkParams", undefined);
                    else if (incWildCard.length != 0) res_end(res, 400, "Unappropriate Uri format: Wildcard Not Unavailable", "checkParams", undefined);
                    else authClient.updateClient(clientId, "redirectUri", extRedirectUriToString, (err, result) => {
                        if (err) res_end(res, 500, err, "updateClient", undefined);
                        else res_end(res, 200, undefined, undefined, extRedirectUri);
                    })
                }
            })
        }

    }
})

app.get('/authorize', [
    login.ensureLoggedIn(),
    server.authorization((getInfo, done) => {
        console.log(getInfo);
        // authClient.findClient(clientId, clientSecret, redirectUri, (err, checkRes) => {
        //     if (err) return done(err);
        //     return done(null, checkRes)
        // })
    })
])



module.exports = app;