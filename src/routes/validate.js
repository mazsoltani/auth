const express = require('express');
const router = express.Router();

const rm = require('../static/response_messages.json');
const tokenResponse = require('./utils/parseToken').tokenResponse;


router.get('/token', (req, res, next) => {

    const { token } = req.query;

    if (!token) {
        return res.status(rm.invalidParameters.code).json(rm.invalidParameters.msg);
    }

    tokenResponse(token, res, next, () => {
        res.status(rm.loggedIn.code).json(rm.loggedIn.msg);
    });
})


module.exports = router;