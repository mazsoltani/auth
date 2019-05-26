const LoggedIn = require( '../models/loggedIn');
const rm = require('../static/responseMessages');
const jwt = require('../jwt/jwtService');

module.exports.tokenResponse = async (token, res, next) => {
    try {
        let result = await LoggedIn.getRecordByToken(token);
        if (!result) {
            res.status(rm.notLoggedIn.code).json(rm.notLoggedIn.msg);
            return false;
        }
        if (!validateToken(token)) {
            res.status(rm.sessionInvalid.code).json(rm.sessionInvalid.msg);
            return false;
        }
    } catch (err) {
        next(err);
        return false;
    }
    return true;
}

const validateToken = (token) => { // checks if the jwt has expired
    const verifyOptions = {
        issuer: jwt.fumServerIssuer,
        audience: jwt.fumClientIssuer
    };

    const legit = jwt.verify(token, verifyOptions);
    currentTime = new Date().getTime() / 1000 | 0;

    if (currentTime > legit.iat && currentTime < legit.exp)
        return true;
    return false;
}
