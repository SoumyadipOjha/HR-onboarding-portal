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
    console.error('[cloudinaryTest] error uploading to Cloudinary:', err && err.message);
    // Try to return helpful Cloudinary error details to the caller for faster debugging
    const status = (err && err.http_code) || 500;
    const body = {
      ok: false,
      message: err && err.message ? err.message : 'Unknown Cloudinary error',
      details: err && err.error ? err.error : undefined,
      request_id: err && err.request_id ? err.request_id : undefined,
    };
    return res.status(status).json(body);
  }
};

module.exports = { cloudinaryTest };
