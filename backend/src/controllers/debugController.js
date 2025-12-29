const { upload } = require('../services/cloudinary');

// 1x1 PNG base64 (very small) used to validate Cloudinary credentials
const debugImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const dataUri = 'data:image/png;base64,' + debugImageBase64;

const cloudinaryTest = async (req, res, next) => {
  try {
    console.log('[cloudinaryTest] uploading test image to Cloudinary...');
    const result = await upload(dataUri, { folder: 'hr_onboarding/debug' });
    console.log('[cloudinaryTest] upload result:', result && result.secure_url);
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('[cloudinaryTest] error uploading to Cloudinary:', err);
    return next(err);
  }
};

module.exports = { cloudinaryTest };
