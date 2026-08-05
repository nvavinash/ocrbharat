const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Service to call Python FastAPI PaddleOCR microservice
 * @param {string} filePath - Path to the saved image file
 * @returns {Promise<{success: boolean, ocrText: string, error?: string}>}
 */
const extractTextFromImage = async (filePath) => {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, '..', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found at path: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const fileName = path.basename(absolutePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('image', blob, fileName);

  const pythonOcrUrl = process.env.PYTHON_OCR_URL || 'http://localhost:8000/ocr';

  const response = await axios.post(pythonOcrUrl, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60-second timeout for PaddleOCR processing
  });

  return response.data;
};

module.exports = {
  extractTextFromImage,
};
