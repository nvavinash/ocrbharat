const express = require('express');
const router = express.Router();
const handleUpload = require('../middlewares/uploadMiddleware');
const { processUpload } = require('../controllers/ocrController');

// POST /api/upload - Handle image upload
router.post('/upload', handleUpload, processUpload);

module.exports = router;
