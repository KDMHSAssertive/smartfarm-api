const mysql = require("./base");
const crypto = require("crypto");

module.exports.findUser = (key, value, done) => {
    mysql.Read("user", null,  {columns: key, values: value}, (error, userInfo) => {
        if (error) return done(error);
        if (userInfo.length == 0) return new Error("Cannot find user by using [" + key + "]: " + value);
        return done(null, userInfo);
    })
}

module.exports.encFindUser = (userid, pw, done) => {
    mysql.Read("user", null,  {columns: "userid", values: userid}, (error, userInfo) => {
        // console.log(userInfo);
        if (error) return done(error);
        if (userInfo.length == 0) return done(new Error("Cannot find user: " + userid));
        else userInfo.forEach(element => {
            crypto.pbkdf2(pw, element.salt, 257070, 64, "sha512", (err, key) => {
                if(key.toString('base64') == element.pw) return done(null, {result: true, data: element});
            })
        });
        // return done(null, userInfo);
    })
}

module.exports.saveUser = (admin, data, done) => {
    this.findUser("userid", admin.userid, (error, userInfo) => {
        if (error || userInfo.length == 0) return done(new Error("Request Administrator Not Valid"));
        mysql.Insert("user", data, (error, result) => {
            if (error) return done(new Error("Failed Registering user: " + error));
            return done(null, true);
        })  
    })
}

// module.exports.