const path = require('path');

/**
 * Controller to handle image upload and process OCR workflow.
 * POST /api/upload
 */
const processUpload = async (req, res, next) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    console.log(`[Upload] Image received: ${uploadedFile.filename} (${uploadedFile.size} bytes)`);

    // Temporary placeholder response until OCR service (Step 5) and Ollama service (Step 6) are integrated
    const mockOcrText = "नमस्ते भारत यह हिंदी हस्तलेखन परीक्षण है";
    const mockCorrectedText = "नमस्ते भारत, यह हिंदी हस्तलेखन परीक्षण है।";

    return res.status(200).json({
      success: true,
      ocrText: mockOcrText,
      correctedText: mockCorrectedText,
      file: {
        filename: uploadedFile.filename,
        path: `/uploads/${uploadedFile.filename}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processUpload,
};
