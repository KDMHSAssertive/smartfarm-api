const { apiReq } = require("../mysql");

// Account Permission Settings

    // 0: Root Account
    // 1: Authorized Account (this account can use service api)
    // 2: Test Account (this account can use open api only. Service API Connection possible, but limit exists (set 'testReqLim'))
    const testReqLim = 100; // per day
    // 3: User Account (cannot access all api, include open api)

module.exports.isAuthable = {

    register: (userAccLevel) => {
        const possible = [0, 1, 2];
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