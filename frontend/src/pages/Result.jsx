import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Priority badge color map
const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-700 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  High: 'bg-orange-100 text-orange-700 border-orange-200',
  Critical: 'bg-red-100 text-red-700 border-red-200',
};

/**
 * Result page - Displays OCR result with copy, download, and clear actions.
 */
function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // If no navigation state at all, redirect to upload
  if (!location.state) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-500 mb-6">Please upload an image first to see OCR results.</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300"
          >
            Go to Upload
          </Link>
        </div>
      </div>
    );
  }

  const {
    imageUrl,
    fileName = 'document.pdf',
    numPages = 1,
    ocrText = '',
    correctedText = '',
    summary = '',
    category = 'Other',
    priority = 'Medium',
    keywords = [],
  } = location.state;

  const displayText = correctedText || ocrText || '';
  const hasText = displayText.trim().length > 0;
  const priorityClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy text.');
    }
  };

  const handleCopyRaw = async () => {
    try {
      await navigator.clipboard.writeText(ocrText);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      alert('Failed to copy text.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hindi-ocr-result.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OCR Result</h1>
          <p className="text-gray-500">Extracted and AI-corrected Hindi text from your document</p>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {category}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-full ${priorityClass}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {priority} Priority
          </span>
          {keywords.length > 0 && keywords.map((kw, i) => (
            <span key={i} className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              {kw}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Uploaded PDF */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Uploaded PDF
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                <svg className="w-16 h-16 text-red-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-800 font-semibold text-center break-all">{fileName}</p>
                {numPages && (
                  <p className="text-sm text-gray-500 mt-2 font-medium bg-gray-200/50 px-2 py-0.5 rounded">
                    Total Pages: {numPages}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Corrected Text */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Corrected Text
              </h2>
              <button
                onClick={handleCopy}
                disabled={!hasText}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
                }`}
              >
                {copied ? (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                ) : (
                  <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                )}
              </button>
            </div>
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-80 overflow-y-auto">
                {hasText ? (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{displayText}</p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <span className="text-3xl mb-3">🔤</span>
                    <p className="text-gray-400 text-sm font-medium">No text could be extracted</p>
                    <p className="text-gray-300 text-xs mt-1">Try uploading a clearer image with visible Hindi text</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {summary && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Summary
              </h2>
            </div>
            <div className="p-5">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {/* Raw OCR Text */}
        {ocrText && ocrText !== correctedText && (
          <details className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-between">
              <span>View Raw OCR Text (before correction)</span>
              <button
                onClick={(e) => { e.preventDefault(); handleCopyRaw(); }}
                className={`text-xs px-2 py-1 rounded-md transition-all ${copiedRaw ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {copiedRaw ? 'Copied!' : 'Copy raw'}
              </button>
            </summary>
            <div className="px-5 pb-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{ocrText}</p>
              </div>
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={!hasText}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download TXT
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Upload Another
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Result;
