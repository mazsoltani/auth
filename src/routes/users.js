const express = require('express');
const router = express.Router();

const Joi = require('@hapi/joi');
const schemas = require('../utils/validationSchema');

const User = require('../models/user');
const LoggedIn = require('../models/loggedIn');

const jwt = require('../jwt/jwtService');

const rm = require('../static/responseMessages');
const sn = require('../static/names');

router.post('/register', (req, res, next) => {
    const {
        error
    } = Joi.validate(req.body, schemas.register);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const {
        email,
        password
    } = req.body;

    let newUser = new User({
        email: email,
        password: password,
        role: sn.userRole,
        verified: false
    });

    User.createUser(newUser, (err, usr) => {
        if (err || !usr) {
            if (err.code === sn.duplicateError) {
                return res.status(rm.emailExists.code).json(rm.emailExists.msg);
            }
            return next(err);
        }

        return res.status(rm.registerSuccessful.code).json(rm.registerSuccessful.msg);
    });
});

router.post('/login', (req, res, next) => {
    const {
        error
    } = Joi.validate(req.body, schemas.login);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const {
        email,
        password
    } = req.body;

    User.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(rm.invalidUserPass.code).json(rm.invalidUserPass.msg);
        }
        User.comparePassword(password, user.password, (err) => {
            if (err) {
                return next(err);
            }
            if (!isMatched) {
                return res.status(rm.invalidUserPass.code).json(rm.invalidUserPass.msg);
            }

            let payload = {
                email
            };
            let signOptions = {
                subject: email
            };
            let token = jwt.sign(payload, signOptions);
            let newLoggedIn = new LoggedIn({
                token
            });

            LoggedIn.createLoggedIn(newLoggedIn, (err) => {
                if (err) {
                    if (err.code === sn.duplicateError)
                        return res.status(rm.tooManyRequests.code).json(rm.tooManyRequests.msg);
                    return next(err);
                }

                var body = {
                    token
                };
                return res.status(rm.loggedInSuccess.code).json(body);
            });
        });
    }).catch((err) => {
        return next(err);
    });
});
router.put('/changePassword', (req, res, next) => {
    const {
        error
    } = Joi.validate(req.body, schemas.changePassword);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
    const {
        password,
        newPassword
    } = req.body;

    const {
        email
    } = jwt.decode(token).payload;

    User.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
        }

        User.comparePassword(password, user.password, (err) => {
            if (err) {
                return next(err);
            }
            if (!isMatched) {
                return res.status(rm.invalidPassword.code).json(rm.invalidPassword.msg);
            }

            User.changePassword(user, newPassword, (err, usr) => {
                if (err || !usr) {
                    return next(err);
                }

                return res.status(rm.changePasswordSuccess.code).json(rm.changePasswordSuccess.msg);
            });
        });
    }).catch((err) => {
        return next(err);
    });
});

router.get('/list', (req, res, next) => {
    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
    // console.log(req.query);
    User.getUsers((err, result) => {
        if (err) {
            return next(err);
        }

        let body = {
            usersList: []
        };

        result.forEach(({
            email,
            role
        }) => {
            let user = {
                [sn.email]: email,
                [sn.role]: role
            };

            body.usersList.push(user);
            // var newList = Object.assign(JSON.stringify(newList), user);
            // console.log(body);
        });

        return res.status(rm.loggedIn.code).json(body);
    });
});

router.get('/role', (req, res, next) => {
    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
    User.getUserByEmail(jwt.decode(token).payload.email).then((user) => {
        if (!user) {
            return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
        }

        var body = {
            [sn.email]: user.email,
            [sn.role]: user.role
        };
        return res.status(rm.loggedIn.code).json(body);
    }).catch((err) => {
        return next(err);
    });
});

router.put('/role', (req, res, next) => {
    const {
        error
    } = Joi.validate(req.body, schemas.changeRole);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const {
        email,
        role
    } = req.body;
    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer

    User.getUserByEmail(jwt.decode(token).payload.email).then((tokenUser) => { // get the user of token
        if (!tokenUser) {
            return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
        }
        if (tokenUser.role != sn.adminRole) { // check if the requester is actually an admin
            return res.status(rm.notAuthorized.code).json(rm.notAuthorized.msg);
        }
        if (role !== sn.adminRole && role !== sn.userRole && role !== sn.guestRole) {
            return res.status(rm.notAcceptableRole.code).json(rm.notAcceptableRole.msg);
        }
        User.getUserByEmail(email).then((requestUser) => { // get the user of email
            if (!requestUser) {
                return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
            }
            if (requestUser.email === sn.adminEmail) {
                return res.status(rm.primaryAdminChangeRoleFail.code).json(rm.primaryAdminChangeRoleFail.msg);
            }
            if (requestUser.role === role) {
                return res.status(rm.roleNotChanged.code).json(rm.roleNotChanged.msg);
            }

            User.updateRole(requestUser, role, () => {
                return res.status(rm.changeRoleSuccess.code).json(rm.changeRoleSuccess.msg);
            });
        }).catch((err) => {
            return next(err);
        });
    }).catch((err) => {
        return next(err);
    });
});

router.delete('/logout', (req, res, next) => {
    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
    LoggedIn.removeRecordByToken(token, (err) => {
        if (err) {
            return next(err);
        }
        return res.status(rm.loggedOutSuccess.code).json(rm.loggedOutSuccess.msg);
    });
});

router.delete('/delete', (req, res, next) => {
    const {
        error
    } = Joi.validate(req.body, schemas.deleteUser);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
    const {
        password
    } = req.body;

    const {
        email
    } = jwt.decode(token).payload;

    User.getUserByEmail(email).then((user) => {
        if (!user) {
            return res.status(rm.emailNotFound.code).json(rm.emailNotFound.msg);
        }

        User.comparePassword(password, user.password, (err) => {
            if (err) {
                return next(err);
            }
            if (!isMatched) {
                return res.status(rm.invalidPassword.code).json(rm.invalidPassword.msg);
            }
            if (user.email === sn.adminEmail) {
                return res.status(rm.primaryAdminDeleteFail.code).json(rm.primaryAdminDeleteFail.msg);
            }

            User.removeUserByEmail(email, (err, rec) => {
                if (err || !rec) {
                    return next(err);
                }

                return res.status(rm.userDeletedSuccess.code).json(rm.userDeletedSuccess.msg);
            });
        });
    }).catch((err) => {
        return next(err);
    });
});

module.exports = router;