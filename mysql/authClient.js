const mysql = require("./base");

module.exports.findClient = (code, done) => {
    mysql.Read("code", null,  {columns: "code", values: code}, (error, codeInfo) => {
        if (error) return done(error);
        return done(null, codeInfo);
    })
}

module.exports.saveClient = (clientId, clientSecret, userid, done) => {
    mysql.Insert("client", {columns: ["userid", "clientId", "clientSecret"], values: [userid, clientId, clientSecret]}, (error, result) => {
        if (error) return done(new Error("Error Registering User: " + error));
        return done(null, true);
    })
}

// module.exports.