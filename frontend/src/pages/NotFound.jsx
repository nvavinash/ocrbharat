import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <h1 className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-300 bg-clip-text text-transparent mb-4">
          404
        </h1>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30 transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
