const bcrypt = require('bcrypt');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EmployeeDocuments = require('../models/EmployeeDocuments');

// Templates for required docs per experience level
const REQUIRED_DOCS = {
  fresher: [
    { key: 'aadhar', label: 'Aadhaar Card' },
    { key: 'pan', label: 'PAN Card' },
    { key: 'photo', label: 'Passport Size Photograph' },
    { key: 'qualification', label: 'Highest Qualification Certificate' },
    { key: 'offerLetter', label: 'Signed Offer Letter' },
    { key: 'emergencyContact', label: 'Emergency Contact Details' },
    { key: 'currentAddress', label: 'Current Address' }
  ],
  experienced: [
    { key: 'aadhar', label: 'Aadhaar Card' },
    { key: 'pan', label: 'PAN Card' },
    { key: 'photo', label: 'Passport Size Photograph' },
    { key: 'qualification', label: 'Highest Qualification Certificate' },
    { key: 'experienceLetter', label: 'Experience Letter (Previous Employer)' },
    { key: 'relievingLetter', label: 'Relieving Letter' },
    { key: 'paySlips', label: 'Last 3 Months Pay Slips' },
    { key: 'pfUan', label: 'PF UAN Number' },
    { key: 'form11', label: 'Form 11 (PF Declaration)' },
    { key: 'form16', label: 'Form 16 (if joining mid-financial year)' },
    { key: 'offerLetter', label: 'Signed Offer Letter' },
    { key: 'nda', label: 'NDA / Confidentiality Agreement' },
    { key: 'codeOfConduct', label: 'Code of Conduct Acceptance' },
    { key: 'backgroundConsent', label: 'Background Verification Consent' },
    { key: 'emergencyContact', label: 'Emergency Contact Details' },
    { key: 'currentAddress', label: 'Current Address' },
    { key: 'permanentAddress', label: 'Permanent Address' }
  ]
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, password, experienceLevel } = req.body;
    const createdBy = req.user.id;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const pass = password || Math.random().toString(36).slice(2,10);
    const hashed = await bcrypt.hash(pass, 10);
    const employee = await User.create({ name, email, phone, password: hashed, role: 'employee', createdBy });
    // initialize employee documents with required docs based on experience level
    const level = experienceLevel === 'experienced' ? 'experienced' : 'fresher';
    const required = REQUIRED_DOCS[level] || REQUIRED_DOCS.fresher;
    await EmployeeDocuments.create({ employeeId: employee._id, experienceLevel: level, requiredDocs: required, uploadedDocs: [], completionPercent: 0 });
    await Notification.create({ userId: createdBy, title: 'Employee added', description: `Employee ${name} created` });
    res.json({ employee, tempPassword: pass });
  } catch (err) { next(err); }
};

const listEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee', createdBy: req.user.id });
    // attach onboarding progress from EmployeeDocuments
    const withProgress = await Promise.all(employees.map(async emp => {
      const docs = await EmployeeDocuments.findOne({ employeeId: emp._id });
      return { ...emp.toObject(), onboarding: { completionPercent: docs?.completionPercent || 0, experienceLevel: docs?.experienceLevel || 'fresher' } };
    }));
    res.json({ employees: withProgress });
  } catch (err) { next(err); }
};

const getEmployeeDocs = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const docs = await EmployeeDocuments.findOne({ employeeId });
    res.json({ docs });
  } catch (err) { next(err); }
};

const remindEmployee = async (req, res, next) => {
  try {
    const employeeId = req.params.id;
    const message = req.body.message || 'Please complete your onboarding tasks.\nThis is a reminder from HR.';
    // create a notification for the employee
    await Notification.create({ userId: employeeId, title: 'Reminder from HR', description: message });
    // optionally create a chat message from HR -> employee
    const Chat = require('../models/Chat');
    await Chat.create({ senderId: req.user.id, receiverId: employeeId, message, read: false });
    res.json({ success: true, message: 'Reminder sent' });
  } catch (err) { next(err); }
};

module.exports = { createEmployee, listEmployees, getEmployeeDocs, remindEmployee };
