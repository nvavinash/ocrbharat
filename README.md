# OCR Bharat — Hindi OCR & Government Document Summarization

OCR Bharat is a local AI-based system for extracting Hindi text from scanned/photographed government documents and generating a structured summary.

## Tech Stack

* **Frontend:** React
* **Backend:** Node.js + Express
* **OCR Service:** FastAPI + PaddleOCR
* **LLM:** Ollama + Qwen3:4B
* **Database:** MongoDB (optional)

## Architecture

```text
React
  ↓
Node.js + Express
  ↓
FastAPI OCR Service
  ↓
PaddleOCR
  ↓
Hindi OCR Text
  ↓
Ollama + Qwen3:4B
  ↓
Summary / Category / Priority / Keywords
  ↓
React
```

## Project Structure

```text
ocrbharat/
├── frontend/
├── backend/
├── ocr_service/
│   ├── main.py
│   ├── hindi_corrections.py
│   ├── test_ocr.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

> The Python virtual environment (`venv/`) is created locally and is not included in the repository.

## Requirements

Install:

* Node.js
* Python 3.11
* Ollama
* Git

Python dependencies and their versions are listed in:

```text
ocr_service/requirements.txt
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/nvavinash/ocrbharat.git
cd ocrbharat
```

### 2. Setup OCR Service

```powershell
cd ocr_service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Start FastAPI:

```powershell
uvicorn main:app --reload --port 8000
```

OCR API:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3. Setup Ollama

Install Ollama and make sure the Qwen model is available:

```powershell
ollama pull qwen3:4b
```

Check:

```powershell
ollama list
```

Ollama API runs by default on:

```text
http://localhost:11434
```

### 4. Setup Backend

```powershell
cd ../backend
npm install
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 5. Setup Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Processing Flow

When a document is uploaded:

```text
Image
 ↓
Express Backend
 ↓
FastAPI
 ↓
PaddleOCR
 ↓
Hindi OCR Text
 ↓
Qwen3:4B
 ↓
Summary + Category + Priority + Keywords
```

## Example Response

```json
{
  "success": true,
  "ocrText": "हिंदी OCR text...",
  "summary": "आवेदक ने जल आपूर्ति से संबंधित समस्या की शिकायत की है।",
  "category": "Water Supply",
  "priority": "High",
  "keywords": [
    "जल आपूर्ति",
    "पानी",
    "शिकायत"
  ]
}
```

## Current Status

* React frontend ✅
* Node.js/Express backend ✅
* FastAPI OCR service ✅
* PaddleOCR Hindi OCR ✅
* Ollama + Qwen3:4B ✅
* Document summarization 🔧
* OCR accuracy improvements 🔧
* Hindi handwriting fine-tuning 🔮

## Future Improvements

* Improve Hindi OCR accuracy
* Image preprocessing
* OCR correction
* Hindi handwriting model fine-tuning
* Document classification
* Entity extraction
* Document history and database
* Authentication and production deployment

## Note

OCR Bharat is designed to run locally, keeping document processing and AI inference within the local environment.
