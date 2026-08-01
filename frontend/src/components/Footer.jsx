/**
 * Footer component - displayed on all pages.
 */
function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Hindi/English OCR — Powered by ollama.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
