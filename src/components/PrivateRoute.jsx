import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-t-yellow-400 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!currentUser) {
    return (
      <Navigate 
        to="/login" 
        state={{ returnTo: location.pathname }}
        replace 
      />
    );
  }

  // User is authenticated, render the protected component
  return children;
}