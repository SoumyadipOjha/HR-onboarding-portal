const User = require('../models/User');
const bcrypt = require('bcrypt');

// Admin can create users of any role: admin, hr, employee
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ message: 'name, email and role are required' });
    if (!['admin','hr','employee'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email exists' });
    const plain = password || Math.random().toString(36).slice(2,10);
    const hashed = await bcrypt.hash(plain, 10);
    const payload = { name, email, phone, password: hashed, role };
    // If admin creates an employee, mark createdBy as admin
    if (role === 'employee') payload.createdBy = req.user.id;
    const user = await User.create(payload);
    // return created user and plain password so admin can share credentials
    const out = { id: user._id, name: user.name, email: user.email, role: user.role, tempPassword: plain };
    res.json({ user: out });
  } catch (err) { next(err); }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    // Attach onboarding progress for employees
    const EmployeeDocuments = require('../models/EmployeeDocuments');
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
