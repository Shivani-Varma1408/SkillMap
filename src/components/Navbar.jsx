import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-100">
      <Link className="mr-4" to="/">Home</Link>
      <Link className="mr-4" to="/quiz">Quiz</Link>
      <Link className="mr-4" to="/roadmap">Roadmap</Link>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  );
}
