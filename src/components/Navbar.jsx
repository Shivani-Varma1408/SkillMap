import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Award, ChartNoAxesColumnIncreasing, Compass, House, LogOut, Map, NotebookPen } from 'lucide-react';

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
    <nav className="sticky top-0 z-50 border-b border-[#dce4de] bg-[#f4f6f2]/95 shadow-sm backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e6f0e9] text-[#1f5747] transition-transform group-hover:scale-105">
              <Compass size={22} />
            </div>
            <div>
              <div className="text-xl font-bold text-[#172923]">SkillMap</div>
              <div className="text-[10px] text-[#718078]">AI Career Roadmap</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {/* Home - Always visible */}
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${isActive('/') ? 'bg-[#e6f0e9] text-[#1f5747]' : 'text-[#53645a] hover:bg-[#e6f0e9] hover:text-[#1f5747]'}`}
            >
              <House size={16} />Home
            </Link>

            {currentUser ? (
              <>
                {/* Authenticated user links */}
                <Link
                  to="/quiz"
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${isActive('/quiz') ? 'bg-[#e6f0e9] text-[#1f5747]' : 'text-[#53645a] hover:bg-[#e6f0e9] hover:text-[#1f5747]'}`}
                >
                  <NotebookPen size={16} />Quiz
                </Link>
                
                <Link
                  to="/roadmap"
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${isActive('/roadmap') ? 'bg-[#e6f0e9] text-[#1f5747]' : 'text-[#53645a] hover:bg-[#e6f0e9] hover:text-[#1f5747]'}`}
                >
                  <Map size={16} />Roadmap
                </Link>
                
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-[#e6f0e9] text-[#1f5747]' : 'text-[#53645a] hover:bg-[#e6f0e9] hover:text-[#1f5747]'}`}
                >
                  <ChartNoAxesColumnIncreasing size={16} />Dashboard
                </Link>
                
                <Link
                  to="/certifications"
                  className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${isActive('/certifications') ? 'bg-[#e6f0e9] text-[#1f5747]' : 'text-[#53645a] hover:bg-[#e6f0e9] hover:text-[#1f5747]'}`}
                >
                  <Award size={16} />Certifications
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative ml-2" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-all hover:bg-[#e6f0e9]"
                  >
                    <img
                      src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.email}&background=random`}
                      alt={currentUser.displayName || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-[#c8d9cc]"
                    />
                    <span className="hidden text-sm font-medium text-[#263b32] md:block">
                      {currentUser.displayName?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-[#dce4de] bg-white shadow-xl">
                      <div className="border-b border-[#dce4de] bg-[#f3f6f3] p-4">
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
                        className="flex w-full items-center gap-2 px-4 py-3 text-left font-medium text-[#3e5147] transition-colors hover:bg-[#f3f6f3]"
                      >
                        <LogOut size={16} />
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
                className="ml-2 rounded-md bg-[#1f5747] px-6 py-2 text-sm font-bold text-white transition-all hover:bg-[#174638]"
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