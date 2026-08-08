const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

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

  const fileName = path.basename(absolutePath);

  // Use form-data with a read stream — the correct Node.js way to POST multipart
  const formData = new FormData();
  formData.append('image', fs.createReadStream(absolutePath), fileName);

  // const pythonOcrUrl = process.env.PYTHON_OCR_URL || '"http://127.0.0.1:8000/ocr"';
  const pythonOcrUrl = 'http://127.0.0.1:8000/ocr';

  const response = await axios.post(pythonOcrUrl, formData, {
    headers: {
      ...formData.getHeaders(), // ensures correct Content-Type + boundary
    },
    timeout: 60000,
  });

  return response.data;
};

module.exports = {
  extractTextFromImage,
};
