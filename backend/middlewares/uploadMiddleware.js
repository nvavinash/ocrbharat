const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `ocr-${uniqueSuffix}${ext}`);
  },
});

// File filter (accept pdf)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedExtensions.includes(ext) && mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF files are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Multer upload middleware (Max size: 20MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
  fileFilter: fileFilter,
});

// Middleware function to handle upload & error response
const handleUpload = (req, res, next) => {
  const singleUpload = upload.single('pdf');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size allowed is 20 MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Invalid file uploaded.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Missing PDF. Please select a PDF file to upload.',
      });
    }

    next();
  });
};

module.exports = handleUpload;

