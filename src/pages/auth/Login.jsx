import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FiEye, FiEyeOff } from 'react-icons/fi';



export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmail, currentUser, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Get returnTo path and roadmap data from navigation state
  const returnTo = location.state?.returnTo || '/';
  const roadmapData = location.state?.roadmapData;

  // Helper function to save roadmap after successful login
  const saveRoadmapIfNeeded = async (user) => {
    if (!roadmapData || !user) return;
    
    try {
      await addDoc(collection(db, 'roadmaps'), {
        userId: user.uid,
        career: roadmapData.selectedCareer?.title || roadmapData.career,
        roadmap: roadmapData.roadmap,
        missingSkills: roadmapData.missingSkills,
        createdAt: new Date(),
        quizAnswers: roadmapData.quizAnswers || {}
      });
      console.log('✅ Roadmap saved after login');
    } catch (error) {
      console.error('Error saving roadmap:', error);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setLocalError('');
    try {
      const user = await loginWithGoogle();
      await saveRoadmapIfNeeded(user);
      navigate(returnTo);
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setLocalError('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setLocalError('Sign-in was cancelled. Please try again.');
      } else {
        setLocalError('Failed to sign in with Google. Please try again.');
      }
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Sign-In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setLocalError('⚠️ Please enter both email and password.');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('⚠️ Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const user = await loginWithEmail(email, password);
      await saveRoadmapIfNeeded(user);
      navigate(returnTo);
    } catch (error) {
      // Enhanced error messages
      if (error.code === 'auth/user-not-found') {
        setLocalError('❌ No account found with this email. Please sign up first.');
      } else if (error.code === 'auth/wrong-password') {
        setLocalError('❌ Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setLocalError('❌ Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        setLocalError('⚠️ Too many failed attempts. Please try again later or reset your password.');
      } else if (error.code === 'auth/invalid-credential') {
        setLocalError('❌ Invalid email or password. Please check your credentials.');
      } else {
        setLocalError('❌ Sign-in failed. Please try again.');
      }
      console.error('Email sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce">🚀</div>
          <h1 className="text-5xl font-bold text-white mb-2">SkillMap</h1>
          <p className="text-xl text-white/90">AI Career Roadmap</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Sign in to continue your learning journey
          </p>

          {/* Show message if coming from roadmap */}
          {roadmapData && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-700 text-sm flex items-center gap-2">
                <span>ℹ️</span>
                <span>Sign in to save your <strong>{roadmapData.career || roadmapData.selectedCareer?.title}</strong> roadmap</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {(localError || error) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{localError || error}</p>
            </div>
          )}

          {/* Google Sign-In Button (Primary) */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 mb-6 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or sign in with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
  <label className="block text-gray-700 font-medium mb-2">Password</label>

  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="••••••••"
      className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      disabled={loading}
    />

    {/* Eye Toggle Button */}
    <button
  type="button"
  onClick={() => setShowPassword((prev) => !prev)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
  tabIndex={-1}
>
  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
</button>

  </div>
</div>


            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                state={{ returnTo, roadmapData }}
                className="text-purple-600 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-white hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}