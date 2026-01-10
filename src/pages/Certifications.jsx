// pages/CertificationsPage.js
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Certifications from '../components/Certifications';

export default function CertificationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Prevent multiple executions
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    console.log("Certifications mounted");
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    console.log('Location state:', location.state);
    console.log('Session storage quizData:', sessionStorage.getItem('quizData'));

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const locationState = location.state;

      // ---------- PRIORITY 1: LOCATION STATE ----------
      if (locationState) {
        console.log('Using location state data:', locationState);

        if (locationState.selectedRoadmap) {
          setSelectedRoadmap(locationState.selectedRoadmap);
          console.log('Set selected roadmap from location state:', locationState.selectedRoadmap.career);
        }

        if (locationState.missingSkills) {
          setMissingSkills(locationState.missingSkills);
          console.log('Set missing skills from location state:', locationState.missingSkills.length);
        }

        if (locationState.quizData) {
          setQuizData(locationState.quizData);
          console.log('Set quiz data from location state');
        }

        setLoading(false);
        return;
      }

      // ---------- PRIORITY 2: FIREBASE ----------
      console.log('No location state, loading from Firebase...');
      const q = query(collection(db, 'roadmaps'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const roadmapData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Loaded roadmaps:', roadmapData.length);
      setRoadmaps(roadmapData);

      // ---------- PRIORITY 3: SESSION STORAGE ----------
      const savedQuizData = sessionStorage.getItem('quizData');
      console.log('Saved quiz data from sessionStorage:', savedQuizData);

      if (savedQuizData) {
        try {
          const parsedQuizData = JSON.parse(savedQuizData);
          setQuizData(parsedQuizData.answers || {});
          console.log('Parsed quiz data:', parsedQuizData);

          if (parsedQuizData.careerPath && roadmapData.length > 0) {
            const matchingRoadmap =
              roadmapData.find(r => r.career === parsedQuizData.careerPath) ||
              roadmapData[0];

            setSelectedRoadmap(matchingRoadmap);
            console.log('Found matching roadmap:', matchingRoadmap.career);

            const skills = extractMissingSkills(matchingRoadmap);
            setMissingSkills(skills);
            console.log('Extracted missing skills:', skills.length);
          }
        } catch (e) {
          console.warn('Failed to parse quiz data:', e);
        }
      }

      // ---------- FALLBACK ----------
      if (roadmapData.length > 0 && !selectedRoadmap) {
        setSelectedRoadmap(roadmapData[0]);
        const skills = extractMissingSkills(roadmapData[0]);
        setMissingSkills(skills);
        console.log('Set first roadmap as default:', roadmapData[0].career);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractMissingSkills = (roadmap) => {
    if (!roadmap) return [];

    if (roadmap.missingSkills && Array.isArray(roadmap.missingSkills)) {
      console.log('Using saved missingSkills from roadmap');
      return roadmap.missingSkills;
    }

    if (!roadmap?.roadmap?.roadmap) return [];

    console.log('Extracting skills from roadmap data');
    const allSkills = new Set();

    roadmap.roadmap.roadmap.forEach(month => {
      if (Array.isArray(month.skills)) {
        month.skills.forEach(skill => {
          if (typeof skill === 'string') {
            allSkills.add(skill.trim());
          } else if (typeof skill === 'object') {
            const text = skill.name || skill.skill || skill.description || '';
            if (text) allSkills.add(text.trim());
          }
        });
      }
    });

    return Array.from(allSkills);
  };

  const handleRoadmapSelect = (roadmap) => {
    setSelectedRoadmap(roadmap);

    const skills = extractMissingSkills(roadmap);
    setMissingSkills(skills);

    sessionStorage.setItem('selectedRoadmap', JSON.stringify(roadmap));
    sessionStorage.setItem('missingSkills', JSON.stringify(skills));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-t-yellow-400 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold">Loading certifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-6">🏆</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Personalized Certifications
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            AI-powered certification recommendations to accelerate your career growth
          </p>
        </div>

        {/* Roadmap Selector */}
        {roadmaps.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
            <h2 className="text-2xl font-bold mb-6">🎯 Select a Career Path</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <button
                  key={roadmap.id}
                  onClick={() => handleRoadmapSelect(roadmap)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    selectedRoadmap?.id === roadmap.id
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <h3 className="text-xl font-bold">{roadmap.career}</h3>
                  <p className="text-gray-600">
                    Created {roadmap.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          {selectedRoadmap ? (
            <Certifications
              careerPath={selectedRoadmap.career}
              missingSkills={missingSkills}
              quizResults={quizData}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No career path selected</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn">
            ← Back to Dashboard
          </button>
          <button onClick={() => navigate('/quiz')} className="btn">
            Take New Quiz
          </button>
          {selectedRoadmap && (
            <button onClick={() => navigate('/roadmap')} className="btn">
              View Full Roadmap →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
