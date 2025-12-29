const User = require('../models/User');
const { uploadStream } = require('../services/cloudinary');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.avatarURL) updates.avatarURL = req.body.avatarURL;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

// upload avatar via base64 or file buffer (multipart handled elsewhere)
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file && !req.body.avatar) return res.status(400).json({ message: 'No avatar provided' });
    if (req.file) {
      // stream to cloudinary
      const streamifier = require('streamifier');
      const stream = uploadStream({ folder: 'avatars' }, async (err, result) => {
        try{
          if (err) { console.error('Cloudinary upload error:', err); return next(err); }
          const user = await User.findByIdAndUpdate(req.user.id, { avatarURL: result.secure_url }, { new: true }).select('-password');
          res.json({ user });
        }catch(e){ console.error(e); next(e); }
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
      return;
    }
    // avatar in body (data url)
    const data = req.body.avatar;
    // cloudinary upload from data
    const cloudinary = require('cloudinary').v2;
    const result = await cloudinary.uploader.upload(data, { folder: 'avatars' });
    const user = await User.findByIdAndUpdate(req.user.id, { avatarURL: result.secure_url }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) { next(err); }
};

module.exports = { getMe, updateMe, uploadAvatar };
