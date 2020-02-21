const mysql = require("./base");

module.exports.findCode = (codeInfo, done) => {
    mysql.Read("code", null,  {columns: Object.keys(codeInfo), values: Object.values(codeInfo)}, (error, codeInfo) => {
        if (error) return done(error);
        return done(null, codeInfo);
    })
}

module.exports.saveCode = (code, clientId, redirectUri, userId, userName, done) => {
    mysql.Insert("code", {columns: ["userId", "clientId", "userName", "code", "redirectUri", "scope"], values: [userId, clientId, userName, code, redirectUri, scope]}, (error, result) => {
        if (error) return done(new Error("Failed Registering user: " + error));
        return done(null, true);
    })
}

// module.exports.