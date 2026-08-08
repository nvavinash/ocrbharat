const { extractTextFromImage } = require('../services/ocrService');
const { correctTextWithOllama } = require('../services/ollamaService');

/**
 * Controller for Upload, OCR & LLM Analysis Workflow
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

    // Step 5: Extract text via Python PaddleOCR Service
    let ocrText = '';
    try {
      const ocrResult = await extractTextFromImage(uploadedFile.path);

      // const ocrResult = await extractTextFromImage(uploadedFile.path);

      console.log("========== OCR RESULT ==========");
      console.log(ocrResult);
      console.log("================================");


      if (ocrResult && ocrResult.success) {
        ocrText = ocrResult.ocrText || '';
      }


      console.log("FINAL OCR TEXT:", ocrText);
      if (ocrResult && ocrResult.success) {
        ocrText = ocrResult.ocrText || '';
      }
    } catch (err) {
      console.warn(`[OCR Service Warning] ${err.message}`);
    }

    // Step 6: Process OCR text with Ollama Government Review Officer Prompt
    const llmResult = await correctTextWithOllama(ocrText);

    const relativePath = `uploads/${uploadedFile.filename}`;

    return res.status(200).json({
      success: true,
      ocrText: ocrText,
      correctedText: llmResult.correctedText || ocrText,
      summary: llmResult.summary || '',
      category: llmResult.category || 'Other',
      priority: llmResult.priority || 'Medium',
      keywords: llmResult.keywords || [],
      message: 'Image processed successfully.',
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
