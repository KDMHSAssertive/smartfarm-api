const mysql = require("./base");

module.exports.findClient = (clientInfo, done) => {
    mysql.Read("client", null,  {columns: Object.keys(clientInfo), values: Object.values(clientInfo)}, (error, codeInfo) => {
        if (error) return done(error);
        return done(null, codeInfo);
    })
}

module.exports.saveClient = (clientId, clientSecret, userid, done) => {
    mysql.Insert("client", {columns: ["userid", "clientId", "clientSecret"], values: [userid, clientId, clientSecret]}, (error, result) => {
        if (error) return done(new Error("Error Save Client: " + error));
        return done(null, true);
    })
}

module.exports.updateClient = (clientId, columns, values, done) => {
    mysql.Update("client", {columns: "clientId", values: clientId}, {columns, values},  (error, result) => {
        if (error) return done(new Error("Error Update Client: " + error));
        return done(null, true);
    })
}

// module.exports.