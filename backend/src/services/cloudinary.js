const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = async (path, options = {}) => {
  const opts = { resource_type: 'auto', ...options };
  return cloudinary.uploader.upload(path, opts);
};

// expose uploader and upload_stream helper for stream uploads
const uploadStream = (options = {}, callback) => {
  const opts = { resource_type: 'auto', ...options };
  return cloudinary.uploader.upload_stream(opts, callback);
};

module.exports = { upload, uploadStream };
