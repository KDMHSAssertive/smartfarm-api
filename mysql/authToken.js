const mysql = require("./base");

module.exports.findToken = (tokenInfo, done) => {
    mysql.Read("token", null,  {columns: Object.keys(tokenInfo), values: Object.values(tokenInfo)}, (error, codeInfo) => {
        if (error) return done(error);
        return done(null, codeInfo);
    })
}

module.exports.saveToken = (token, userId, clientId, done) => {
    // console.log(token);
    // console.log(userId);
    // console.log(clientId);
    mysql.Insert("token", {columns: ["token", "userId", "clientId"], values: [token, userId, clientId]}, (error, result) => {
        // console.log(error);
        // console.log(result);
        if (error) return done(new Error("Failed Registering token: " + error));
        return done(null, token);
    })
}

// module.exports.