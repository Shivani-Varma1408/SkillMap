// pages/CertificationsPage.js
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { generateCertifications } from '../services/geminiAPI';
import { useAuth } from '../context/AuthContext';

export default function CertificationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [certificationsData, setCertificationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingCerts, setGeneratingCerts] = useState(false);

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    console.log("Certifications mounted");
  }, []);

  useEffect(() => {
    // Redirect if no user
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    console.log('Location state:', location.state);
    loadData();
  }, [currentUser, navigate, location.state]);

  useEffect(() => {
    if (selectedRoadmap && missingSkills.length > 0 && !certificationsData && !generatingCerts && currentUser) {
      generateCertificationRecommendations();
    }
  }, [selectedRoadmap, missingSkills, certificationsData, generatingCerts, currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

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
      
      // ✅ FIXED: Only load roadmaps for current user
      const q = query(
        collection(db, 'roadmaps'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);

      const roadmapData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Loaded roadmaps:', roadmapData.length);
      setRoadmaps(roadmapData);

      // ✅ FIXED: Use quizAnswers from Firestore instead of sessionStorage
      if (roadmapData.length > 0) {
        // Try to find a roadmap with quiz data
        const roadmapWithQuiz = roadmapData.find(r => r.quizAnswers && Object.keys(r.quizAnswers).length > 0);
        
        if (roadmapWithQuiz) {
          setSelectedRoadmap(roadmapWithQuiz);
          setQuizData(roadmapWithQuiz.quizAnswers || {});
          const skills = extractMissingSkills(roadmapWithQuiz);
          setMissingSkills(skills);
          console.log('Found roadmap with quiz data:', roadmapWithQuiz.career);
        } else if (roadmapData.length > 0) {
          // Fallback to first roadmap
          setSelectedRoadmap(roadmapData[0]);
          const skills = extractMissingSkills(roadmapData[0]);
          setMissingSkills(skills);
          console.log('Set first roadmap as default:', roadmapData[0].career);
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractMissingSkills = (roadmap) => {
    if (!roadmap) return [];

    // ✅ FIXED: Use quizAnswers from roadmap if available
    if (roadmap.missingSkills && Array.isArray(roadmap.missingSkills)) {
      console.log('Using saved missingSkills from roadmap');
      return roadmap.missingSkills;
    }

    // Try to extract from quiz answers
    if (roadmap.quizAnswers && roadmap.quizAnswers.missingSkills) {
      console.log('Using missingSkills from quizAnswers');
      return roadmap.quizAnswers.missingSkills;
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

  const generateCertificationRecommendations = async () => {
    // ✅ FIXED: Added currentUser check and better validation
    if (!selectedRoadmap || missingSkills.length === 0 || !currentUser) {
      console.log('Missing required data for certifications:', {
        hasRoadmap: !!selectedRoadmap,
        missingSkillsCount: missingSkills.length,
        hasUser: !!currentUser
      });
      return;
    }
    
    setGeneratingCerts(true);
    try {
      console.log('Generating certification recommendations for:', {
        career: selectedRoadmap.career,
        skills: missingSkills.length,
        quizAnswers: selectedRoadmap.quizAnswers ? 'available' : 'none'
      });

      // ✅ FIXED: Use quizAnswers from Firestore roadmap, not sessionStorage
      const certs = await generateCertifications(
        missingSkills,
        selectedRoadmap.career,
        selectedRoadmap.quizAnswers || {}
      );

      console.log('Generated certifications:', certs);
      setCertificationsData(certs);
    } catch (error) {
      console.error('Failed to generate certifications:', error);
      
      // Set fallback data with current user context
      setCertificationsData({
        certifications: missingSkills.map(skill => ({
          skill: skill,
          certifications: [
            {
              name: `${skill} Fundamentals Certification`,
              provider: "Microsoft",
              level: "Beginner",
              duration: "2-3 months",
              cost: "$99-$165",
              description: `Official certification for ${skill} fundamentals`,
              link: "https://learn.microsoft.com/en-us/certifications/",
              prerequisites: ["Basic knowledge recommended"],
              examRequired: true
            },
            {
              name: `Google Career Certificate: ${skill}`,
              provider: "Google",
              level: "Beginner",
              duration: "3-6 months",
              cost: "$49/month",
              description: `Comprehensive ${skill} certification from Google`,
              link: "https://grow.google/certificates/",
              prerequisites: [],
              examRequired: false
            }
          ],
          whyRecommended: `These certifications are industry-recognized and relevant for ${selectedRoadmap.career}`
        })),
        recommendedProvider: "Microsoft and Google offer the most comprehensive certifications",
        timeline: "Complete 1-2 certifications every 3 months"
      });
    } finally {
      setGeneratingCerts(false);
    }
  };

  const handleRoadmapSelect = (roadmap) => {
    setSelectedRoadmap(roadmap);

    const skills = extractMissingSkills(roadmap);
    setMissingSkills(skills);
    
    // ✅ FIXED: Use quizAnswers from Firestore roadmap
    setQuizData(roadmap.quizAnswers || {});
    
    // Clear old certifications when roadmap changes
    setCertificationsData(null);
  };

  const refreshCertifications = () => {
    setCertificationsData(null);
    generateCertificationRecommendations();
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
          
          {selectedRoadmap && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block">
              <p className="text-white text-lg">
                Career Path: <span className="font-bold">{selectedRoadmap.career}</span>
              </p>
              <p className="text-white/80">
                Skills to certify: <span className="font-semibold">{missingSkills.length}</span>
              </p>
            </div>
          )}
        </div>

        {/* Roadmap Selector */}
        {roadmaps.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🎯 Select a Career Path</h2>
              {certificationsData && (
                <button
                  onClick={refreshCertifications}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  🔄 Refresh Certifications
                </button>
              )}
            </div>

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

        {/* Certifications Display */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {generatingCerts ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">
                Generating AI-powered certification recommendations...
              </p>
              <p className="text-gray-500 mt-2">
                Analyzing your skills and career path to find the best certifications
              </p>
            </div>
          ) : certificationsData ? (
            <div>
              {/* Overall Recommendations */}
              <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🌟 Overall Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-5 rounded-xl shadow-sm">
                    <div className="text-blue-600 text-2xl mb-2">🏢</div>
                    <h3 className="font-bold text-gray-800 mb-2">Recommended Provider</h3>
                    <p className="text-gray-600">{certificationsData.recommendedProvider}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm">
                    <div className="text-purple-600 text-2xl mb-2">📅</div>
                    <h3 className="font-bold text-gray-800 mb-2">Suggested Timeline</h3>
                    <p className="text-gray-600">{certificationsData.timeline}</p>
                  </div>
                </div>
              </div>

              {/* Skills & Certifications */}
              <h2 className="text-3xl font-bold text-gray-800 mb-6">📚 Recommended Certifications</h2>
              
              <div className="space-y-8">
                {certificationsData.certifications.map((item, index) => (
                  <div key={index} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {item.skill}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {item.certifications.length} certifications
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-6">{item.whyRecommended}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {item.certifications.map((cert, certIndex) => (
                        <div key={certIndex} className="bg-gray-50 rounded-xl p-5 hover:bg-white transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg text-gray-800">{cert.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                  {cert.provider}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                                  {cert.level}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                  {cert.duration}
                                </span>
                              </div>
                            </div>
                            <span className="text-xl">
                              {cert.provider === 'Microsoft' ? '🔵' : 
                               cert.provider === 'Google' ? '🔴' : 
                               cert.provider === 'AWS' ? '🟠' : 
                               cert.provider === 'Nvidia' ? '🟢' : '🏢'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{cert.description}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>💵 {cert.cost}</span>
                              <span>{cert.examRequired ? '📝 Exam Required' : '📚 Course Only'}</span>
                            </div>
                            <a
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              View Details →
                            </a>
                          </div>
                          
                          {cert.prerequisites && cert.prerequisites.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Prerequisites:</p>
                              <div className="flex flex-wrap gap-2">
                                {cert.prerequisites.map((prereq, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {prereq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Tips */}
              <div className="mt-10 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Certification Tips</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>Start with 1-2 certifications that match your current skill level</li>
                  <li>Check if your employer offers certification reimbursement</li>
                  <li>Join study groups or online communities for each certification</li>
                  <li>Schedule your exam in advance to stay motivated</li>
                  <li>Add certifications to your LinkedIn profile after completion</li>
                </ul>
              </div>
            </div>
          ) : selectedRoadmap ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Ready to Generate Certification Recommendations
              </h3>
              <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                Click the button below to get AI-powered certification recommendations for your {selectedRoadmap.career} career path.
              </p>
              <button
                onClick={generateCertificationRecommendations}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
              >
                🚀 Generate Certifications
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Please select a career path to view certifications</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={() => navigate('/quiz')}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Take New Quiz
          </button>
          {selectedRoadmap && (
            <button 
              onClick={() => navigate('/roadmap')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              View Full Roadmap →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}