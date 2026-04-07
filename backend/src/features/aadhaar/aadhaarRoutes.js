const express = require('express');
const router = express.Router();
const { send, verify } = require('./aadhaarController');
const { authEmployee } = require('../../core/middlewares/auth');

router.post('/send', authEmployee, send);
router.post('/verify', authEmployee, verify);

module.exports = router;
