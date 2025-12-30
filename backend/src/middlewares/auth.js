const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (roles = []) => async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    if (roles.length && !roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) { next(err); }
};

const authAdmin = authMiddleware(['admin']);
const authHR = authMiddleware(['hr']);
const authEmployee = authMiddleware(['employee']);
const auth = authMiddleware([]); // any authenticated user

module.exports = { authAdmin, authHR, authEmployee, auth };
