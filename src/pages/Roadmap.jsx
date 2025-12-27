import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Roadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState('careers'); // careers, input, generating, roadmap
  const [careers, setCareers] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [currentYear, setCurrentYear] = useState('First Year');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have quiz data from navigation state
    if (location.state?.answers) {
      console.log('✅ Quiz answers received from state:', location.state.answers);
      generateCareerSuggestions();
      return;
    }
    
    // Fallback: Check sessionStorage
    const savedQuizData = sessionStorage.getItem('quizData');
    if (savedQuizData) {
      try {
        const parsed = JSON.parse(savedQuizData);
        console.log('✅ Quiz answers loaded from sessionStorage:', parsed);
        // Update location state manually
        location.state = parsed;
        generateCareerSuggestions();
        return;
      } catch (e) {
        console.error('Failed to parse saved quiz data:', e);
      }
    }
    
    // No quiz data found
    console.log('❌ No quiz answers found, redirecting to quiz');
    setTimeout(() => navigate('/quiz'), 100);
  }, []);

  const generateCareerSuggestions = async () => {
    setLoading(true);
    
    console.log('🤖 Calling AI to generate career suggestions...');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Based on these career quiz responses: ${JSON.stringify(location.state.answers)}
            
Suggest exactly 3 suitable tech career paths. For each career path, provide:
1. Role title
2. Brief description (2-3 sentences)
3. Required skills (list 5-6 key skills)
4. Why it matches (2-3 sentences)
5. Average salary range
6. Job demand (High/Medium/Growing)

Respond ONLY with valid JSON:
{
  "careers": [
    {
      "title": "Career Title",
      "description": "Description",
      "skills": ["skill1", "skill2"],
      "match": "Why it matches",
      "salary": "$XX,XXX - $XXX,XXX",
      "demand": "High"
    }
  ]
}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 API Response received:', data);
      
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in API response');
      }
      
      const suggestions = JSON.parse(jsonMatch[0]);
      console.log('✅ Career suggestions parsed:', suggestions);

      setCareers(suggestions);
      setStep('careers');
    } catch (error) {
      console.error('❌ Error generating career suggestions:', error);
      alert('Something went wrong generating career suggestions. Error: ' + error.message + '\n\nPlease try again or check the console for details.');
      navigate('/quiz');
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `Create a detailed 6-month learning roadmap for a ${currentYear} student wanting to become a ${selectedCareer.title}.

Current skills: ${currentSkills || 'Complete beginner'}
Current year: ${currentYear}

For each month, provide:
- Main focus/theme
- Specific skills to learn (be very specific, not generic)
- 3-4 recommended resources (courses, books, websites)
- 2-3 hands-on projects to build
- Estimated weekly hours needed

Respond ONLY with valid JSON:
{
  "roadmap": [
    {
      "month": 1,
      "title": "Month title",
      "focus": "Main focus description",
      "skills": ["specific skill 1", "specific skill 2"],
      "resources": [
        {"name": "Resource name", "type": "Course/Book/Website", "link": "URL or platform"},
        {"name": "Resource 2", "type": "Course", "link": "URL"}
      ],
      "projects": [
        {"name": "Project name", "description": "What you'll build"},
        {"name": "Project 2", "description": "Description"}
      ],
      "weeklyHours": "5-8 hours"
    }
  ],
  "totalEstimate": "Total hours needed",
  "nextSteps": "What to do after 6 months"
}`
          }]
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const roadmapData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!roadmapData) {
        throw new Error('Failed to parse roadmap data');
      }

      // Save to Firebase
      try {
        await addDoc(collection(db, 'roadmaps'), {
          userId: location.state.quizId,
          career: selectedCareer.title,
          currentSkills,
          currentYear,
          roadmap: roadmapData,
          createdAt: new Date(),
        });
        console.log('Roadmap saved to Firebase');
      } catch (fbError) {
        console.warn('Firebase save failed:', fbError);
      }

      setRoadmap(roadmapData);
      setStep('roadmap');
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Failed to generate roadmap. Please try again. Error: ' + error.message);
      setStep('input');
    }
  };

  if (loading || step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-8 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-t-yellow-400 border-r-pink-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {step === 'generating' ? '🗺️' : '🤖'}
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold">
              {step === 'generating' ? 'Crafting Your Personalized Roadmap...' : 'Finding Your Perfect Matches...'}
            </p>
            <p className="text-xl text-white/80 mt-2">
              {step === 'generating' ? 'AI is creating your 6-month journey' : 'Analyzing your responses'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'careers' && careers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-5xl font-bold text-white mb-3">Your Perfect Career Matches</h1>
            <p className="text-xl text-white/90">AI has analyzed your responses. Here are your top 3 paths:</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {careers.careers.map((career, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transform transition-all duration-300 cursor-pointer group"
                onClick={() => handleCareerSelect(career)}
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white">
                  <div className="text-4xl mb-3">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{career.title}</h2>
                  <div className="flex gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">{career.salary}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">📈 {career.demand}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-gray-700">{career.description}</p>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span>⚡</span> Key Skills:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {career.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm text-green-800">
                      <strong>Perfect for you:</strong> {career.match}
                    </p>
                  </div>

                  <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold group-hover:shadow-lg transition-all">
                    Generate Roadmap →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setStep('careers')}
            className="text-white mb-6 flex items-center gap-2 hover:gap-3 transition-all"
          >
            <span>←</span> Back to career options
          </button>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Let's Personalize Your Roadmap
              </h1>
              <p className="text-gray-600">
                for <span className="text-purple-600 font-bold">{selectedCareer.title}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  📚 What's your current academic year?
                </label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                >
                  <option>First Year</option>
                  <option>Second Year</option>
                  <option>Third Year</option>
                  <option>Final Year</option>
                  <option>Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  💻 What skills do you already have?
                </label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g., HTML, CSS, Basic Python, Problem Solving... (or leave blank if complete beginner)"
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none h-32 text-lg"
                />
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>💡 Tip:</strong> Be honest about your current level. This helps us create the perfect roadmap for YOU!
                </p>
              </div>

              <button
                onClick={handleGenerateRoadmap}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Generate My Roadmap 🚀
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'roadmap' && roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🗺️</div>
            <h1 className="text-5xl font-bold text-white mb-3">Your 6-Month Roadmap</h1>
            <p className="text-xl text-white/90">
              to becoming a <span className="text-yellow-300 font-bold">{selectedCareer.title}</span>
            </p>
            <p className="text-white/80 mt-2">⏱️ {roadmap.totalEstimate}</p>
          </div>

          <div className="space-y-6">
            {roadmap.roadmap.map((month, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-500/50 transition-all"
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Month {month.month}</div>
                      <h2 className="text-3xl font-bold">{month.title}</h2>
                      <p className="mt-2 text-white/90">{month.focus}</p>
                    </div>
                    <div className="text-5xl">{index === 0 ? '🚀' : index === 1 ? '💪' : index === 2 ? '🔥' : index === 3 ? '⚡' : index === 4 ? '🎯' : '🏆'}</div>
                  </div>
                  <div className="mt-3 text-sm bg-white/20 px-3 py-1 rounded-full inline-block">
                    ⏱️ {month.weeklyHours}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>📚</span> Skills to Master
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {month.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                          <span className="text-purple-600">✓</span>
                          <span className="text-gray-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>🎓</span> Learning Resources
                    </h3>
                    <div className="space-y-2">
                      {month.resources.map((resource, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                          <span className="text-2xl">{resource.type === 'Course' ? '📹' : resource.type === 'Book' ? '📚' : '🌐'}</span>
                          <div>
                            <div className="font-semibold text-gray-800">{resource.name}</div>
                            <div className="text-sm text-gray-600">{resource.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>💻</span> Projects to Build
                    </h3>
                    <div className="space-y-3">
                      {month.projects.map((project, idx) => (
                        <div key={idx} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                          <div className="font-semibold text-gray-800 mb-1">{project.name}</div>
                          <div className="text-sm text-gray-600">{project.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🎯</span> What's Next?
            </h2>
            <p className="text-gray-700 text-lg mb-6">{roadmap.nextSteps}</p>
            
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Save to Dashboard →
              </button>
              <button
                onClick={() => window.print()}
                className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}