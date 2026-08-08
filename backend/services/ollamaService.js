// const axios = require('axios');

// /**
//  * Robustly extract and parse JSON object from LLM response string
//  */
// const parseLlmJson = (responseText, fallbackOcrText) => {
//   if (!responseText) {
//     return {
//       correctedText: fallbackOcrText,
//       summary: '',
//       category: 'Other',
//       priority: 'Medium',
//       keywords: [],
//     };
//   }

//   // Strip markdown code fences if present
//   let cleanText = responseText.replace(/```json\s*([\s\S]*?)\s*```/gi, '$1');
//   cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/gi, '$1').trim();

//   try {
//     const parsed = JSON.parse(cleanText);
//     return {
//       correctedText: parsed.correctedText || fallbackOcrText,
//       summary: parsed.summary || '',
//       category: parsed.category || 'Other',
//       priority: parsed.priority || 'Medium',
//       keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
//     };
//   } catch (err) {
//     // Fallback: extract JSON substring via regex if LLM outputs text around JSON
//     const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       try {
//         const parsed = JSON.parse(jsonMatch[0]);
//         return {
//           correctedText: parsed.correctedText || fallbackOcrText,
//           summary: parsed.summary || '',
//           category: parsed.category || 'Other',
//           priority: parsed.priority || 'Medium',
//           keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
//         };
//       } catch (e) {
//         console.warn('[Ollama JSON Parse Error]', e.message);
//       }
//     }

//     return {
//       correctedText: cleanText || fallbackOcrText,
//       summary: '',
//       category: 'Other',
//       priority: 'Medium',
//       keywords: [],
//     };
//   }
// };

// /**
//  * Service to process Hindi OCR text with Ollama Qwen model as a Government Review Officer.
//  * @param {string} ocrText - Raw OCR text from PaddleOCR
//  * @returns {Promise<{correctedText: string, summary: string, category: string, priority: string, keywords: string[]}>}
//  */
// const correctTextWithOllama = async (ocrText) => {
//   if (!ocrText || !ocrText.trim()) {
//     return {
//       correctedText: '',
//       summary: '',
//       category: 'Other',
//       priority: 'Low',
//       keywords: [],
//     };
//   }

//   const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
//   const modelName = process.env.OLLAMA_MODEL || 'qwen3:4b';
//   const prompt = `
// You are a Hindi government document summarization assistant.

// The following text was extracted from a Hindi document using OCR.

// The OCR contains many errors such as:
// - incorrect Hindi characters
// - missing matras
// - broken words
// - incorrect spacing
// - OCR symbols

// Your job is ONLY to understand the meaning of the document and write a short Hindi summary.

// IMPORTANT RULES:

// 1. Write the summary ONLY in Hindi.
// 2. Do NOT translate to English.
// 3. Do NOT invent information.
// 4. Do NOT add facts that are not present.
// 5. Identify the applicant if the name is clearly available.
// 6. Identify the main problem or grievance.
// 7. Identify what the applicant is requesting.
// 8. If a department or organization is clearly identifiable, mention it.
// 9. Do not try to reproduce the original OCR text.
// 10. Do not correct the entire OCR text.
// 11. Do not explain your reasoning.

// Return ONLY valid JSON.

// Use exactly this format:

// {
//   "summary": "संक्षिप्त हिंदी सारांश"
// }

// OCR TEXT:

// ${ocrText.trim()}
// `;

//   try {
//     const response = await axios.post(
//       ollamaUrl,
//       // {
//       //   model: modelName,
//       //   prompt: prompt,
//       //   stream: false,
//       // },
//       {
//         model: modelName,
//         prompt: prompt,
//         stream: false,
//         options: {
//           temperature: 0.1,
//           num_predict: 300
//         }
//       },
//       {
//         timeout: 180000,
//       }
//     );

//     if (response.data && response.data.response) {
//       return parseLlmJson(response.data.response, ocrText.trim());
//     }

//     return {
//       correctedText: ocrText.trim(),
//       summary: '',
//       category: 'Other',
//       priority: 'Medium',
//       keywords: [],
//     };
//   } catch (error) {
//     console.warn(`[Ollama Warning] ${error.message}. Returning fallback OCR text.`);
//     return {
//       correctedText: ocrText.trim(),
//       summary: '',
//       category: 'Other',
//       priority: 'Medium',
//       keywords: [],
//     };
//   }
// };

// module.exports = {
//   correctTextWithOllama,
// };

const axios = require('axios');

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

  console.log('========== RAW QWEN RESPONSE ==========');
  console.log(responseText);
  console.log('=======================================');

  // Remove markdown code fences
  let cleanText = responseText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  try {
    const parsed = JSON.parse(cleanText);

    return {
      correctedText: fallbackOcrText,
      summary: parsed.summary || '',
      category: parsed.category || 'Other',
      priority: parsed.priority || 'Medium',
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords
        : [],
    };
  } catch (error) {
    console.warn(
      '[Ollama JSON Parse Error]',
      error.message
    );

    console.warn(
      '[Ollama Clean Response]',
      cleanText
    );

    // Try to find JSON object inside the response
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end > start) {
      const jsonString = cleanText.substring(start, end + 1);

      try {
        const parsed = JSON.parse(jsonString);

        return {
          correctedText: fallbackOcrText,
          summary: parsed.summary || '',
          category: parsed.category || 'Other',
          priority: parsed.priority || 'Medium',
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords
            : [],
        };
      } catch (secondError) {
        console.warn(
          '[Ollama Embedded JSON Error]',
          secondError.message
        );
      }
    }

    return {
      correctedText: fallbackOcrText,
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };
  }
};


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

  const ollamaUrl =
    process.env.OLLAMA_API_URL ||
    'http://localhost:11434/api/generate';

  const modelName =
    process.env.OLLAMA_MODEL ||
    'qwen3:4b';

  //   const prompt = `
  // तुम एक सरकारी शिकायत/आवेदन दस्तावेज़ विश्लेषण सहायक हो।

  // नीचे दिया गया पाठ Hindi OCR से प्राप्त हुआ है।
  // OCR में बहुत सारी गलतियाँ हो सकती हैं।

  // तुम्हारा काम दस्तावेज़ का अर्थ समझकर मुख्य जानकारी निकालना और लगभग 5 बिंदुओं में हिंदी सारांश बनाना है।

  // महत्वपूर्ण नियम:

  // 1. केवल OCR में उपलब्ध जानकारी का उपयोग करो।
  // 2. कोई नई जानकारी मत बनाओ।
  // 3. OCR की गलतियों को संदर्भ के आधार पर समझ सकते हो।
  // 4. यदि कोई जानकारी स्पष्ट नहीं है तो "" रखो।
  // 5. नाम तभी निकालो जब स्पष्ट हो।
  // 6. गांव तभी निकालो जब स्पष्ट हो।
  // 7. स्थान/मोहल्ला तभी निकालो जब स्पष्ट हो।
  // 8. जिला तभी निकालो जब स्पष्ट हो।
  // 9. राज्य तभी निकालो जब स्पष्ट हो।
  // 10. विभाग तभी निकालो जब स्पष्ट हो।
  // 11. मुख्य शिकायत स्पष्ट रूप से बताओ।
  // 12. आवेदक की मांग स्पष्ट रूप से बताओ।
  // 13. दस्तावेज़ के सभी प्रमुख तथ्यों को summary में शामिल करने की कोशिश करो।
  // 14. Summary लगभग 5 छोटे वाक्यों की हो।
  // 15. Summary केवल हिंदी में हो।
  // 16. अंग्रेजी में कोई explanation मत दो।
  // 17. reasoning मत दिखाओ।
  // 18. OCR का पूरा text दोबारा मत लिखो।
  // 19. केवल valid JSON दो।
  // 20. JSON के बाहर कुछ भी मत लिखो।

  // Summary में यदि जानकारी उपलब्ध हो तो इस क्रम में बताओ:

  // 1. आवेदक और आवेदन का विषय
  // 2. स्थान/गांव/क्षेत्र
  // 3. मुख्य समस्या या शिकायत
  // 4. समस्या से होने वाली परेशानी
  // 5. आवेदक की मांग/अनुरोध

  // JSON FORMAT:

  // {
  //   "applicantName": "",
  //   "village": "",
  //   "locality": "",
  //   "district": "",
  //   "state": "",
  //   "department": "",
  //   "grievance": "",
  //   "request": "",
  //   "summary": ""
  // }

  // OCR TEXT:

  // ${ocrText.trim()}
  // `;

  const prompt = `
You are a Hindi government grievance document assistant.
The OCR text may be in Hindi, English, or a mixture of Hindi and English and Number also.
Read the OCR text below. The OCR text contains spelling errors, broken Hindi words, missing matras and incorrect characters.

Your job is to understand the document and produce a concise but informative Hindi summary.

IMPORTANT:

* Output ONLY valid JSON.
* Do NOT output markdown.
* Do NOT output json.
* Do NOT explain your reasoning.
* Do NOT reproduce the OCR text.
* Do NOT invent facts.
* If information is unclear, leave that field empty.
* Correct obvious OCR mistakes only when the meaning is clear.

FIRST identify these facts from the document:

1. Applicant name
2. Village
3. Locality / मोहल्ला / वार्ड
4. District
5. State
6. Address
7. Department / authority
8. Main grievance
9. Requested action

THEN write the summary.

THE SUMMARY IS MANDATORY.

Even if some fields are empty, ALWAYS generate the "summary" field.

The summary MUST be 4 to 5 short Hindi sentences.

The summary MUST include as many of these as can be confidently identified:

* applicant name
* address / village / locality
* district / state
* department or authority
* main problem
* important circumstances
* requested action

Do not repeat the same sentence.

Return exactly this JSON:

{
"applicantName": "",
"village": "",
"locality": "",
"district": "",
"state": "",
"address": "",
"department": "",
"grievance": "",
"request": "",
"summary": ""
}

VERY VERY IMPORTANT:

The "summary" field must NEVER be empty.

If some address information is available, include it in the summary.

For example:
//this is example only don't copy this.
"आवेदक राहुल मोदी, निवासी जवाहरवाड़, पांढुरना, ने नगरपालिका को आवेदन दिया है। उन्होंने क्षेत्र में जल आपूर्ति नियमित नहीं होने की समस्या बताई है। पानी की समस्या के कारण घरेलू कार्यों में कठिनाई हो रही है। आवेदक ने संबंधित नगरपालिका से जल आपूर्ति व्यवस्था को शीघ्र ठीक कराने का अनुरोध किया है।"
if it has been written "सेवा में" that means applicant has written a letter to someone.
then it will be like :
"आवेदक राहुल मोदी, written word after "सेवा में" is receiver of the letter, resident of जवाहरवाड़, पांढुरना, ने नगरपालिका को आवेदन दिया है। उन्होंने क्षेत्र में जल आपूर्ति नियमित नहीं होने की समस्या बताई है। पानी की समस्या के कारण घरेलू कार्यों में कठिनाई हो रही है। आवेदक ने संबंधित नगरपालिका से जल आपूर्ति व्यवस्था को शीघ्र ठीक कराने का अनुरोध किया है।"
Now process the following OCR text:

${ocrText.trim()}
`;
  try {

    console.log('========== CALLING QWEN ==========');
    console.log('Model:', modelName);
    console.log('OCR length:', ocrText.length);
    console.log('==================================');

    const response = await axios.post(
      ollamaUrl,
      {
        model: modelName,
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.1,
          num_predict: 800,
          top_p: 0.8
        },
        think: false,
      },
      {
        timeout: 180000,
      }
    );

    console.log('========== OLLAMA HTTP RESPONSE ==========');
    console.log('Status:', response.status);
    console.log('FULL DATA:');
    console.dir(response.data, { depth: null });
    console.log('==========================================');

    if (response.data && response.data.response) {

      return parseLlmJson(
        response.data.response,
        ocrText.trim()
      );

    }

    console.warn(
      '[Ollama] Empty response received'
    );

    return {
      correctedText: ocrText.trim(),
      summary: '',
      category: 'Other',
      priority: 'Medium',
      keywords: [],
    };

  } catch (error) {

    console.warn(
      `[Ollama Warning] ${error.message}`
    );

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