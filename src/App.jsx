import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Quiz from './pages/Quiz';
import Roadmap from './pages/Roadmap';
import Dashboard from './pages/Dashboard';
import Certifications from './pages/Certifications';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes - Require Authentication */}
            <Route 
              path="/quiz" 
              element={
                <PrivateRoute>
                  <Quiz />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/roadmap" 
              element={
                <PrivateRoute>
                  <Roadmap />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/certifications" 
              element={
                <PrivateRoute>
                  <Certifications />
                </PrivateRoute>
              } 
            />

            {/* 404 Catch-all */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-9xl mb-4">404</div>
                    <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
                    <a href="/" className="px-8 py-4 bg-white text-purple-900 rounded-xl font-bold hover:shadow-xl transition-all inline-block">
                      Go Home
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;