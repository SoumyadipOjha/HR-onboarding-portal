const multer = require('multer');
const path = require('path');

// Use memory storage so we can forward file buffer to cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname); // Debug log
  
  // Accept images and pdfs
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf'];
  
  if (allowedTypes.includes(ext)) {
    console.log('File type accepted:', ext);
    cb(null, true);
  } else {
    console.log('File type rejected:', ext);
    cb(new Error(`Unsupported file type: ${ext}. Only ${allowedTypes.join(', ')} are allowed.`), false);
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