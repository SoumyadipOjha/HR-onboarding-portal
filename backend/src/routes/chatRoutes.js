const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getContacts, markRead, unreadCounts } = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');

// messaging endpoints (authenticated users)
router.post('/send', auth, sendMessage);
router.get('/', auth, getMessages);
router.get('/contacts', auth, getContacts);
router.post('/mark-read', auth, markRead);
router.get('/unread-counts', auth, unreadCounts);

module.exports = router;
