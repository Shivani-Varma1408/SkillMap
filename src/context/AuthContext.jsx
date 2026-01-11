import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Sign-In
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Email/Password Sign-In
  const loginWithEmail = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Email sign-in error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Email/Password Sign-Up
  const signUpWithEmail = async (email, password) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Sign-up error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Logout with cleanup
  const logout = async () => {
    setError(null);
    try {
      // ✅ Clear all browser storage before logout
      sessionStorage.clear();
      localStorage.clear();
      
      // Alternative: Selective cleanup (uncomment and customize as needed)
      // if (currentUser?.uid) {
      //   const uid = currentUser.uid;
      //   sessionStorage.removeItem(`quizData_${uid}`);
      //   sessionStorage.removeItem(`userPreferences_${uid}`);
      //   
      //   // Remove specific localStorage items
      //   Object.keys(localStorage).forEach(key => {
      //     if (key.startsWith(`progress_${uid}_`) || key.startsWith(`quiz_${uid}_`)) {
      //       localStorage.removeItem(key);
      //     }
      //   });
      // }

      await signOut(auth);
      
      console.log('✅ User logged out and storage cleared');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};