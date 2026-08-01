import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

/**
 * Result page - Displays OCR result with copy, download, and clear actions.
 */
function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Get data from navigation state
  const { imageUrl, ocrText, correctedText } = location.state || {};

  // If no data, redirect to upload
  if (!correctedText) {
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

  /**
   * Copy corrected text to clipboard.
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(correctedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy text.');
    }
  };

  /**
   * Download corrected text as a .txt file.
   */
  const handleDownload = () => {
    const blob = new Blob([correctedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hindi-ocr-result.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Clear results and go back to upload.
   */
  const handleClear = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OCR Result</h1>
          <p className="text-gray-500">Here is the extracted and corrected Hindi text</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Uploaded Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Uploaded Image
              </h2>
            </div>
            <div className="p-4">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="w-full rounded-lg object-contain max-h-80 bg-gray-50"
              />
            </div>
          </div>

          {/* Extracted Text */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Corrected Text
              </h2>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Text Output */}
            <div className="p-5">
              <div className="bg-gray-50 rounded-xl p-5 min-h-[200px] max-h-80 overflow-y-auto">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {correctedText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Raw OCR Text (collapsible) */}
        {ocrText && (
          <details className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              View Raw OCR Text (before correction)
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
          {/* Download TXT */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download TXT
          </button>

          {/* Clear / Upload Another */}
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-600 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Upload Another
          </button>

          {/* Back to Home */}
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
