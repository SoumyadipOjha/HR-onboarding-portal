const express = require('express');
const router = express.Router();
const { getMe, updateMe, uploadAvatar } = require('../controllers/userController');
const { auth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.post('/me/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
