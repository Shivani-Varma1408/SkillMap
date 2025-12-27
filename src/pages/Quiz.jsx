import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

const quizQuestions = [
  {
    id: 1,
    question: "What interests you most in tech?",
    emoji: "🎯",
    options: [
      { text: "Building apps and websites", icon: "💻" },
      { text: "Analyzing data and finding patterns", icon: "📊" },
      { text: "Designing beautiful user experiences", icon: "🎨" },
      { text: "Solving complex algorithmic problems", icon: "🧩" },
      { text: "Managing teams and projects", icon: "👥" }
    ]
  },
  {
    id: 2,
    question: "What's your ideal work style?",
    emoji: "💼",
    options: [
      { text: "Deep focus, independent work", icon: "🎧" },
      { text: "Collaborative team projects", icon: "🤝" },
      { text: "Mix of both collaboration and solo work", icon: "⚖️" },
      { text: "Client-facing, lots of communication", icon: "🗣️" },
      { text: "Remote and flexible schedule", icon: "🌍" }
    ]
  },
  {
    id: 3,
    question: "Technical or Creative?",
    emoji: "🎭",
    options: [
      { text: "Very technical - love logic and systems", icon: "⚙️" },
      { text: "Very creative - love design and aesthetics", icon: "🎨" },
      { text: "Perfect balance of both", icon: "🌈" },
      { text: "Technical with creative problem-solving", icon: "🔬" },
      { text: "Creative with technical implementation", icon: "✨" }
    ]
  },
  {
    id: 4,
    question: "Which subjects did you enjoy most?",
    emoji: "📚",
    options: [
      { text: "Math and Logic", icon: "🔢" },
      { text: "Art and Design", icon: "🖼️" },
      { text: "Science and Research", icon: "🔬" },
      { text: "Business and Communication", icon: "💼" },
      { text: "Technology and Engineering", icon: "🛠️" }
    ]
  },
  {
    id: 5,
    question: "Current coding experience?",
    emoji: "👨‍💻",
    options: [
      { text: "Complete beginner", icon: "🌱" },
      { text: "Basic HTML/CSS", icon: "📝" },
      { text: "Some programming experience", icon: "🚀" },
      { text: "Comfortable with multiple languages", icon: "💪" },
      { text: "Advanced developer", icon: "🏆" }
    ]
  },
  {
    id: 6,
    question: "What problems excite you?",
    emoji: "💡",
    options: [
      { text: "Making interfaces beautiful and intuitive", icon: "✨" },
      { text: "Optimizing performance and efficiency", icon: "⚡" },
      { text: "Understanding user needs and behavior", icon: "🧠" },
      { text: "Working with big data and patterns", icon: "📈" },
      { text: "Building scalable systems", icon: "🏗️" }
    ]
  },
  {
    id: 7,
    question: "Dream work environment?",
    emoji: "🏢",
    options: [
      { text: "Startup - fast-paced, innovative", icon: "🚀" },
      { text: "Big Tech - structured, great resources", icon: "🏛️" },
      { text: "Freelance - independent, flexible", icon: "🌴" },
      { text: "Agency - variety of projects", icon: "🎪" },
      { text: "Non-profit - mission-driven", icon: "❤️" }
    ]
  },
  {
    id: 8,
    question: "Which skill sounds most exciting?",
    emoji: "🎓",
    options: [
      { text: "Mastering programming languages", icon: "💻" },
      { text: "Design tools (Figma, Adobe XD)", icon: "🎨" },
      { text: "Data science and ML", icon: "🤖" },
      { text: "Cloud computing (AWS, Azure)", icon: "☁️" },
      { text: "Product management", icon: "📱" }
    ]
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    const newAnswers = {
      ...answers,
      [quizQuestions[currentQuestion].id]: {
        question: quizQuestions[currentQuestion].question,
        answer: answer
      }
    };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setLoading(true);
    
    try {
      // Save to Firebase
      const docRef = await addDoc(collection(db, 'quizResults'), {
        answers: finalAnswers,
        timestamp: new Date(),
      });

      // Navigate to roadmap with quiz data
      setTimeout(() => {
        navigate('/roadmap', { 
          state: { 
            quizId: docRef.id,
            answers: finalAnswers 
          } 
        });
      }, 2000);

    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Oops! Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
          <div className="text-8xl mb-8 animate-bounce">🚀</div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Tech Career
            </span>
          </h1>
          <p className="text-2xl text-white/90 mb-8">
            Take our 8-question quiz and discover your ideal career path in tech
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-white font-semibold">2 Minutes</div>
                <div className="text-white/70 text-sm">Quick & Easy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-white font-semibold">AI-Powered</div>
                <div className="text-white/70 text-sm">Personalized Results</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <div className="text-white font-semibold">Get Roadmap</div>
                <div className="text-white/70 text-sm">Step by Step</div>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-4 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-xl hover:scale-105 transform transition-all shadow-2xl hover:shadow-yellow-500/50"
            >
              Start Your Journey →
            </button>
          </div>

          <p className="text-white/60 text-sm">
            Trusted for finding their path
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-white/20 rounded-full"></div>
            <div className="w-32 h-32 border-8 border-t-yellow-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl">
              🤖
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">Analyzing Your Responses...</p>
            <p className="text-xl text-white/80">Our AI is finding your perfect matches</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">{question.emoji}</div>
          <div className="text-white/80 text-sm mb-2">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/90 mb-2 font-medium">
            <span>{Math.round(progress)}% Complete</span>
            <span>{quizQuestions.length - currentQuestion - 1} questions left</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 transform transition-all duration-300 hover:shadow-purple-500/50">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {question.question}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option.text)}
                className="w-full text-left p-5 rounded-2xl border-3 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group hover:scale-105 transform hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl group-hover:scale-125 transition-transform">
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <span className="text-lg text-gray-700 group-hover:text-purple-700 font-medium">
                      {option.text}
                    </span>
                  </div>
                  <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="mt-6 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to previous question
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-white/80 text-sm">
          💡 No wrong answers - just be honest about your interests!
        </p>
      </div>
    </div>
  );
}