const express = require('express');
const router = express.Router();

const Joi = require('@hapi/joi');
const schemas = require('./utils/validationSchema');

const rm = require('../static/response_messages.json');
const tokenResponse = require('./utils/parseToken').tokenResponse;


router.get('/token', (req, res, next) => {

    const { error } = Joi.validate(req.query, schemas.validateToken);

    if (error) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    const { token } = req.query;
    
    tokenResponse(token, res, next, () => {
        res.status(rm.loggedIn.code).json(rm.loggedIn.msg);
    });
})


module.exports = router;