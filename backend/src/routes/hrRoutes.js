const express = require('express');
const router = express.Router();
const { createEmployee, listEmployees, getEmployeeDocs, remindEmployee } = require('../controllers/hrController');
const { authHR } = require('../middlewares/auth');

router.post('/employee', authHR, createEmployee);
router.get('/employees', authHR, listEmployees);
router.get('/employee/:id/status', authHR, getEmployeeDocs);
router.post('/employee/:id/remind', authHR, remindEmployee);

module.exports = router;
