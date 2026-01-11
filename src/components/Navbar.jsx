import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 border-b border-white/10 sticky top-0 z-50 backdrop-blur-lg shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-3xl group-hover:scale-110 transition-transform">🚀</div>
            <div>
              <div className="text-xl font-bold text-white">SkillMap</div>
              <div className="text-[10px] text-white/70">AI Career Roadmap</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {/* Home - Always visible */}
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                isActive('/') 
                  ? 'bg-white text-purple-900 shadow-md' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              🏠 Home
            </Link>

            {currentUser ? (
              <>
                {/* Authenticated user links */}
                <Link
                  to="/quiz"
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/quiz') 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  📝 Quiz
                </Link>
                
                <Link
                  to="/roadmap"
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/roadmap') 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  🗺️ Roadmap
                </Link>
                
                <Link
                  to="/dashboard"
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/dashboard') 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  📊 Dashboard
                </Link>
                
                <Link
                  to="/certifications"
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive('/certifications') 
                      ? 'bg-white text-purple-900 shadow-md' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  🏆 Certifications
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <img
                      src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=random`}
                      alt={currentUser.displayName || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-white/50"
                    />
                    <span className="text-white text-sm font-medium hidden md:block">
                      {currentUser.displayName?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                        <p className="font-bold text-gray-800 truncate">
                          {currentUser.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-2 text-gray-700 font-medium"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Unauthenticated - Show Login button */
              <Link
                to="/login"
                className="ml-2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all text-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}