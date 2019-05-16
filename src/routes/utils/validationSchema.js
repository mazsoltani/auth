const Joi = require('@hapi/joi');
const sn = require('../../static/names.json');


const passwordValidation = Joi.string().required().regex(/^[a-zA-Z0-9!@#$%^&*]{8,}$/);
const emailValidation = Joi.string().required().email({ minDomainSegments: 2});
const roleValidation = Joi.string().required().valid([sn.adminRole, sn.userRole, sn.guestRole]).insensitive();
const tokenValidation = Joi.string().required();

module.exports = {
    login: Joi.object({
        email : emailValidation,
        password : passwordValidation
    })
    ,register: Joi.object({
        email : emailValidation,
        password : passwordValidation
    })
    ,changePassword: Joi.object({
        password : passwordValidation,
        newPassword : passwordValidation
    })
    ,changeRole: Joi.object({
        email : emailValidation,
        role : roleValidation
    })
    ,validateToken: Joi.object({
        token: tokenValidation
    })
}