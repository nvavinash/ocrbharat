import { Link } from 'react-router-dom';

/**
 * Navbar component - displayed on all pages.
 */
function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">✍️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-primary-300 transition-all duration-300">
              Hindi/English OCR
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/upload"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Upload
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
