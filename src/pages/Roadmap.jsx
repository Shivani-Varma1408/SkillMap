import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { generateCareerSuggestions, generateLearningRoadmap } from '../services/geminiAPI';
import { useAuth } from '../context/AuthContext';

export default function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [step, setStep] = useState('careers');
  const [careers, setCareers] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [currentYear, setCurrentYear] = useState('First Year');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missingSkills, setMissingSkills] = useState([]);
  const [firebaseRoadmapId, setFirebaseRoadmapId] = useState(null);

  useEffect(() => {
    const answers = location.state?.answers;
    
    if (answers) {
      console.log('✅ Quiz answers from navigation state');
      fetchSuggestions(answers);
    } else {
      console.log('⚠️ No quiz answers, loading existing roadmap');
      loadExistingRoadmap();
    }
  }, [location.state, currentUser]);

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
      // Check if user is logged in
      if (!currentUser) {
        alert('Please log in to save your roadmap');
        navigate('/login');
        return;
      }

      const answers = location.state?.answers;
      
      console.log('Generating roadmap with:', {
        careerTitle: selectedCareer.title,
        currentSkills,
        currentYear,
        hasQuizAnswers: !!answers
      });

      const data = await generateLearningRoadmap({
        careerTitle: selectedCareer.title,
        currentSkills,
        currentYear
      });

      console.log('Roadmap generated:', data);

      // Extract missing skills from the roadmap
      const extractedSkills = extractMissingSkills(data);
      setMissingSkills(extractedSkills);

      // Save roadmap to Firebase with userId
      let savedRoadmapId = null;
      try {
        const docRef = await addDoc(collection(db, 'roadmaps'), {
          userId: currentUser.uid, // ✅ CRITICAL: Associate roadmap with user
          career: selectedCareer.title,
          roadmap: data,
          missingSkills: extractedSkills,
          createdAt: new Date(),
          quizAnswers: answers || {}
        });
        savedRoadmapId = docRef.id;
        setFirebaseRoadmapId(savedRoadmapId);
        console.log('✅ Roadmap saved to Firebase for user:', currentUser.uid, 'ID:', savedRoadmapId);
      } catch (e) { 
        console.error("Firebase save failed", e);
        alert("Failed to save roadmap. Please try again.");
        setStep('input');
        return;
      }

      setRoadmap(data);
      setStep('roadmap');
    } catch (error) {
      console.error('Roadmap generation error:', error);
      alert("Error generating roadmap. Please try again.");
      setStep('input');
    }
  };

  // Helper function to extract skills from roadmap
  const extractMissingSkills = (roadmapData) => {
    if (!roadmapData?.roadmap) return [];
    
    const allSkills = new Set();
    
    roadmapData.roadmap.forEach(month => {
      if (month.skills && Array.isArray(month.skills)) {
        month.skills.forEach(skill => {
          if (typeof skill === 'string') {
            allSkills.add(skill.trim());
          } else if (skill && typeof skill === 'object') {
            const skillText = skill.name || skill.skill || skill.description || String(skill);
            allSkills.add(skillText.trim());
          }
        });
      }
    });
    
    return Array.from(allSkills);
  };

  // Helper to extract all skills from roadmap - SAFER VERSION
  const extractAllSkills = (roadmapData) => {
    // Handle both roadmapData.roadmap and direct roadmap array
    let roadmapArray;
    
    if (Array.isArray(roadmapData)) {
      // Direct array passed (new format)
      roadmapArray = roadmapData;
    } else if (roadmapData?.roadmap && Array.isArray(roadmapData.roadmap)) {
      // Nested object passed (old format)
      roadmapArray = roadmapData.roadmap;
    } else {
      return [];
    }
    
    const allSkills = new Set();
    
    roadmapArray.forEach(month => {
      if (month.skills && Array.isArray(month.skills)) {
        month.skills.forEach(skill => {
          if (typeof skill === 'string') {
            allSkills.add(skill.trim());
          } else if (skill && typeof skill === 'object') {
            const skillText = skill.name || skill.skill || skill.description || String(skill);
            allSkills.add(skillText.trim());
          }
        });
      }
    });
    
    return Array.from(allSkills);
  };

  const loadExistingRoadmap = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'roadmaps'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.size > 0) {
        const roadmapDoc = snapshot.docs[0].data();
        
        // Set the roadmap data directly
        setRoadmap(roadmapDoc.roadmap);
        setSelectedCareer({ title: roadmapDoc.career });
        setMissingSkills(roadmapDoc.missingSkills || []);
        setStep('roadmap');
        
        console.log('✅ Loaded existing roadmap:', roadmapDoc.career);
      } else {
        console.log('📭 No roadmaps found, redirecting to quiz');
        navigate('/quiz');
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCertifications = () => {
    try {
      if (!currentUser) {
        alert('Please log in');
        return;
      }

      const allSkills = extractAllSkills(roadmap);
      
      console.log('Navigating to certifications with data:', {
        userId: currentUser.uid,
        careerPath: selectedCareer.title,
        missingSkills: allSkills,
        quizResults: location.state?.answers || {}
      });

      navigate('/certifications', {
        state: {
          userId: currentUser.uid,
          careerPath: selectedCareer.title,
          missingSkills: allSkills,
          quizResults: location.state?.answers || {}
        }
      });
      
    } catch (error) {
      console.error('Error navigating to certifications:', error);
      alert('Error navigating to certifications. Please try again.');
    }
  };

  const navigateToDashboard = () => {
    // Just navigate - Dashboard will load from Firestore
    navigate('/dashboard');
  };

  // --- LOADING UI ---
  if (loading || step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-yellow-400 border-white/20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl font-bold mb-2">
            {step === 'generating' ? 'Generating Your Roadmap...' : 'Finding Career Matches...'}
          </p>
          <p className="text-white/80">
            {step === 'generating' 
              ? 'AI is creating a personalized learning path for you' 
              : 'Analyzing your quiz results...'}
          </p>
        </div>
      </div>
    );
  }

  // --- CAREER LIST UI ---
  if (step === 'careers' && careers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Career Path</h1>
            <p className="text-xl text-white/90">Based on your quiz results, here are the best matches</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {careers.careers.map((career, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-3xl shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => handleCareerSelect(career)}
              >
                <div className="mb-4">
                  <div className="text-4xl mb-3">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</div>
                  <h2 className="text-2xl font-bold text-purple-700 mb-2">{career.title}</h2>
                  <p className="text-gray-600 mb-4">{career.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{career.matchPercentage || 'High Match'}</span>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg">
                    Get Roadmap →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- INPUT FORM UI ---
  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Personalize Your Roadmap</h2>
            <p className="text-gray-600">Help us create the perfect learning path for you</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Current Academic Year</label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={currentYear} 
                onChange={(e) => setCurrentYear(e.target.value)}
              >
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
                <option value="Third Year">Third Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Current Skills & Experience</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., I know HTML, CSS, basic JavaScript. I've built a simple portfolio website..."
                rows="4"
                value={currentSkills} 
                onChange={(e) => setCurrentSkills(e.target.value)} 
              />
              <p className="text-sm text-gray-500 mt-1">Be specific to get better recommendations</p>
            </div>
            
            <button 
              onClick={handleGenerateRoadmap} 
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all mt-6"
            >
              Generate Personalized Roadmap 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- FINAL ROADMAP UI ---
  if (step === 'roadmap' && roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">{selectedCareer.title} Roadmap</h1>
            <p className="text-gray-600 text-lg">Your personalized {roadmap.roadmap?.length || 6}-month learning journey</p>
          </div>

          {/* Roadmap Timeline */}
          <div className="space-y-6 mb-10">
            {roadmap.roadmap?.map((m, i) => {
              let focusText = "";
              if (typeof m.focus === 'string') {
                focusText = m.focus;
              } else if (m.focus && typeof m.focus === 'object') {
                focusText = m.focus.description || m.focus.name || 
                           m.focus.focus || `Month ${m.month || i + 1} focus`;
              } else {
                focusText = `Month ${m.month || i + 1} learning objectives`;
              }
              
              return (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-lg border-l-8 border-purple-600 hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-2">
                        Month {m.month || i + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{m.title || `Month ${m.month || i + 1}`}</h3>
                      <p className="text-gray-600">{focusText}</p>
                    </div>
                    <div className="text-3xl">{i === 0 ? '📚' : i === 1 ? '💻' : i === 2 ? '⚡' : '🚀'}</div>
                  </div>
                  
                  {/* Skills Section */}
                  {m.skills && m.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-lg">🎯</span> Skills to Learn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {m.skills.map((skill, idx) => {
                          let skillText = "";
                          if (typeof skill === 'string') {
                            skillText = skill;
                          } else if (skill && typeof skill === 'object') {
                            skillText = skill.name || skill.skill || 
                                       skill.description || JSON.stringify(skill);
                          } else {
                            skillText = String(skill);
                          }
                          
                          return (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                              {skillText}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {m.projects && m.projects.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-lg">💻</span> Projects
                      </h4>
                      <ul className="space-y-2">
                        {m.projects.map((project, idx) => {
                          let projectText = "";
                          if (typeof project === 'string') {
                            projectText = project;
                          } else if (project && typeof project === 'object') {
                            projectText = project.name || project.project || 
                                         project.description || JSON.stringify(project);
                          } else {
                            projectText = String(project);
                          }
                          
                          return (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span className="text-gray-700">{projectText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Resources Section */}
                  {m.resources && m.resources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="text-lg">📖</span> Resources
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.resources.map((resource, idx) => {
                          let resourceName = "";
                          let resourceUrl = "#";
                          
                          if (typeof resource === 'string') {
                            resourceName = resource;
                          } else if (resource && typeof resource === 'object') {
                            resourceName = resource.name || resource.title || 
                                          resource.description || "Resource";
                            resourceUrl = resource.link || resource.url || "#";
                          } else {
                            resourceName = "Learning Resource";
                          }
                          
                          return (
                            <a 
                              key={idx}
                              href={resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                            >
                              {resourceName}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button 
              onClick={navigateToCertifications}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-xl transition-all"
            >
              🏆 Get Recommended Certifications
            </button>
            
            <button 
              onClick={navigateToDashboard}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Save to Dashboard →
            </button>
            
            <div className="flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                📄 Print Roadmap
              </button>
              <button 
                onClick={() => navigate('/quiz')}
                className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors"
              >
                🔄 Take Quiz Again
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-10 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
            <h3 className="font-bold text-gray-800 mb-4 text-center">Roadmap Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3">
                <div className="text-2xl font-bold text-purple-600">{roadmap.roadmap?.length || 0}</div>
                <div className="text-sm text-gray-600">Months</div>
              </div>
              <div className="text-center p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {roadmap.roadmap?.reduce((sum, m) => sum + (m.skills?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center p-3">
                <div className="text-2xl font-bold text-green-600">
                  {roadmap.roadmap?.reduce((sum, m) => sum + (m.projects?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Projects</div>
              </div>
              <div className="text-center p-3">
                <div className="text-2xl font-bold text-orange-600">
                  {missingSkills.length}
                </div>
                <div className="text-sm text-gray-600">Skill Gaps</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}