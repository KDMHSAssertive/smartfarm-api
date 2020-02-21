const { apiReq } = require("../mysql");
const {res_end} = require("../routes/common");

// Account Permission Settings

    // 0: Root Account
    // 1: Authorized Account (this account can use service api)
    // 2: Test Account (this account can use open api only. Service API Connection possible, but limit exists (set 'testReqLim'))
    const testReqLim = 100; // per day
    // 3: User Account (cannot access all api, include open api)

module.exports.isAuthable = {
    register: (userAccLevel) => {
        // console.log(typeof userAccLevel);
        const possible = [0, 1, 2];
        console.log(possible.includes(userAccLevel));
        if (possible.includes(userAccLevel)) return true;
        return false;
    },
    service: (userAccLevel, userid, clientId) => {
        const possible = [0, 1, 2];
        if (userAccLevel == 2) {
            apiReq.findReq(clientId, scope, undefined, (err, res) => {
                if (err) {
                    console.log("ERROR: " + __filename + ": findClient");
                    return false;
                }
                if (res.length > testReqLim) return false;
                return true;
            })
        }
        else if (possible.includes(userAccLevel)) return true;
        else return false;
    }

}

module.exports.isAuthableMiddleware = {
    register: (req, res, next) => {
        console.log(req.userAccLevel);
        if (!this.isAuthable.register(req.userAccLevel)) res_end(res, 403, "User not permission: " + req.session.passport.user, "check user", undefined);
        else next();
    }
}