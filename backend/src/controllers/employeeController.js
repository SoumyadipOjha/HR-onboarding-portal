const EmployeeDocuments = require('../models/EmployeeDocuments');
const Notification = require('../models/Notification');
const { upload: cloudinaryUpload, uploadStream: cloudinaryUploadStream } = require('../services/cloudinary');

const uploadDocs = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const existing = await EmployeeDocuments.findOne({ employeeId });
    const docs = existing || new EmployeeDocuments({ employeeId });
    // Accept JSON body fields that directly set uploaded docs (url strings)
    // e.g. { "aadhar": "https://..." }
    const keys = Object.keys(req.body || {});
    keys.forEach(k => {
      const val = req.body[k];
      if (!val) return;
      if (k === 'signature') { docs.signatureURL = val; return; }
      // mark uploaded doc
      const already = docs.uploadedDocs.find(d => d.key === k);
      if (already) { already.url = val; already.uploadedAt = new Date(); }
      else docs.uploadedDocs.push({ key: k, label: k, url: val, uploadedAt: new Date() });
    });
    if (req.body.otherDocs) docs.otherDocs = req.body.otherDocs;
    // recalc percent
    docs.completionPercent = calcCompletionPercent(docs);
    await docs.save();
    await Notification.create({ userId: req.user.id, title: 'Documents uploaded', description: 'Your documents were uploaded' });
    res.json({ docs });
  } catch (err) { next(err); }
};

// Upload single or multiple files via multer memory storage and forward to Cloudinary
const uploadFile = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    console.log('[uploadFile] invoked by user:', employeeId);
    console.log('[uploadFile] req.files type:', Array.isArray(req.files) ? 'array' : typeof req.files, ' count:', Array.isArray(req.files) ? req.files.length : Object.keys(req.files || {}).length);
    if (!req.files || Object.keys(req.files).length === 0) return res.status(400).json({ message: 'No files' });
    const uploadOps = [];
    // req.files may be an array (upload.any()) or an object (upload.fields())
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        const field = file.fieldname;
        console.log('[uploadFile] file:', field, file.originalname, file.mimetype, file.size);
        uploadOps.push(new Promise((resolve, reject) => {
          const streamifier = require('streamifier');
          const stream = cloudinaryUploadStream({ folder: 'hr_onboarding' }, (err, result) => {
            if (err) {
              console.error('[uploadFile] Cloudinary error for field', field, err);
              return reject(err);
            }
            if (!result || !result.secure_url) {
              console.error('[uploadFile] Cloudinary returned no secure_url for field', field, result);
              return reject(new Error('Cloudinary upload failed: no secure_url'));
            }
            console.log('[uploadFile] Cloudinary OK for field', field, result.secure_url);
            resolve({ field, url: result.secure_url });
          });
          try{
            streamifier.createReadStream(file.buffer).pipe(stream);
          }catch(streamErr){
            console.error('[uploadFile] stream pipe error for field', field, streamErr);
            return reject(streamErr);
          }
        }));
      });
    } else {
      Object.keys(req.files).forEach(field => {
        const files = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
        files.forEach(file => {
          console.log('[uploadFile] file:', field, file.originalname, file.mimetype, file.size);
          uploadOps.push(new Promise((resolve, reject) => {
            const streamifier = require('streamifier');
            const stream = cloudinaryUploadStream({ folder: 'hr_onboarding' }, (err, result) => {
              if (err) {
                console.error('[uploadFile] Cloudinary error for field', field, err);
                return reject(err);
              }
              if (!result || !result.secure_url) {
                console.error('[uploadFile] Cloudinary returned no secure_url for field', field, result);
                return reject(new Error('Cloudinary upload failed: no secure_url'));
              }
              console.log('[uploadFile] Cloudinary OK for field', field, result.secure_url);
              resolve({ field, url: result.secure_url });
            });
            try{
              streamifier.createReadStream(file.buffer).pipe(stream);
            }catch(streamErr){
              console.error('[uploadFile] stream pipe error for field', field, streamErr);
              return reject(streamErr);
            }
          }));
        });
      });
    }

    const results = await Promise.all(uploadOps);
    const docs = await EmployeeDocuments.findOne({ employeeId }) || new EmployeeDocuments({ employeeId });
    results.forEach(r => {
      // store in uploadedDocs with key = field
      const existing = docs.uploadedDocs.find(d => d.key === r.field);
      if (existing) { existing.url = r.url; existing.uploadedAt = new Date(); }
      else docs.uploadedDocs.push({ key: r.field, label: r.field, url: r.url, uploadedAt: new Date() });
      // also keep a copy in otherDocs for backward compatibility when field === 'other'
      if (r.field === 'other') docs.otherDocs = docs.otherDocs.concat([{ name: 'file', fileURL: r.url }]);
      // handle signature file specially
      if (r.field === 'signature') docs.signatureURL = r.url;
    });
    // recalc percent
    docs.completionPercent = calcCompletionPercent(docs);
    await docs.save();
    await Notification.create({ userId: req.user.id, title: 'Documents uploaded', description: 'Your documents were uploaded' });
    res.json({ docs });
  } catch (err) { next(err); }
};

const getStatus = async (req, res, next) => {
  try {
    const employeeId = req.params.id || req.user.id;
    const docs = await EmployeeDocuments.findOne({ employeeId });
    res.json({ docs });
  } catch (err) { next(err); }
};

// compute completion percent based on requiredDocs + signature
function calcCompletionPercent(docs){
  try{
    const required = (docs.requiredDocs || []).map(d => d.key);
    const uploaded = (docs.uploadedDocs || []).map(d => d.key);
    // signature is required for all
    const totalRequired = required.length + 1; // +1 for signature
    let done = 0;
    required.forEach(k => { if (uploaded.includes(k)) done++; });
    if (docs.signatureURL) done++;
    const percent = totalRequired === 0 ? 0 : Math.round((done / totalRequired) * 100);
    return percent;
  }catch(e){ return 0; }
}

// Note: using `uploadStream` from `src/services/cloudinary` which already configures Cloudinary via dotenv.

module.exports = { uploadDocs, uploadFile, getStatus };
