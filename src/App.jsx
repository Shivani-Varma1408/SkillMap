import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Roadmap from "./pages/Roadmap";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Certifications from "./pages/Certifications";





function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certifications" element={<Certifications/>} />
      </Routes>
    </Router>
  );
}

export default App;
