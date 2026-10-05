import { createElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesColumnIncreasing,
  Cloud,
  Code2,
  Cpu,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Hash,
  Headphones,
  Heart,
  Image,
  Landmark,
  Lightbulb,
  Map,
  MessagesSquare,
  Microscope,
  Palette,
  Puzzle,
  Rocket,
  Scale,
  Settings,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const quizQuestions = [
  {
    id: 1,
    question: "What interests you most in tech?",
    icon: Target,
    options: [
      { text: "Building apps and websites", icon: Code2 },
      { text: "Analyzing data and finding patterns", icon: ChartNoAxesColumnIncreasing },
      { text: "Designing beautiful user experiences", icon: Palette },
      { text: "Solving complex algorithmic problems", icon: Puzzle },
      { text: "Managing teams and projects", icon: Users }
    ]
  },
  {
    id: 2,
    question: "What's your ideal work style?",
    icon: BriefcaseBusiness,
    options: [
      { text: "Deep focus, independent work", icon: Headphones },
      { text: "Collaborative team projects", icon: Handshake },
      { text: "Mix of both collaboration and solo work", icon: Scale },
      { text: "Client-facing, lots of communication", icon: MessagesSquare },
      { text: "Remote and flexible schedule", icon: Globe }
    ]
  },
  {
    id: 3,
    question: "Technical or Creative?",
    icon: SlidersHorizontal,
    options: [
      { text: "Very technical - love logic and systems", icon: Settings },
      { text: "Very creative - love design and aesthetics", icon: Palette },
      { text: "Perfect balance of both", icon: SlidersHorizontal },
      { text: "Technical with creative problem-solving", icon: Microscope },
      { text: "Creative with technical implementation", icon: Sparkles }
    ]
  },
  {
    id: 4,
    question: "Which subjects did you enjoy most?",
    icon: BookOpen,
    options: [
      { text: "Math and Logic", icon: Hash },
      { text: "Art and Design", icon: Image },
      { text: "Science and Research", icon: FlaskConical },
      { text: "Business and Communication", icon: BriefcaseBusiness },
      { text: "Technology and Engineering", icon: Cpu }
    ]
  },
  {
    id: 5,
    question: "Current coding experience?",
    icon: Code2,
    options: [
      { text: "Complete beginner", icon: Sprout },
      { text: "Basic HTML/CSS", icon: FileText },
      { text: "Some programming experience", icon: Rocket },
      { text: "Comfortable with multiple languages", icon: Code2 },
      { text: "Advanced developer", icon: Trophy }
    ]
  },
  {
    id: 6,
    question: "What problems excite you?",
    icon: Lightbulb,
    options: [
      { text: "Making interfaces beautiful and intuitive", icon: Sparkles },
      { text: "Optimizing performance and efficiency", icon: Zap },
      { text: "Understanding user needs and behavior", icon: Users },
      { text: "Working with big data and patterns", icon: TrendingUp },
      { text: "Building scalable systems", icon: Boxes }
    ]
  },
  {
    id: 7,
    question: "Dream work environment?",
    icon: Building2,
    options: [
      { text: "Startup - fast-paced, innovative", icon: Rocket },
      { text: "Big Tech - structured, great resources", icon: Landmark },
      { text: "Freelance - independent, flexible", icon: Globe },
      { text: "Agency - variety of projects", icon: Building2 },
      { text: "Non-profit - mission-driven", icon: Heart }
    ]
  },
  {
    id: 8,
    question: "Which skill sounds most exciting?",
    icon: GraduationCap,
    options: [
      { text: "Mastering programming languages", icon: Code2 },
      { text: "Design tools (Figma, Adobe XD)", icon: Palette },
      { text: "Data science and ML", icon: Bot },
      { text: "Cloud computing (AWS, Azure)", icon: Cloud },
      { text: "Product management", icon: Smartphone }
    ]
  }
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

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
    
    console.log('Quiz completed! Answers:', finalAnswers);
    
    try {
      let quizId = 'temp-' + Date.now();
      
      try {
        // Save directly to Firestore with user association
        const docRef = await addDoc(collection(db, 'quizResults'), {
          userId: currentUser?.uid || 'anonymous',
          userEmail: currentUser?.email || 'anonymous',
          answers: finalAnswers,
          timestamp: new Date(),
          completed: true
        });
        quizId = docRef.id;
        console.log('Quiz saved to Firestore with ID:', quizId);
      } catch (fbError) {
        console.warn('Firestore save failed, using temp ID:', fbError);
        quizId = 'temp-' + Date.now();
      }

      // Navigate with quiz data (Firestore is source of truth)
      setTimeout(() => {
        navigate('/roadmap', { 
          state: { 
            quizId: quizId,
            answers: finalAnswers
          },
          replace: false
        });
      }, 1500);

    } catch (error) {
      console.error('Error in quiz submission:', error);
      
      // Fallback navigation with temp data
      setTimeout(() => {
        navigate('/roadmap', { 
          state: { 
            quizId: 'temp-' + Date.now(),
            answers: finalAnswers 
          } 
        });
      }, 500);
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
          <div className="mb-8 flex justify-center text-[#1f5747]"><Rocket size={56} strokeWidth={1.6} /></div>
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
                <Zap size={28} className="mx-auto mb-2 text-[#28725b]" />
                <div className="text-white font-semibold">2 Minutes</div>
                <div className="text-white/70 text-sm">Quick & Easy</div>
              </div>
              <div className="text-center">
                <Target size={28} className="mx-auto mb-2 text-[#28725b]" />
                <div className="text-white font-semibold">AI-Powered</div>
                <div className="text-white/70 text-sm">Personalized Results</div>
              </div>
              <div className="text-center">
                <Map size={28} className="mx-auto mb-2 text-[#28725b]" />
                <div className="text-white font-semibold">Get Roadmap</div>
                <div className="text-white/70 text-sm">Step by Step</div>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              className="w-full py-4 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-xl hover:scale-105 transform transition-all shadow-2xl hover:shadow-yellow-500/50"
            >
              Start Your Journey <ArrowRight size={19} className="ml-2 inline" />
            </button>
          </div>

          <p className="text-white/60 text-sm">
            Trusted by 10,000+ students finding their path
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
              <Bot size={34} className="text-[#28725b]" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">Analyzing Your Responses...</p>
            <p className="text-xl text-white/80">Preparing your career matches</p>
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

  const progress = (Object.keys(answers).length / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center text-[#1f5747]">{createElement(question.icon, { size: 40, strokeWidth: 1.7 })}</div>
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
                  <span className="text-[#28725b] transition-transform group-hover:scale-110">
                    {createElement(option.icon, { size: 26, strokeWidth: 1.8 })}
                  </span>
                  <div className="flex-1">
                    <span className="text-lg text-gray-700 group-hover:text-purple-700 font-medium">
                      {option.text}
                    </span>
                  </div>
                  <ArrowRight size={20} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="mt-6 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 group"
            >
              <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
              Back to previous question
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-white/80 text-sm">
          No wrong answers. Just be honest about your interests.
        </p>
      </div>
    </div>
  );
}