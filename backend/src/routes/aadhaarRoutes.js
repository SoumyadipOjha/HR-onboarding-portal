const express = require('express');
const router = express.Router();
const { send, verify } = require('../controllers/aadhaarController');
const { authEmployee } = require('../middlewares/auth');

router.post('/send', authEmployee, send);
router.post('/verify', authEmployee, verify);

module.exports = router;
