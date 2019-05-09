const fs = require('fs');
const jwt = require('jsonwebtoken');

// use 'utf8' to get string instead of byte array  (512 bit key)
const privateKEY = fs.readFileSync('./src/jwt/private.key', 'utf8');
const publicKEY = fs.readFileSync('./src/jwt/public.key', 'utf8');

const fumServerIssuer = "FUM-Elect Server";
const fumClientIssuer = "FUM-Elect Client";
const validityPeriod = "1d";
const signAlgorithm = "RS256";

module.exports = {
    sign: (payload, $Options) => {
        const signOptions = {
            issuer: fumServerIssuer,
            subject: $Options.subject,
            audience: fumClientIssuer,
            expiresIn: validityPeriod,
            algorithm: signAlgorithm
        };
        return jwt.sign(payload, privateKEY, signOptions);
    },

    verify: (token, $Option) => {
        const verifyOptions = {
            issuer: fumServerIssuer,
            subject: $Option.subject,
            audience: fumClientIssuer,
            expiresIn: validityPeriod,
            algorithm: [signAlgorithm]
        };

        try {
            return jwt.verify(token, publicKEY, verifyOptions);
        } catch (err) {
            return false;
        }
    },

    decode: (token) => {
        return jwt.decode(token, {
            complete: true
        }); // returns null if token is invalid
    }
}