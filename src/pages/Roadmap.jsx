import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { generateCareerSuggestions, generateLearningRoadmap } from '../services/geminiAPI';

export default function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState('careers');
  const [careers, setCareers] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [currentYear, setCurrentYear] = useState('First Year');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const answers = location.state?.answers || JSON.parse(sessionStorage.getItem('quizData'))?.answers;

    if (answers) {
      console.log('✅ Quiz answers found, fetching AI matches...');
      fetchSuggestions(answers);
    } else {
      console.error('❌ No quiz answers found, redirecting to quiz');
      navigate('/quiz');
    }
  }, []);

  const fetchSuggestions = async (answers) => {
    setLoading(true);
    try {
      const suggestions = await generateCareerSuggestions(answers);
      setCareers(suggestions);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to connect to the AI service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCareerSelect = (career) => {
    setSelectedCareer(career);
    setStep('input');
  };

  const handleGenerateRoadmap = async () => {
    setStep('generating');
    try {
      const data = await generateLearningRoadmap({
        careerTitle: selectedCareer.title,
        currentSkills,
        currentYear
      });

      // Optional: Save to Firebase
      try {
        await addDoc(collection(db, 'roadmaps'), {
          career: selectedCareer.title,
          roadmap: data,
          createdAt: new Date(),
        });
      } catch (e) { console.warn("Firebase save failed", e); }

      setRoadmap(data);
      setStep('roadmap');
    } catch (error) {
      alert("Error generating roadmap.");
      setStep('input');
    }
  };

  // --- LOADING UI ---
  if (loading || step === 'generating') {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-yellow-400 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold">AI is thinking...</p>
        </div>
      </div>
    );
  }

  // --- CAREER LIST UI ---
  if (step === 'careers' && careers) {
    return (
      <div className="min-h-screen bg-indigo-600 py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {careers.careers.map((career, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-xl cursor-pointer" onClick={() => handleCareerSelect(career)}>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">{career.title}</h2>
              <p className="text-gray-600 mb-4">{career.description}</p>
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Get Roadmap →</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- INPUT FORM UI ---
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Finalizing Details</h2>
          <select className="w-full p-3 border mb-4 rounded-xl" value={currentYear} onChange={(e) => setCurrentYear(e.target.value)}>
            <option>First Year</option><option>Second Year</option><option>Third Year</option><option>Final Year</option><option>Graduate</option>
          </select>
          <textarea className="w-full p-3 border mb-4 rounded-xl" placeholder="Current skills..." value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} />
          <button onClick={handleGenerateRoadmap} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold">Generate Roadmap 🚀</button>
        </div>
      </div>
    );
  }

  // --- FINAL ROADMAP UI ---
  if (step === 'roadmap' && roadmap) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center">{selectedCareer.title} Roadmap</h1>
          {roadmap.roadmap.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-purple-600">
              <h3 className="font-bold">Month {m.month}: {m.title}</h3>
              <p>{m.focus}</p>
            </div>
          ))}
          <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold">Done</button>
        </div>
      </div>
    );
  }

  return null;
}