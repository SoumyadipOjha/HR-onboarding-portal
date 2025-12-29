const express = require('express');
const router = express.Router();
const { createUser, listUsers } = require('../controllers/adminController');
const { authAdmin } = require('../middlewares/auth');

// Create any user (admin, hr, employee). Body: { name, email, phone, password?, role }
router.post('/create-user', authAdmin, createUser);
router.get('/users', authAdmin, listUsers);

module.exports = router;
