const express = require('express');
const router = express.Router();

const Joi = require('@hapi/joi');
const schemas = require('./utils/validationSchema');

const rm = require('../static/response_messages.json');
const tokenResponse = require('./utils/parseToken').tokenResponse;


router.get('/token', (req, res, next) => {
    const token = req.get('authorization').split(' ')[1]; // Extract the token from Bearer

    tokenResponse(token, res, next, () => {
        res.status(rm.loggedIn.code).json(rm.loggedIn.msg);
    });
})


module.exports = router;