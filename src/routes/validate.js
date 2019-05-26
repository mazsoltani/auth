const express = require('express');
const router = express.Router();

const rm = require('../static/responseMessages');

router.get('/token', (req, res, next) => {
    res.status(rm.loggedIn.code).json(rm.loggedIn.msg);
});

module.exports = router;