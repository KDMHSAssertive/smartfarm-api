const mysql = require("./base");

module.exports.findReq = (clientId, scope, ip, done) => {
    let columns = [];
    let values = [];

    if (clientId) columns.push("clientId"); values.push(clientId);
    if (scope) columns.push("scope"); values.push(scope);
    if (ip) columns.push("ip"); values.push(ip);
    
    if (columns.length > 0 && values.length > 0) mysql.Read("apiRequest", null,  {columns, values}, (error, codeInfo) => {
        if (error) return done(error);
        return done(null, codeInfo);
    });
    else return done(null, false);
}

module.exports.logReq = (clientId, scope, ip, done) => {
    mysql.Insert("apiRequest", {columns: ["clientId", "scope", "ip"], values: [clientId, scope, ip]}, (error, result) => {
        if (error) return done(new Error("Error Logging Request: " + error));
        return done(null, true);
    })
}

// module.exports.