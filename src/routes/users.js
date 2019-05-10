const express = require('express');
const router = express.Router();

const User = require('../models/user');
const LoggedIn = require('../models/loggedIn');

const jwt = require('../jwt/jwtService');

const rm = require('./../static/response_messages.json');
const sn = require('./../static/names.json');

router.post('/register', (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    let newUser = new User({
        email: email
        ,password: password
        ,role: sn.userRole
    });

    User.createUser(newUser, (err, usr) => {
        if(err || !usr){
            if(err.code === sn.duplicateError){
                return res.status(rm.emailExists.code).json(rm.emailExists.msg);
            }
            return next(err);
        }

        res.status(rm.registerSuccessful.code).json(rm.registerSuccessful.msg);
    });
});

router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    User.getUserByEmail(email, (err, user) => {
        if(err){
            return next(err);
        }
        if(!user){
            return res.status(rm.invalidUserPass.code).json(rm.invalidUserPass.msg);
        }
        User.comparePassword(password, user.password, (err) => {
            if(err){
                return next(err);
            }
            if(!isMatched){
                return res.status(rm.invalidUserPass.code).json(rm.invalidUserPass.msg);
            }

            let payload = { email };
            let signOptions = { subject:  email };
            let token = jwt.sign(payload, signOptions);
            let newLoggedIn = new LoggedIn({ token });

            LoggedIn.createLoggedIn(newLoggedIn, (err) => {
                if(err){
                    if(err.code === sn.duplicateError)
                        return res.status(rm.tooManyRequests.code).json(rm.tooManyRequests.msg);
                    return next(err);
                }

                var body = {
                    token
                };
                res.status(rm.loggedInSuccess.code).json(body);
            });
        });
    });
});

router.get('/verify/loggedIn', (req, res, next) => {
    const { token } = req.body;

    if(!token){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    tokenResponse(token, res, next, () => {
        res.status(rm.loggedIn.code).json(rm.loggedIn.msg);
    });
});

router.put('/changePassword', (req, res, next) => {
    const { password, newPassword } = req.body;
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer
    const email = jwt.decode(token).payload.email;

    if(!password || !newPassword){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    User.getUserByEmail(email, (err, user) => {
        if(err){
            return next(err);
        }
        if(!user){
            return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
        }

        User.comparePassword(password, user.password, (err) => {
            if(err){
                return next(err);
            }
            if(!isMatched){
                return res.status(rm.invalidPassword.code).json(rm.invalidPassword.msg);
            }

            User.changePassword(email, password, newPassword, (err, usr) => {
                if(err || !usr){
                    return next(err);
                }

                return res.status(rm.changePasswordSuccess.code).json(rm.changePasswordSuccess.msg);
            });
        });
    });
});

router.get('/role', (req, res, next) => {
    const { email } = req.body;
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer

    if(!email){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    tokenResponse(token, res, next, () => {
        User.getUserByEmail(email, (err, user) => {
            if(err){
                return next(err);
            }
            if(!user){
                return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
            }

            var body = {
                [sn.email]: user.email
                ,[sn.role] : user.role
            };
            res.status(rm.loggedIn.code).json(body);
        });
    });
});

router.put('/role', (req, res, next) => {
    const { email, role} = req.body;
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer

    if(!email || !role){
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    tokenResponse(token, res, next, (token) => {
        User.getUserByEmail(jwt.decode(token).payload.email, (err, user) => { // get email from jwt
            if(err){
                return next(err);
            }
            if(!user){
                return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
            }
            if(role !== sn.adminRole && role !== sn.userRole && role !== sn.guestRole){
                return res.status(rm.notAcceptableRole.code).json(rm.notAcceptableRole.msg);
            }
            if(user.role != sn.adminRole){ // check if the requester is actually an admin
                return res.status(rm.notAuthorized.code).json(rm.notAuthorized.msg);
            }

            User.updateRole(email, role, (err) => {
                if(err){
                    return next(err);
                }

                res.status(rm.changeRoleSuccess.code).json(rm.changeRoleSuccess.msg);
            });
        });
    });
});

router.delete('/logout', (req, res, next) => {
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer

    tokenResponse(token, res, next, (token) => {
        LoggedIn.removeRecordByToken(token, (err) => {
            if(err){
                return next(err);
            }
            res.status(rm.loggedOutSuccess.code).json(rm.loggedOutSuccess.msg);
        });
    });
});

const tokenResponse = (token, res, next, func) => {
    LoggedIn.getRecordByToken(token, (err, record) => {
        if(err){
            return next(err);
        }
        if(!record){
            return res.status(rm.notLoggedIn.code).json(rm.notLoggedIn.msg);
        }
        if(!validateToken(token)){
            return res.status(rm.sessionInvalid.code).json(rm.sessionInvalid.msg);
        }
        func(token);
    });
}

const validateToken = (token) => { // checks if the jwt has expired
    const verifyOptions = {
        issuer: jwt.fumServerIssuer
        ,audience: jwt.fumClientIssuer
    };

    const legit = jwt.verify(token, verifyOptions);
    currentTime = new Date().getTime() / 1000 | 0;

    if (currentTime > legit.iat && currentTime < legit.exp)
        return true;
    return false;
}

module.exports = router;