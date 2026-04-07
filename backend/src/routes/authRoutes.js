const express = require('express');
const router = express.Router();
const { register, login, setupPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/setup-password', setupPassword);

module.exports = router;
