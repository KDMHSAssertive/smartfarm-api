'use strict';

const express = require("express");
const app = express.Router();
const path = require("path");
const oauth2orize = require('@poziworld/oauth2orize');
const passport = require('passport');
const {res_end} = require("./common");
const {isAuthableMiddleware} = require("../permChk");
const login = require('connect-ensure-login');
const crypto = require("crypto");

const {user, authCode, authClient, authToken} = require("../mysql");

const utils = require('../util');


// Create OAuth 2.0 Server
const server = oauth2orize.createServer();


// Register serialization and deserialization functions

server.serializeClient((client, done) => {
    // console.log(client);
    done(null, client.userid)
});

server.deserializeClient((id, done) => {
    user.findUser("userid", id, (error, userInfo) => {
        if (error) return done(error);
        return done(null, userInfo);
    })
})


// Register grant types

// code
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = utils.getUid(20);
    authCode.saveCode(code, client.id, redirectUri, user.id, user.username, (err, result) => {
        if (err) return done(err);
        return done(null, code);
    })
}))

// token
server.grant(oauth2orize.grant.token((client, user, res, req, locals, done) => {
    const token = utils.getUid(256);
    // console.log(authToken.saveToken());
    // console.log(token);
    // console.log(user.userid);
    // console.log(client); // error position
    // console.log(req);
    // console.log(Object.keys(req));
    // console.log(req.clientID);
    // console.log(res);
    // console.log(client);
    // console.log(locals);
    authToken.saveToken(token, user[0].userid, req.clientID, (err, result) => {
        if (err) return done(err);
        return done(null, token);
    });
}));

// authToken.saveToken("abcde", "test", "test", () => {console.log("confirm")});

// Exchange 

// Authorization Code => Access Token
server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
    console.log("code");
    authCode.findCode({code}, (err, dbSvdCode) => {
        if (err) return done(err);
        if (client.clientId != dbSvdCode.clientId) return done(null, false);
        if (redirectUri !== dbSvdCode.redirectUri) return done(null, false);

        const token = utils.getUid(256);
        authToken.saveToken(token, dbSvdCode.userid, dbSvdCode.clientId, (err) => {
            if (err) return done(err);
            // Add custom params, e.g. the username
            let params = { userid: dbSvdCode.userid };
            // Call `done(err, accessToken, [refreshToken], [params])` to issue an access token
            return done(null, token, null, params);
        });
    })
}))

// Userid & pw => Access Token
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    console.log("password");
    authClient.findClient({clientId: client.clientId}, (err, clientData) => {
        if (err) return done(err);
        if (clientData.length == 0) return done(null, false);
        if (clientData.clientSecret !== client.clientSecret) return done(null, false);
        // Validate the user
        user.findUser("name", username, (err, user) => {
            if (err) return done(err);
            if (user.length == 0) return done(null, false);
            crypto.pbkdf2(password, client.salt, 257070, 64, "sha512", (err, key) => {
                if (key.toString("base64") != client.pw) return done(null, false);
            })
            const token = utils.getUid(256);
            authToken.saveToken(token, user[0].userid, client.clientId, (err, result) => {
                if (err) return done(err);
                // Call `done(err, accessToken, [refreshToken], [params])`, see oauth2orize.exchange.code
                return done(null, token);
            });
        })
    });
}))

// ?????
server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
    console.log("client cridential");
    // Validate the client
    authClient.findClient({clientId: client.clientId}, (err, clientData) => {
        if (err) return done(err);
        if (!clientData) return done(null, false);
        if (clientData.clientSecret !== client.clientSecret) return done(null, false);
        // Everything validated, return the token
        const token = utils.getUid(256);
        // Pass in a null for user id since there is no user with this grant type
        authToken.saveToken(token, null, client.clientId, (err) => {
            if (err) return done(err);
            // Call `done(err, accessToken, [refreshToken], [params])`, see oauth2orize.exchange.code
            return done(null, token);
        });
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

app.post('/register/client', [
    isAuthableMiddleware.register,
    (req, res, next) => {
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
])

app.post('/register/redirectUri', [
    isAuthableMiddleware.register,
    (req, res, next) => {
        const clientId = req.body.clientId,
        clientSecret = req.body.clientSecret, 
        redirectUri = req.body.redirectUri;
    
        if (!clientId) res_end(res, 400, "Cannot found: 'clientId'", "checkParams", undefined);
        else if (!clientSecret) res_end(res, 400, "Cannot found: 'clientSecret'", "checkParams", undefined);
        else if (!redirectUri || typeof redirectUri != "object") res_end(res, 400, "Cannot found or Unappropriate type: 'redirectUri'", "checkParams", undefined);
        else authClient.findClient({clientId}, (err, result) => {
            console.log(err);
            console.log(result);
            if (err) res_end(res, 500, err, "findClient", undefined);
            else if (result.length == 0) res_end(res, 500, "Cannot find clientId: " + clientId, "findClient", undefined);
            else  {
                const extRedirectUri = (result[0].redirectUri != undefined || result[0].redirectUri != null) ? result[0].redirectUri.split(",") : [];
                let notFormat = [];
                let incWildCard = [];
                let dupUri = [];
                redirectUri.forEach(element => {
                    // format check
                    if (!(element.includes("http://" || "https://"))) notFormat.push(element);
                    // wildcard check
                    else if (element.includes("*" || "_")) incWildCard.push(element);
                    // duplication check
                    else if (extRedirectUri.includes(element)) dupUri.push(element);
                    else extRedirectUri.push(element); 
                });

                const extRedirectUriToString = extRedirectUri.toString();

                if (notFormat.length != 0) res_end(res, 400, "Unappropriate Uri format: 'http://' or 'https://' is necessity", "checkParams", undefined);
                else if (incWildCard.length != 0) res_end(res, 400, "Unappropriate Uri format: Wildcard Not Available", "checkParams", undefined);
                else authClient.updateClient(clientId, "redirectUri", extRedirectUriToString, (err, result) => {
                    if (err) res_end(res, 500, err, "updateClient", undefined);
                    else if (dupUri.length != 0) res_end(res, 200, "Already Registered Uri: " + dupUri.toString(), undefined, extRedirectUri);
                    else res_end(res, 200, undefined, undefined, extRedirectUri);
                })
            }
        })
    }
])

app.get('/authorize', [
    login.ensureLoggedIn(),
    server.authorization((getInfo, done) => {
        // find client Id exists & redirect uri is valid
        if (!getInfo.type) res_end(res, 400, "Cannot found: 'response_type'", "checkParams", undefined);
        if (!getInfo.clientID) res_end(res, 400, "Cannot found: 'client_id'", "checkParams", undefined);
        if (!getInfo.redirectURI) res_end(res, 400, "Cannot found: 'redirect_uri'", "checkParams", undefined);
        // if (!getInfo.scope) res_end(res, 400, "Cannot found: 'scope'", "checkParams", undefined);
        // console.log(passport.session.user);
        authClient.findClient({ clientId: getInfo.clientID }, (err, checkRes) => {
            if (err) return done(err);
            if (checkRes.length == 0) return done(new Error("Cannot find user: " + getInfo.clientID));
            if (!checkRes[0].redirectUri || !checkRes[0].redirectUri.split(",").includes(getInfo.redirectURI)) return done(new Error("Unregistered_redirect_uri: " + getInfo.redirectURI));
            return done(null, checkRes[0], getInfo.clientID);
        })
    }, (client, user, done) => {
        // find Token Information

        // console.log("oirjghoursejiwfgrhtgjf0iwom");
        // console.log(client);
        // console.log(user);
        
        authToken.findToken({userid: user[0].userid, clientId: client.clientId}, (err, token) => {
            if (token && token.length != 0) return done(null, true);
            return done(null, false);
        })
    }),
    (req, res, next) => {
        console.log("approved");
        res.render('approve', {
            transactionId: req.oauth2.transactionID,
            user: req.user,
            client: req.oauth2.client
        })
    }
])

app.post('/authorize/confirm', server.decision())



module.exports = app;