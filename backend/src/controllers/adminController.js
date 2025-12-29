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
    res.json({ users });
  } catch (err) { next(err); }
};

module.exports = { createUser, listUsers };
