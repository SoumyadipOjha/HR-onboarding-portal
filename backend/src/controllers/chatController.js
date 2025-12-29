const Chat = require('../models/Chat');
const mongoose = require('mongoose');

const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const chat = await Chat.create({ senderId: req.user.id, receiverId, message, read: false });
    res.json({ chat });
  } catch (err) { next(err); }
};

const getMessages = async (req, res, next) => {
  try {
    const { withUserId } = req.query;
    const userId = req.user.id;
    const msgs = await Chat.find({ $or: [
      { senderId: userId, receiverId: withUserId },
      { senderId: withUserId, receiverId: userId }
    ]}).sort('timestamp');
    res.json({ msgs });
  } catch (err) { next(err); }
};

// mark messages from withUserId -> current user as read
const markRead = async (req, res, next) => {
  try {
    const { withUserId } = req.body;
    await Chat.updateMany({ senderId: withUserId, receiverId: req.user.id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// get unread counts grouped by sender for current user
const unreadCounts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.json({ counts: {} });
    const userObj = mongoose.Types.ObjectId(userId);
    const agg = await Chat.aggregate([
      { $match: { receiverId: userObj, read: false } },
      { $group: { _id: '$senderId', count: { $sum: 1 } } }
    ]);
    const map = {};
    agg.forEach(a => { map[a._id.toString()] = a.count; });
    res.json({ counts: map });
  } catch (err) { next(err); }
};

// returns contact list depending on role: HR gets their employees, employee gets their HR
const getContacts = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'hr') {
      const employees = await User.find({ createdBy: user._id, role: 'employee' }).select('-password');
      return res.json({ contacts: employees });
    }
    if (user.role === 'employee') {
      if (!user.createdBy) return res.json({ contacts: [] });
      const hr = await User.findById(user.createdBy).select('-password');
      return res.json({ contacts: hr ? [hr] : [] });
    }
    // admin or others - return all users as contacts
    const others = await User.find({ _id: { $ne: user._id } }).select('-password');
    return res.json({ contacts: others });
  } catch (err) { next(err); }
};

module.exports = { sendMessage, getMessages, getContacts, markRead, unreadCounts };
