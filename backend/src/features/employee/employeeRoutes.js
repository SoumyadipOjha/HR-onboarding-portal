const express = require('express');
const router = express.Router();
const { uploadDocs, getStatus, uploadFile } = require('./employeeController');
const { authEmployee } = require('../../core/middlewares/auth');
const upload = require('../../core/middlewares/upload');

router.post('/upload', authEmployee, uploadDocs);
// multipart/form-data route: accept any named fields (keys will be used as document keys)
router.post('/upload-file', authEmployee, upload.any(), uploadFile);
router.get('/status/:id?', authEmployee, getStatus);

module.exports = router;
