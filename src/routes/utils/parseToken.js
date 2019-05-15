const LoggedIn = require('../../models/loggedIn');
const rm = require('../../static/response_messages');
const jwt = require('../../jwt/jwtService');


module.exports.tokenResponse = (token, req, res, func) => {
    LoggedIn.getRecordByToken(token, (err, record) => {
        if (err) {
            return next(err);
        }
        if (!record) {
            return res.status(rm.notLoggedIn.code).json(rm.notLoggedIn.msg);
        }
        if (!validateToken(token)) {
            return res.status(rm.sessionInvalid.code).json(rm.sessionInvalid.msg);
        }
        func(token);
    });
}


const validateToken = (token) => { // checks if the jwt has expired
    const verifyOptions = {
        issuer: jwt.fumServerIssuer
        , audience: jwt.fumClientIssuer
    };

    const legit = jwt.verify(token, verifyOptions);
    currentTime = new Date().getTime() / 1000 | 0;

    if (currentTime > legit.iat && currentTime < legit.exp)
        return true;
    return false;
}
