const { extractTextFromImage } = require('../services/ocrService');

/**
 * Controller for Upload & OCR API (Step 4 & Step 5)
 * POST /api/upload
 */
const processUpload = async (req, res, next) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'Missing image. Please upload an image file.',
      });
    }

    // Call Python PaddleOCR Service
    const ocrResult = await extractTextFromImage(uploadedFile.path);

    if (!ocrResult || ocrResult.success === false) {
      return res.status(500).json({
        success: false,
        message: ocrResult?.error || 'Failed to extract Hindi text from image.',
        ocrText: '',
      });
    }

    const relativePath = `uploads/${uploadedFile.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded and processed with PaddleOCR successfully.',
      ocrText: ocrResult.ocrText || '',
      filePath: relativePath,
      fileName: uploadedFile.filename,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processUpload,
};


