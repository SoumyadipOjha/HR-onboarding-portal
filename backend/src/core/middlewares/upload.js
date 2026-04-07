const multer = require('multer');
const path = require('path');

// Use memory storage so we can forward file buffer to cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname); // Debug log
  
  // Accept images, pdfs and common document formats
  const origName = file.originalname || '';
  const ext = path.extname(origName).toLowerCase();
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf', '.doc', '.docx', '.docm', '.txt'];
  
  // fallback: also accept by mimetype for some edge cases
  const mime = (file.mimetype || '').toLowerCase();
  if (allowedTypes.includes(ext) || /pdf|word|officedocument|image|text/.test(mime)) {
    console.log('File type accepted:', ext || mime);
    cb(null, true);
  } else {
    console.log('File type rejected:', ext || mime);
    cb(new Error(`Unsupported file type: ${ext || mime}. Only ${allowedTypes.join(', ')} are allowed.`), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit (adjust as needed)
  }
});

module.exports = upload;