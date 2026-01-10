import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-4xl group-hover:scale-110 transition-transform">🚀</div>
            <div>
              <div className="text-2xl font-bold text-white">SkillMap</div>
              <div className="text-xs text-white/70">AI Career Roadmap</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isActive('/')
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🏠 Home
            </Link>
            <Link
              to="/quiz"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isActive('/quiz')
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📝 Quiz
            </Link>
            <Link
              to="/roadmap"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isActive('/roadmap')
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🗺️ Roadmap
            </Link>
            <Link
              to="/dashboard"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/certifications"
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isActive('/certifications')
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              📚Certifications
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
