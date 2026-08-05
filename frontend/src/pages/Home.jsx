import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";


/**
 * Home page - Hero section with app description and CTA.
 */
function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        {/* Icon */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl shadow-lg shadow-primary-200/50 animate-bounce">
          <span className="text-4xl">✍️</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Hindi/English Typed/Handwriting{' '}
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            OCR
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto">
          Upload an image and get instant, accurate text extraction powered by AI correction.
        </p>

        {/* CTA Button */}
        <button
      onClick={() => navigate("/upload")}
      className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transform hover:-translate-y-0.5 transition-all duration-300"
    >
      Get Started
    </button>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '📷', title: 'Upload Image', desc: 'Drag & drop or browse' },
            { icon: '🔍', title: 'OCR Processing', desc: 'OCR extraction using LLM' },
            { icon: '✨', title: 'AI Correction', desc: 'AI correction using LLM' },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300"
            >
              <span className="text-2xl mb-2 block">{feature.icon}</span>
              <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
