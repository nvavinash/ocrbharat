const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `ocr-${uniqueSuffix}${ext}`);
  },
});

// File filter (accept jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP images.');
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

// Wrapper middleware to catch Multer specific errors (e.g. LIMIT_FILE_SIZE)
const handleUpload = (req, res, next) => {
  const singleUpload = upload.single('image');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'File size too large. Maximum allowed size is 20MB.',
          });
        }
        return res.status(400).json({
          success: false,
          error: `Upload error: ${err.message}`,
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        error: err.message || 'File upload failed.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please select an image.',
      });
    }

    next();
  });
};

module.exports = handleUpload;
