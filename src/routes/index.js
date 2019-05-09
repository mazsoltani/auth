const express = require('express');
const router = express.Router();

const rm = require('./../static/response_messages.json')

router.get('/heartbeat', function(req, res, next) {
  res.status(rm.heartbeat.code).json(rm.heartbeat.msg);
});

module.exports = router;
