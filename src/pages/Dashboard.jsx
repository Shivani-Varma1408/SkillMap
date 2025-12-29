import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function Dashboard() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadRoadmaps();
    loadProgress();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const q = query(collection(db, 'roadmaps'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Loaded roadmaps from Firebase:', data.length);
      setRoadmaps(data);
      if (data.length > 0) {
        setSelectedRoadmap(data[0]);
      }
    } catch (error) {
      console.error('Error loading roadmaps:', error);
      // Set empty array so it doesn't hang
      setRoadmaps([]);
    } finally {
      // Always stop loading after 3 seconds max
      setTimeout(() => setLoading(false), 100);
    }
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('roadmapProgress');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  };

  const toggleTask = (monthIndex, taskType, taskIndex) => {
    const key = `${selectedRoadmap.id}-${monthIndex}-${taskType}-${taskIndex}`;
    const newProgress = {
      ...progress,
      [key]: !progress[key]
    };
    setProgress(newProgress);
    localStorage.setItem('roadmapProgress', JSON.stringify(newProgress));
  };

  const calculateProgress = () => {
    if (!selectedRoadmap?.roadmap?.roadmap) return 0;
    
    let total = 0;
    let completed = 0;
    
    selectedRoadmap.roadmap.roadmap.forEach((month, monthIndex) => {
      month.skills?.forEach((_, skillIndex) => {
        total++;
        const key = `${selectedRoadmap.id}-${monthIndex}-skill-${skillIndex}`;
        if (progress[key]) completed++;
      });
      month.projects?.forEach((_, projectIndex) => {
        total++;
        const key = `${selectedRoadmap.id}-${monthIndex}-project-${projectIndex}`;
        if (progress[key]) completed++;
      });
    });
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-2xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">📭</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Roadmaps Yet</h2>
          <p className="text-gray-600 mb-8">
            Take the quiz and generate your personalized roadmap to get started!
          </p>
          <a
            href="/quiz"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
          >
            Take Quiz Now →
          </a>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-5xl font-bold text-white mb-2">Your Dashboard</h1>
          <p className="text-xl text-white/90">Track your learning journey</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedRoadmap?.career}
              </h2>
              <p className="text-gray-600">Started {new Date(selectedRoadmap?.createdAt?.toDate()).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-purple-600">{progressPercentage}%</div>
              <div className="text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end px-3"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-white text-sm font-bold">{progressPercentage}%</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-purple-600">
                {selectedRoadmap?.roadmap?.roadmap?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Months</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl mb-2">💻</div>
              <div className="text-2xl font-bold text-blue-600">
                {selectedRoadmap?.roadmap?.roadmap?.reduce((sum, m) => sum + (m.projects?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-green-600">
                {selectedRoadmap?.roadmap?.roadmap?.reduce((sum, m) => sum + (m.skills?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-orange-600">
                {progressPercentage > 75 ? 'Almost!' : progressPercentage > 50 ? 'Halfway' : progressPercentage > 25 ? 'Started' : 'Begin'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="space-y-6">
          {selectedRoadmap?.roadmap?.roadmap?.map((month, monthIndex) => {
            const monthSkills = month.skills || [];
            const monthProjects = month.projects || [];
            const completedSkills = monthSkills.filter((_, i) => 
              progress[`${selectedRoadmap.id}-${monthIndex}-skill-${i}`]
            ).length;
            const completedProjects = monthProjects.filter((_, i) => 
              progress[`${selectedRoadmap.id}-${monthIndex}-project-${i}`]
            ).length;
            const monthProgress = Math.round(
              ((completedSkills + completedProjects) / (monthSkills.length + monthProjects.length)) * 100
            ) || 0;

            return (
              <div key={monthIndex} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Month Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90">Month {month.month}</div>
                      <h3 className="text-3xl font-bold">{month.title}</h3>
                      <p className="mt-2 text-white/90">{month.focus}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{monthProgress}%</div>
                      <div className="text-sm">Complete</div>
                    </div>
                  </div>
                  
                  {/* Month Progress Bar */}
                  <div className="mt-4 w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${monthProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Skills Checklist */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>📚</span> Skills to Master ({completedSkills}/{monthSkills.length})
                    </h4>
                    <div className="space-y-2">
                      {monthSkills.map((skill, skillIndex) => {
                        const key = `${selectedRoadmap.id}-${monthIndex}-skill-${skillIndex}`;
                        const isCompleted = progress[key];
                        return (
                          <button
                            key={skillIndex}
                            onClick={() => toggleTask(monthIndex, 'skill', skillIndex)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300'
                              }`}>
                                {isCompleted && <span className="text-white text-sm">✓</span>}
                              </div>
                              <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {skill}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Projects Checklist */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>💻</span> Projects to Build ({completedProjects}/{monthProjects.length})
                    </h4>
                    <div className="space-y-3">
                      {monthProjects.map((project, projectIndex) => {
                        const key = `${selectedRoadmap.id}-${monthIndex}-project-${projectIndex}`;
                        const isCompleted = progress[key];
                        return (
                          <button
                            key={projectIndex}
                            onClick={() => toggleTask(monthIndex, 'project', projectIndex)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isCompleted
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {isCompleted && <span className="text-white text-sm">✓</span>}
                              </div>
                              <div className="flex-1">
                                <div className={`font-semibold mb-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {project.name}
                                </div>
                                <div className={`text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                  {project.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                      <span>🎓</span> Learning Resources
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {month.resources?.map((resource, idx) => (
                        <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-800 text-sm">{resource.name}</div>
                          <div className="text-xs text-gray-600">{resource.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Quote */}
        <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">
            {progressPercentage === 100 ? '🎉' : progressPercentage > 75 ? '🔥' : progressPercentage > 50 ? '💪' : '🚀'}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {progressPercentage === 100
              ? 'Congratulations! You\'ve completed your roadmap!'
              : progressPercentage > 75
              ? 'Almost there! Keep pushing!'
              : progressPercentage > 50
              ? 'You\'re halfway through! Great progress!'
              : progressPercentage > 25
              ? 'Great start! Keep the momentum going!'
              : 'Your journey begins now! Take the first step today!'}
          </p>
        </div>
      </div>
    </div>
  );

 
}