import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Roadmap from "./pages/Roadmap";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import RoadmapProgress from "./components/RoadmapProgress";





function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Roadmapprogress" element={<RoadmapProgress />} />
      </Routes>
    </Router>
  );
}

export default App;
