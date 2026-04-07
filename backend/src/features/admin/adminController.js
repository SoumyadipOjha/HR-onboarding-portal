const User = require('../user/User');
const bcrypt = require('bcrypt');

const crypto = require('crypto');
const sendEmail = require('../../core/utils/sendEmail');

// Admin can create users of any role: admin, hr, employee
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'name, email and role are required' });
    if (!['admin','hr','employee'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    
    // Create random password if not provided
    const plain = password || Math.random().toString(36).slice(2,10);
    const hashed = await bcrypt.hash(plain, 10);
    
    // Generate secure setup token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const payload = { 
      name, 
      email, 
      phone, 
      password: hashed, 
      role,
      resetPasswordToken,
      resetPasswordExpire
    };
    
    // If admin creates an employee, mark createdBy as admin
    if (role === 'employee') payload.createdBy = req.user.id;
    const user = await User.create(payload);

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
            <p>Your official account has been successfully provisioned as <strong>${role.toUpperCase()}</strong>.</p>
            <p>To securely access your dashboard and start your journey with us, you must set up your login credentials.</p>
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
        email: user.email,
        subject: 'Set up your HireFloww Account',
        html: messageHTML
      });
    } catch (err) {
      console.log('Email could not be sent', err);
      // We don't fail user creation if email fails, just continue
    }

    // return created user and plain password just in case email fails
    const out = { id: user._id, name: user.name, email: user.email, role: user.role, tempPassword: plain };
    res.json({ user: out, message: 'User created and setup email sent.' });
  } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    // Attach onboarding progress for employees
    const EmployeeDocuments = require('../../core/models/EmployeeDocuments');
    const usersWithProgress = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();
      
      if (user.role === 'employee') {
        const docs = await EmployeeDocuments.findOne({ employeeId: user._id });
        userObj.onboarding = {
          completionPercent: docs?.completionPercent || 0,
          experienceLevel: docs?.experienceLevel || 'fresher'
        };
      }
      
      return userObj;
    }));
    
    res.json({ users: usersWithProgress });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting self (though UI should prevent this locally)
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createUser, listUsers, deleteUser };
