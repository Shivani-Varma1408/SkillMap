import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(0);
  
  const roles = [
    'Software Developer',
    'Data Scientist',
    'UI/UX Designer',
    'Product Manager',
    'DevOps Engineer',
    'Full Stack Developer'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-8 mb-20">
          {/* Animated Icon */}
          <div className="flex justify-center gap-4 text-6xl mb-8">
            <span className="animate-bounce delay-0">🚀</span>
            <span className="animate-bounce delay-100">💡</span>
            <span className="animate-bounce delay-200">🎯</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-7xl font-extrabold text-white leading-tight">
            Your AI-Powered
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
              Career Compass
            </span>
          </h1>

          {/* Rotating Role */}
          <div className="h-20 flex items-center justify-center">
            <p className="text-3xl text-white/90">
              Discover your path to becoming a{' '}
              <span className="font-bold text-yellow-300 inline-block min-w-[300px] text-left">
                {roles[currentRole]}
              </span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-6 justify-center items-center">
            <button
              onClick={() => navigate('/quiz')}
              className="px-10 py-5 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-gray-900 rounded-2xl font-bold text-xl hover:scale-110 transform transition-all shadow-2xl hover:shadow-yellow-500/50"
            >
              Start Your Journey →
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-xl hover:bg-white/20 transition-all border-2 border-white/30"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {[
            { icon: '⚡', number: '2 min', label: 'Quick Quiz' },
            { icon: '🤖', number: 'AI', label: 'Powered Analysis' },
            { icon: '🗺️', number: '6 months', label: 'Custom Roadmap' },
            { icon: '🎯', number: '100%', label: 'Personalized' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all transform hover:scale-105">
              <div className="text-5xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold text-white mb-1">{stat.number}</div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div id="features" className="space-y-12 mb-20">
          <h2 className="text-5xl font-bold text-white text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6">
                1
              </div>
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Take the Quiz</h3>
              <p className="text-gray-600">
                Answer 8 quick questions about your interests, skills, and goals. Takes just 2 minutes!
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6">
                2
              </div>
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Analyzes</h3>
              <p className="text-gray-600">
                Our advanced AI matches your profile with the perfect tech careers based on real industry data.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6">
                3
              </div>
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Get Your Roadmap</h3>
              <p className="text-gray-600">
                Receive a personalized 6-month learning plan with resources, projects, and milestones.
              </p>
            </div>
          </div>
        </div>

        {/* What You Get Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            What You'll Get
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎯', title: '3 Career Matches', desc: 'Perfectly aligned with your interests and skills' },
              { icon: '📚', title: 'Learning Resources', desc: 'Curated courses, books, and tutorials for each month' },
              { icon: '💻', title: 'Hands-on Projects', desc: 'Real-world projects to build your portfolio' },
              { icon: '📊', title: 'Skill Gap Analysis', desc: 'Know exactly what skills you need to develop' },
              { icon: '🏆', title: 'Certifications Guide', desc: 'Recommended certifications with priority levels' },
              { icon: '📈', title: 'Progress Tracking', desc: 'Dashboard to monitor your learning journey' }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 items-start bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition-all">
                <div className="text-4xl">{item.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/80">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Find Your Path?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Start your personalized career journey today
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="px-12 py-6 bg-gray-900 text-white rounded-2xl font-bold text-2xl hover:bg-gray-800 transform hover:scale-105 transition-all shadow-2xl"
          >
            Start Free Quiz Now →
          </button>
          <p className="text-gray-800 mt-4 text-sm">✨ No signup required • Takes 2 minutes • 100% Free</p>
        </div>
      </div>
    </div>
  );
}