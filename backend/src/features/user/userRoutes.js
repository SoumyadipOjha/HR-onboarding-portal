const express = require('express');
const router = express.Router();
const { getMe, updateMe, uploadAvatar } = require('./userController');
const { auth } = require('../../core/middlewares/auth');
const upload = require('../../core/middlewares/upload');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
