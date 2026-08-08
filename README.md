# OCR Bharat — Hindi OCR & Government Document Summarization

A local Hindi OCR system for processing scanned/photographed government documents.

The project uses:

* **React** — Frontend
* **Node.js + Express** — Main backend/API
* **FastAPI + PaddleOCR** — OCR microservice
* **Ollama + Qwen3:4B** — Hindi document summarization, classification and priority detection
* **MongoDB** — Optional database layer for storing documents/results

---

# 1. Project Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend  │
                    │      Port 5173      │
                    └──────────┬──────────┘
                               │
                               │ POST /api/upload
                               ▼
                    ┌─────────────────────┐
                    │  Node.js / Express  │
                    │      Port 5000      │
                    └──────────┬──────────┘
                               │
                               │ Send image
                               ▼
                    ┌─────────────────────┐
                    │ FastAPI OCR Service │
                    │      Port 8000      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      PaddleOCR      │
                    │    Hindi/Devanagari │
                    └──────────┬──────────┘
                               │
                               │ OCR Text
                               ▼
                    ┌─────────────────────┐
                    │    Node Backend     │
                    └──────────┬──────────┘
                               │
                               │ OCR Text
                               ▼
                    ┌─────────────────────┐
                    │  Ollama Qwen3:4B    │
                    │      Port 11434     │
                    └──────────┬──────────┘
                               │
                               │ Summary / Category /
                               │ Priority / Keywords
                               ▼
                    ┌─────────────────────┐
                    │     React UI        │
                    └─────────────────────┘
```

---

# 2. Project Structure

Recommended structure:

```text
ocrbharat/
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   │   └── ocrController.js
│   │
│   ├── routes/
│   │   └── ocrRoutes.js
│   │
│   ├── middlewares/
│   │   ├── uploadMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── services/
│   │   ├── ocrService.js
│   │   └── ollamaService.js
│   │
│   ├── uploads/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── ocr_service/
│   ├── main.py
│   ├── hindi_corrections.py
│   ├── test_ocr.py
│   ├── requirements.txt
│   └── venv/
│
└── README.md
```

---

# 3. Required Software

Install:

```text
Node.js
Python 3.11
Git
Ollama
```

Recommended Python version for the current setup:

```text
Python 3.11
```

---

# 4. Create Python Virtual Environment

Open PowerShell inside:

```powershell
cd ocrbharat\ocr_service
```

Create virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Verify:

```powershell
python -c "import sys; print(sys.executable)"
```

It should show:

```text
C:\...\ocrbharat\ocr_service\venv\Scripts\python.exe
```

### IMPORTANT

Always activate the virtual environment before running the OCR service.

If this command:

```powershell
python -c "import sys; print(sys.executable)"
```

shows:

```text
C:\Users\...\AppData\Local\Programs\Python\Python311\python.exe
```

you are using the global Python installation.

Activate:

```powershell
.\venv\Scripts\Activate.ps1
```

---

# 5. Install PaddleOCR

Inside the activated virtual environment:

```powershell
pip install paddleocr
```

Install PaddlePaddle according to the required CPU/GPU environment.

Verify:

```powershell
python -c "import paddle; print(paddle.__version__)"
```

Verify PaddleOCR:

```powershell
python -c "import paddleocr; print(paddleocr.__version__)"
```

Check locations:

```powershell
python -c "import sys, paddleocr; print('Python:', sys.executable); print('PaddleOCR:', paddleocr.__version__); print('Location:', paddleocr.__file__)"
```

---

# 6. Important PaddleOCR Version Issue

PaddleOCR APIs can change between versions.

For the current working setup, the OCR call is:

```python
results = ocr_engine.ocr(
    temp_file_path,
    cls=True
)
```

Do not blindly change this to:

```python
ocr_engine.predict()
```

if your installed PaddleOCR version does not support it.

An earlier error was:

```text
'PaddleOCR' object has no attribute 'predict'
```

The solution was to use:

```python
ocr_engine.ocr()
```

---

# 7. FastAPI OCR Service

`ocr_service/main.py`

Basic structure:

```python
import os
import tempfile
import uvicorn

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from paddleocr import PaddleOCR


ocr_engine = PaddleOCR(
    use_angle_cls=True,
    lang="devanagari"
)


app = FastAPI(
    title="Hindi Handwriting PaddleOCR Microservice"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "success": True,
        "message": "Hindi PaddleOCR Microservice is active."
    }


@app.post("/ocr")
async def extract_hindi_text(
    image: UploadFile = File(...)
):

    temp_file_path = None

    try:

        file_bytes = await image.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image file is empty."
            )

        ext = os.path.splitext(
            image.filename
        )[1] if image.filename else ".png"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=ext
        ) as temp_file:

            temp_file.write(file_bytes)
            temp_file_path = temp_file.name

        results = ocr_engine.ocr(
            temp_file_path,
            cls=True
        )

        extracted_lines = []

        if results and results[0]:

            for line in results[0]:

                if line and len(line) >= 2:

                    text = line[1][0]

                    if text:
                        extracted_lines.append(
                            text.strip()
                        )

        ocr_text = " ".join(
            extracted_lines
        )

        return {
            "success": True,
            "ocrText": ocr_text
        }

    except Exception as err:

        return {
            "success": False,
            "ocrText": "",
            "error": str(err)
        }

    finally:

        if temp_file_path and os.path.exists(
            temp_file_path
        ):

            try:
                os.remove(temp_file_path)

            except Exception:
                pass


if __name__ == "__main__":

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

---

# 8. Start FastAPI

Activate the Python environment:

```powershell
cd ocrbharat\ocr_service
.\venv\Scripts\Activate.ps1
```

Start:

```powershell
uvicorn main:app --reload --port 8000
```

Expected:

```text
Application startup complete.
```

Test:

```text
http://localhost:8000/
```

Expected:

```json
{
    "success": true,
    "message": "Hindi PaddleOCR Microservice is active."
}
```

---

# 9. Test FastAPI Independently

Before connecting Node.js, always test the OCR service separately.

Open:

```text
http://localhost:8000/docs
```

Use:

```text
POST /ocr
```

Upload an image.

Expected response:

```json
{
    "success": true,
    "ocrText": "..."
}
```

If this works, PaddleOCR itself is working.

---

# 10. Node.js Backend

The Express backend is responsible for:

```text
Upload image
       ↓
Save image
       ↓
Send image to FastAPI
       ↓
Receive OCR text
       ↓
Send OCR text to Ollama
       ↓
Return final JSON to React
```

---

# 11. Express Route

`backend/routes/ocrRoutes.js`

```javascript
const express = require("express");

const router = express.Router();

const handleUpload = require("../middlewares/uploadMiddleware");

const {
    processUpload
} = require("../controllers/ocrController");


router.post(
    "/upload",
    handleUpload,
    processUpload
);


module.exports = router;
```

Because `server.js` contains:

```javascript
app.use("/api", ocrRoutes);
```

the complete endpoint becomes:

```text
POST http://localhost:5000/api/upload
```

---

# 12. Multer Upload Middleware

`backend/middlewares/uploadMiddleware.js`

Responsibilities:

```text
Receive image
Validate extension
Limit file size
Save image to uploads/
```

Allowed:

```text
.jpg
.jpeg
.png
.webp
```

Maximum size:

```text
20 MB
```

---

# 13. OCR Controller

`backend/controllers/ocrController.js`

The controller connects everything:

```text
Upload
 ↓
OCR Service
 ↓
Ollama
 ↓
Response
```

Important section:

```javascript
const ocrResult =
    await extractTextFromImage(
        uploadedFile.path
    );
```

Debug OCR:

```javascript
console.log(
    "========== OCR RESULT =========="
);

console.log(ocrResult);

console.log(
    "================================"
);
```

Then:

```javascript
let ocrText = "";

if (
    ocrResult &&
    ocrResult.success
) {
    ocrText =
        ocrResult.ocrText || "";
}

console.log(
    "FINAL OCR TEXT:",
    ocrText
);
```

This is extremely useful for debugging.

---

# 14. Node → FastAPI Flow

Your Node service should send the uploaded image to:

```text
http://localhost:8000/ocr
```

The request should be:

```text
POST /ocr
Content-Type: multipart/form-data
```

Field name:

```text
image
```

FastAPI returns:

```json
{
    "success": true,
    "ocrText": "हिंदी OCR text"
}
```

Node extracts:

```javascript
ocrResult.ocrText
```

---

# 15. Important Debugging Rule

If Node displays:

```text
[OCR Service Warning] connect ECONNREFUSED
```

check whether FastAPI is running.

Start:

```powershell
uvicorn main:app --reload --port 8000
```

---

If you get:

```text
[OCR Service Warning] Invalid URL
```

check your `.env`.

Correct example:

```env
OCR_SERVICE_URL=http://localhost:8000/ocr
```

Do not accidentally use:

```text
localhost:8000
```

without:

```text
http://
```

---

# 16. Ollama

Install and run Ollama.

Verify:

```powershell
ollama list
```

Make sure Qwen exists:

```text
qwen3:4b
```

If not:

```powershell
ollama pull qwen3:4b
```

Test:

```powershell
ollama run qwen3:4b
```

---

# 17. Ollama API

Default API:

```text
http://localhost:11434/api/generate
```

Example `.env`:

```env
OLLAMA_API_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=qwen3:4b
```

---

# 18. Qwen's Responsibility

Do not use Qwen as the primary OCR engine.

PaddleOCR:

```text
Image → Text
```

Qwen:

```text
OCR Text → Understanding
```

Qwen should perform:

```text
Summary
Category
Priority
Keywords
```

Potentially later:

```text
OCR correction
Document classification
Entity extraction
```

---

# 19. Recommended LLM Pipeline

Current recommended architecture:

```text
Image
 ↓
PaddleOCR
 ↓
Raw OCR Text
 ↓
Basic OCR Cleanup
 ↓
Qwen3:4B
 ↓
Summary
Category
Priority
Keywords
```

Do not make Qwen perform unnecessary full-document rewriting if the primary requirement is summary generation.

---

# 20. Summary-First Prompt

Since summary is the primary requirement, keep the Qwen prompt focused.

Example:

```text
You are a Hindi government document analyst.

Analyze the OCR text from a government application.

Your main task is to create an accurate summary.

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

- category
- priority
- important keywords

Return ONLY valid JSON.
```

---

# 21. Qwen Request Optimization

Use:

```javascript
{
    model: modelName,
    prompt: prompt,
    stream: false,

    options: {
        temperature: 0.1,
        num_predict: 300
    }
}
```

Recommended timeout during development:

```javascript
timeout: 120000
```

Why?

A local 4B model can take longer to process a large Hindi document, especially on CPU or limited VRAM.

---

# 22. Ollama Timeout

If you see:

```text
[Ollama Warning] timeout of 60000ms exceeded
```

it means the request took longer than 60 seconds.

Increase:

```javascript
timeout: 60000
```

to:

```javascript
timeout: 120000
```

But do not solve every performance problem by endlessly increasing timeout.

First reduce:

```text
Prompt size
OCR text size
Output length
```

---

# 23. Hindi OCR Problems

Example OCR output:

```text
आधुिनक मानक िहदी
```

Correct:

```text
आधुनिक मानक हिंदी
```

Other possible errors:

```text
सामायतः → सामान्यतः
पमुख → प्रमुख
केदीय → केंद्रीय
रतर → स्तर
सिवधान → संविधान
मायता → मान्यता
अधक → अधिक
```

These are OCR errors, not necessarily LLM errors.

---

# 24. OCR Cleanup Layer

For frequently occurring errors, maintain a dictionary.

Create:

```text
hindi_corrections.py
```

Example:

```python
CORRECTIONS = {

    "आधुिनक": "आधुनिक",
    "िहदी": "हिंदी",
    "िहंदी": "हिंदी",
    "सामायतः": "सामान्यतः",
    "पमुख": "प्रमुख",
    "केदीय": "केंद्रीय",
    "रतर": "स्तर",
    "सिवधान": "संविधान",
    "मायता": "मान्यता",
    "अधक": "अधिक",

}
```

Apply:

```python
for wrong, correct in CORRECTIONS.items():

    ocr_text = ocr_text.replace(
        wrong,
        correct
    )
```

Do not blindly create thousands of replacements.

A correction can sometimes change a legitimate word.

---

# 25. Should You Train the OCR Model?

### Currently

No.

First make the complete application work.

---

### If target is printed Hindi

You may not need training.

Improve:

```text
Image quality
Preprocessing
OCR configuration
OCR model
Post-processing
```

---

### If target is handwritten Hindi

Training/fine-tuning will eventually become important.

Handwriting varies heavily between:

```text
Person A
Person B
Person C
```

A model trained on your actual document style can perform much better.

---

# 26. Do NOT Train Qwen for OCR

Qwen is not your OCR model.

Use:

```text
PaddleOCR → Image to Text
```

and:

```text
Qwen → Text Understanding
```

Future OCR training should focus on the OCR model.

---

# 27. Future Handwriting Dataset

Collect pairs:

```text
image → correct transcription
```

Example:

```text
dataset/
│
├── images/
│   ├── 001.jpg
│   ├── 002.jpg
│   └── 003.jpg
│
└── labels/
    ├── 001.txt
    ├── 002.txt
    └── 003.txt
```

Example:

```text
001.jpg
```

contains handwritten:

```text
माननीय अधिकारी महोदय
मेरे गांव में पानी की समस्या है।
```

`001.txt`:

```text
माननीय अधिकारी महोदय मेरे गांव में पानी की समस्या है।
```

---

# 28. Collect User Corrections

A very valuable future feature:

```text
OCR Output:
आधुिनक मानक िहदी

User Correction:
आधुनिक मानक हिंदी
```

Store both.

Over time:

```text
OCR prediction
+
Human correction
=
Training dataset
```

This dataset can eventually be used to fine-tune your OCR model.

---

# 29. Future Training Pipeline

Eventually:

```text
Collect Images
       ↓
Human Transcription
       ↓
Clean Dataset
       ↓
Train/Fine-tune OCR
       ↓
Validation
       ↓
Test on unseen handwriting
       ↓
Deploy model
       ↓
Collect more corrections
       ↓
Retrain
```

This becomes a continuous improvement cycle.

---

# 30. Complete Development Startup

Open three PowerShell terminals.

## Terminal 1 — OCR Service

```powershell
cd ocrbharat\ocr_service
```

Activate:

```powershell
.\venv\Scripts\Activate.ps1
```

Run:

```powershell
uvicorn main:app --reload --port 8000
```

Expected:

```text
Application startup complete.
```

---

## Terminal 2 — Node Backend

```powershell
cd ocrbharat\backend
```

Run:

```powershell
npm run dev
```

or:

```powershell
npm start
```

Expected:

```text
Backend server listening on http://localhost:5000
```

---

## Terminal 3 — React Frontend

```powershell
cd ocrbharat\frontend
```

Run:

```powershell
npm run dev
```

Usually:

```text
http://localhost:5173
```

---

# 31. Complete Request Flow

When the user uploads an image:

```text
React
 ↓
POST /api/upload
 ↓
Express
 ↓
Multer
 ↓
uploads/image.jpg
 ↓
ocrService.js
 ↓
FastAPI :8000/ocr
 ↓
PaddleOCR
 ↓
Hindi OCR Text
 ↓
Node
 ↓
Ollama :11434
 ↓
Qwen3:4B
 ↓
Summary + Category + Priority + Keywords
 ↓
Node JSON Response
 ↓
React
 ↓
Display result
```

---

# 32. Expected Final Backend Response

Example:

```json
{
    "success": true,

    "ocrText": "आधुनिक मानक हिंदी...",

    "correctedText": "...",

    "summary": "आवेदक ने जल आपूर्ति से संबंधित समस्या की शिकायत की है और नियमित जल आपूर्ति की मांग की है।",

    "category": "Water Supply",

    "priority": "High",

    "keywords": [
        "जल आपूर्ति",
        "पानी",
        "शिकायत"
    ],

    "message": "Image processed successfully.",

    "filePath": "uploads/ocr-123456.jpg",

    "fileName": "ocr-123456.jpg"
}
```

---

# 33. Debugging Order

When something fails, **do not debug the entire project at once**.

Always test in this order:

### Step 1

Check Python:

```powershell
python -c "import sys; print(sys.executable)"
```

Must point to:

```text
ocr_service\venv\Scripts\python.exe
```

### Step 2

Check FastAPI:

```text
http://localhost:8000/
```

### Step 3

Check PaddleOCR:

```text
http://localhost:8000/docs
```

Upload image through:

```text
POST /ocr
```

### Step 4

Check Node → FastAPI.

Look for:

```text
OCR RESULT
```

### Step 5

Check Ollama:

```powershell
ollama list
```

### Step 6

Check Node → Ollama.

### Step 7

Check React response.

This makes debugging much easier.

---

# 34. Common Errors

## Error: Wrong Python

```text
Python: C:\Users\...\Python311\python.exe
```

Instead of:

```text
...\ocr_service\venv\Scripts\python.exe
```

Fix:

```powershell
.\venv\Scripts\Activate.ps1
```

---

## Error: Connection refused 8000

```text
ECONNREFUSED ::1:8000
```

FastAPI isn't running or URL is incorrect.

Start:

```powershell
uvicorn main:app --reload --port 8000
```

---

## Error: Invalid URL

Check:

```env
OCR_SERVICE_URL=http://localhost:8000/ocr
```

---

## Error: PaddleOCR predict

```text
'PaddleOCR' object has no attribute 'predict'
```

Check your installed PaddleOCR version/API.

For the current working setup:

```python
ocr_engine.ocr(...)
```

---

## Error: `.json` on list

```text
'list' object has no attribute 'json'
```

This means PaddleOCR returned its result as a Python list, not a response object.

Do not use:

```python
results.json()
```

Parse the returned list directly.

---

## Error: Ollama timeout

```text
timeout of 60000ms exceeded
```

Check:

```text
Ollama running?
Model loaded?
Prompt too large?
OCR document too large?
Output too long?
GPU/CPU performance?
```

Then consider:

```javascript
timeout: 120000
```

and:

```javascript
num_predict: 300
```

---

# 35. Important Security Improvements Before Production

Current development CORS:

```javascript
allow_origins: ["*"]
```

or Express:

```javascript
cors()
```

is convenient for development.

Before production:

```text
Restrict allowed origins
Validate uploaded files
Scan uploads
Set file size limits
Rate limit API
Authenticate users
Delete temporary files
Protect Ollama endpoint
Protect FastAPI endpoint
Use HTTPS
Store secrets in environment variables
```

Never commit:

```text
.env
venv/
uploads/
```

to Git.

---

# 36. Recommended `.gitignore`

```gitignore
node_modules/
venv/
.env
__pycache__/
*.pyc
uploads/*
.paddlex/
```

---

# 37. Future Production Architecture

When the prototype is stable:

```text
                    Internet
                       │
                       ▼
                ┌─────────────┐
                │   React     │
                └──────┬──────┘
                       │
                       ▼
                ┌─────────────┐
                │ API Gateway │
                └──────┬──────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
       Node.js Backend     Auth Service
              │
              ▼
       OCR Job / Queue
              │
              ▼
       Python OCR Workers
              │
              ▼
       Fine-tuned OCR Model
              │
              ▼
       OCR Text Processing
              │
              ▼
       Qwen / LLM Service
              │
              ▼
           Database
```

---

# 38. Long-Term OCR Bharat Roadmap

## Phase 1 — Prototype

```text
PaddleOCR
+
Qwen3:4B
+
React
+
Node
+
FastAPI
```

Status:

```text
Current stage
```

---

## Phase 2 — Improve OCR

```text
Image preprocessing
+
OCR correction dictionary
+
Better OCR configuration
```

---

## Phase 3 — Collect Dataset

Collect:

```text
Images
+
Ground-truth Hindi transcription
+
User corrections
```

---

## Phase 4 — Fine-tune OCR

Train specifically for:

```text
Hindi handwriting
Government applications
Indian documents
Your target handwriting styles
```

---

## Phase 5 — Improve Document Intelligence

Add:

```text
Summary
Category
Priority
Keywords
Names
Dates
Locations
Application numbers
Department detection
```

---

## Phase 6 — Production SaaS

Add:

```text
Authentication
User accounts
Document history
Database
Cloud storage
Usage limits
Billing
Monitoring
Logging
Security
```

---

# 39. Golden Rule for Future Development

Do not immediately train a model because OCR output contains errors.

First determine:

```text
Is the problem caused by:

1. Image quality?
2. Preprocessing?
3. OCR model?
4. OCR configuration?
5. OCR post-processing?
6. LLM?
7. Frontend?
```

Only train the OCR model when you have enough representative data and have confirmed that preprocessing/configuration improvements are insufficient.

---

# 40. Current System Status

At the current development stage:

```text
React                    ✅
Node/Express             ✅
Multer                   ✅
FastAPI                  ✅
PaddleOCR                ✅
Hindi OCR                ✅
Node → FastAPI           ✅
Ollama                   ✅
Qwen3:4B                 ✅
Qwen summary             🔧 Optimization needed
Hindi OCR accuracy       🔧 Improvement needed
Handwriting fine-tuning  🔮 Future
Production deployment    🔮 Future
```

The most important next goal is:

```text
Reliable OCR
        +
Fast Hindi summary
        +
Correct category/priority
```

before starting model training.
