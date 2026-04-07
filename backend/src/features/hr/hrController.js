const bcrypt = require('bcrypt');
const User = require('../user/User');
const Notification = require('../../core/models/Notification');
const EmployeeDocuments = require('../../core/models/EmployeeDocuments');

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
    
    // Generate secure setup token
    const crypto = require('crypto');
    const sendEmail = require('../../core/utils/sendEmail');
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const employee = await User.create({ 
      name, 
      email, 
      phone, 
      password: hashed, 
      role: 'employee', 
      createdBy,
      resetPasswordToken,
      resetPasswordExpire
    });
    
    // initialize employee documents with required docs based on experience level
    const level = experienceLevel === 'experienced' ? 'experienced' : 'fresher';
    const required = REQUIRED_DOCS[level] || REQUIRED_DOCS.fresher;
    await EmployeeDocuments.create({ employeeId: employee._id, experienceLevel: level, requiredDocs: required, uploadedDocs: [], completionPercent: 0 });
    await Notification.create({ userId: createdBy, title: 'Employee added', description: `Employee ${name} created` });
    
    // Create setup URL (Assuming frontend is hosted on process.env.FRONTEND_URL or locally)
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const setupUrl = `${frontendURL}/setup-password?token=${resetToken}`;

    const messageHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0; }
          .container { max-w: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 40px 30px; text-align: center; }
          .content h2 { margin-top: 0; color: #1e293b; font-size: 22px; }
          .content p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px; }
          .btn-container { margin: 35px 0; }
          .btn { display: inline-block; background-color: #0ea5e9; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.25); text-transform: uppercase; letter-spacing: 1px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #94a3b8; font-size: 13px; }
          .footer a { color: #0ea5e9; text-decoration: none; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HireFloww</h1>
          </div>
          <div class="content">
            <h2>Welcome to the team, ${name}!</h2>
            <p>Your official account has been successfully provisioned as <strong>EMPLOYEE</strong>.</p>
            <p>To securely access your dashboard and start your onboarding journey, you must set up your login credentials.</p>
            <div class="btn-container">
              <a href="${setupUrl}" class="btn">Reset Your Password</a>
            </div>
            <p style="font-size: 14px; margin-bottom: 0;">This secure link is uniquely generated for you and will expire in exactly 24 hours.</p>
          </div>
          <div class="footer">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${setupUrl}">${setupUrl}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await sendEmail({
        email: employee.email,
        subject: 'Set up your HireFloww Account',
        html: messageHTML
      });
    } catch (err) {
      console.log('Email could not be sent', err);
    }
    
    res.json({ employee, tempPassword: pass, message: 'Employee created and setup email sent.' });
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
    const Chat = require('../chat/Chat');
    await Chat.create({ senderId: req.user.id, receiverId: employeeId, message, read: false });
    res.json({ success: true, message: 'Reminder sent' });
  } catch (err) { next(err); }
};

module.exports = { createEmployee, listEmployees, getEmployeeDocs, remindEmployee };
