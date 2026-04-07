const express = require('express');
const router = express.Router();
const { cloudinaryTest } = require('./debugController');

// GET /api/debug/cloudinary-test
router.get('/cloudinary-test', cloudinaryTest);

module.exports = router;
