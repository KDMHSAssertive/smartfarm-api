const mysql = require("./base");

function getTime() {
    var date = new Date().getDate();
    if (date < 10) {
        date = '0' + date
    }

    var month = new Date().getMonth()+1;
    if (month < 10) {
        month = '0' + month
    }

    var hour = new Date().getHours();
    if (hour < 10) {
        hour = '0' + hour
    }

    var minute = new Date().getMinutes();
    if (minute < 10) {
        minute = '0' + minute
    }

    var second = new Date().getSeconds();
    if (second < 10) {
        second = '0' + second
    }


    return '' + new Date().getFullYear() + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

module.exports.findReq = (requestType, url, ip, isToday, done) => {
    let columns = [];
    let values = [];

    if (requestType) columns.push("requestType"); values.push(requestType);
    if (url) columns.push("url"); values.push(url);
    if (ip) columns.push("ip"); values.push(ip);
    
    if (columns.length > 0 && values.length > 0) mysql.Read("apiRequest", null,  {columns, values}, (error, codeInfo) => {
        if (error) return done(error);
        else {
            if (!isToday || codeInfo.length == 0) return done(null, codeInfo);
            else {
                let todayAccess = [];
                const today = getTime.split(" ")[0];
                codeInfo.forEach(element => {
                    if (element.date.includes(today)) {
                        todayAccess.push(element);
                    }
                });
                return done(null, todayAccess);
            }
        }
    });
    else return done(null, false);
}

module.exports.logReq = (req, done) => {
    mysql.Insert("apiRequest", {columns: ["requestType", "ip", "headers", "body", "url"], values: [req.method, req.ip, JSON.stringify(req.headers), JSON.stringify(req.body), req.url]}, (error, result) => {
        if (error) return done(new Error("Error Logging Request: " + error));
        return done(null, true);
    })
}

module.exports.loadBlock = (ip, done) => {
    mysql.Read("blocked_ip", null, {columns: "ip", values: ip}, (err, res) => {
        if (err) return done(new Error("Error loading blocked IP (load): " + err));
        return done(null, res);
    })
}

module.exports.addBlock = (ip, done) => {
    mysql.Read("blocked_ip", null, {columns: "ip", values: ip}, (err, res) => {
        if (err) done(new Error("Error registering blocked IP (load): " + err));
        if (res.length == 0) mysql.Insert("blocked_ip", {columns: "ip", values: ip}, (err, result) => {
            if (err) return done(new Error("Error registering blocked IP: " + err));
            return done(null, "Registered block IP: " + ip);
        })
    })
}

module.exports.remBlock = (ip, done) => {
    mysql.Delete("blocked_ip", {columns: "ip", values: ip}, (err, result) => {
        if (err) return done(new Error("Error removing blocked IP: " + err));
        return done(null, true);
    })
}

// module.exports.