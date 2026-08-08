const axios = require('axios');

/**
 * Robustly extract and parse JSON object from LLM response string
 */
const parseLlmJson = (responseText, fallbackOcrText) => {
  if (!responseText) {
    return {
      correctedText: fallbackOcrText,
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };
  }

  // Strip markdown code fences if present
  let cleanText = responseText.replace(/```json\s*([\s\S]*?)\s*```/gi, '$1');
  cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/gi, '$1').trim();

  try {
    const parsed = JSON.parse(cleanText);
    return {
      correctedText: parsed.correctedText || fallbackOcrText,
      summary: parsed.summary || '',
      category: parsed.category || 'Other',
      priority: parsed.priority || 'Medium',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };
  } catch (err) {
    // Fallback: extract JSON substring via regex if LLM outputs text around JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          correctedText: parsed.correctedText || fallbackOcrText,
          summary: parsed.summary || '',
          category: parsed.category || 'Other',
          priority: parsed.priority || 'Medium',
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        };
      } catch (e) {
        console.warn('[Ollama JSON Parse Error]', e.message);
      }
    }

    return {
      correctedText: cleanText || fallbackOcrText,
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };
  }
};

/**
 * Service to process Hindi OCR text with Ollama Qwen model as a Government Review Officer.
 * @param {string} ocrText - Raw OCR text from PaddleOCR
 * @returns {Promise<{correctedText: string, summary: string, category: string, priority: string, keywords: string[]}>}
 */
const correctTextWithOllama = async (ocrText) => {
  if (!ocrText || !ocrText.trim()) {
    return {
      correctedText: '',
      summary: '',
      category: 'Other',
      priority: 'Low',
      keywords: [],
    };
  }

  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
  const modelName = process.env.OLLAMA_MODEL || 'qwen3:4b';

  //   const prompt = `You are an Expert Government Document Review Officer with extensive experience handling citizen grievance applications.

  // Your responsibility is to review OCR-extracted Hindi text obtained from scanned handwritten or printed government applications.

  // This document will be reviewed by government officials. Accuracy is extremely important.

  // ========================================================
  // PRIMARY OBJECTIVE
  // ========================================================

  // Your task is to correct OCR mistakes while preserving the original meaning of the application.

  // Do NOT rewrite the application.

  // Do NOT change the applicant's intent.

  // Do NOT remove any information.

  // Do NOT add any new information.

  // Do NOT translate the text.

  // Preserve all facts exactly as written.

  // ========================================================
  // OCR CORRECTION RULES
  // ========================================================

  // Correct only OCR-related errors, including:

  // • Incorrect Hindi characters
  // • Missing matras (ि, ी, ु, ू, े, ै, ो, ौ)
  // • Broken words
  // • Merged words
  // • Incorrect punctuation
  // • Missing punctuation
  // • Wrong spacing
  // • Incorrect line breaks caused by OCR
  // • Incorrect Hindi spellings caused by OCR
  // • Duplicate words caused by OCR
  // • Random OCR symbols
  // • Extra spaces
  // • Missing spaces

  // If a word is unclear,
  // infer it ONLY from surrounding context.

  // If you are not reasonably confident,
  // leave the original word unchanged.

  // Never guess names, addresses, mobile numbers, dates, application numbers, Aadhaar numbers, survey numbers, or official references.

  // ========================================================
  // LANGUAGE RULES
  // ========================================================

  // Output must remain entirely in Hindi.

  // Do not translate into English.

  // Use formal government Hindi.

  // Preserve the applicant's tone.

  // Preserve paragraph structure.

  // Preserve numbering.

  // Preserve lists.

  // ========================================================
  // SUMMARY
  // ========================================================

  // After correcting the OCR text,
  // generate a concise summary.

  // Summary rules:

  // • Hindi only
  // • Maximum 5 sentences
  // • Mention the grievance
  // • Mention the applicant's request
  // • Mention the affected department if identifiable
  // • Do not invent facts
  // • Do not add opinions
  // • Do not recommend solutions
  // • Only summarize what is actually written

  // ========================================================
  // CATEGORY DETECTION
  // ========================================================

  // Identify the most suitable grievance category.

  // Possible values include:

  // Water Supply
  // Electricity
  // Road
  // Drainage
  // Sanitation
  // Pension
  // Revenue
  // Land
  // Police
  // Education
  // Health
  // Agriculture
  // Housing
  // Transport
  // Municipality
  // Other

  // ========================================================
  // PRIORITY
  // ========================================================

  // Estimate priority.

  // Possible values:

  // Low
  // Medium
  // High
  // Critical

  // Base the priority ONLY on the text.

  // Do not exaggerate.

  // ========================================================
  // KEYWORDS
  // ========================================================

  // Extract up to 10 important Hindi keywords.

  // ========================================================
  // OUTPUT FORMAT
  // ========================================================

  // Return ONLY valid JSON.

  // Do NOT include markdown.

  // Do NOT include explanations.

  // Do NOT include extra text.

  // Return exactly:

  // {
  //   "correctedText": "...",
  //   "summary": "...",
  //   "category": "...",
  //   "priority": "...",
  //   "keywords": [
  //     "...",
  //     "...",
  //     "..."
  //   ]
  // }

  // ========================================================
  // OCR TEXT
  // ========================================================
  const prompt = `
You are a Hindi government document analyst.

Analyze the OCR text from a government application.

Your main task is to create an accurate summary max 250 words.

Rules:
- Output Hindi only.
- Do not translate.
- Do not invent information.
- Use only information present in the OCR text.
- Mention the main complaint/grievance.
- Mention the applicant's request.
- Mention department if clearly available.
- Keep summary within 3-5 sentences.

Also provide:
- category from the given list
- priority based only on the document
- important keywords

Return ONLY valid JSON.

Format:

{
 "summary": "",
 "category": "",
 "priority": "",
 "keywords": []
}

Categories:
Water Supply,
Electricity,
Road,
Drainage,
Sanitation,
Pension,
Revenue,
Land,
Police,
Education,
Health,
Agriculture,
Housing,
Transport,
Municipality,
Other

Priority:
Low,
Medium,
High,
Critical


OCR TEXT:


${ocrText.trim()}`;

  try {
    const response = await axios.post(
      ollamaUrl,
      // {
      //   model: modelName,
      //   prompt: prompt,
      //   stream: false,
      // },
      {
        model: modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 300
        }
      },
      {
        timeout: 180000,
      }
    );

    if (response.data && response.data.response) {
      return parseLlmJson(response.data.response, ocrText.trim());
    }

    return {
      correctedText: ocrText.trim(),
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };
  } catch (error) {
    console.warn(`[Ollama Warning] ${error.message}. Returning fallback OCR text.`);
    return {
      correctedText: ocrText.trim(),
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };
  }
};

module.exports = {
  correctTextWithOllama,
};
