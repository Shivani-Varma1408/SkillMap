import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

// Function to calculate readiness based on completed skills/projects
export function calculateReadiness(progress, roadmap) {
  if (!roadmap?.roadmap?.roadmap) return { score: 0, status: "Not Started", improvements: [] };

  let totalTasks = 0;
  let completedTasks = 0;
  let missingSkills = [];

  roadmap.roadmap.roadmap.forEach((month, monthIndex) => {
    (month.skills || []).forEach((skill, skillIndex) => {
      totalTasks++;
      const key = `${monthIndex}-skill-${skillIndex}`;
      if (progress[key]) {
        completedTasks++;
      } else {
        missingSkills.push(skill);
      }
    });

    (month.projects || []).forEach((project, projectIndex) => {
      totalTasks++;
      const key = `${monthIndex}-project-${projectIndex}`;
      if (progress[key]) completedTasks++;
    });
  });

  const score = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  let status = "Begin";
  if (score >= 70) status = "Ready";
  else if (score >= 40) status = "In Progress";
  else status = "Just Started";

  const improvements = missingSkills.slice(0, 5);

  return { score, status, improvements };
}

// Custom Circular Progress Component (no external libraries needed)
function CircularProgress({ value, size = 120, thickness = 8 }) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 100;
  const offset = circumference - (progress * circumference);

  let ringColor = "";
  let textColor = "";
  
  if (value >= 70) {
    ringColor = "text-green-500";
    textColor = "text-green-600";
  } else if (value >= 40) {
    ringColor = "text-yellow-500";
    textColor = "text-yellow-600";
  } else {
    ringColor = "text-red-500";
    textColor = "text-red-600";
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          className="text-gray-200 fill-none"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          className={`${ringColor} fill-none transition-all duration-500`}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${textColor}`}>{value}%</span>
      </div>
    </div>
  );
}

export default function InternshipReadiness({ userId, roadmap }) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !roadmap?.id) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const progressRef = doc(db, 'users', userId, 'progress', roadmap.id);
        const progressSnap = await getDoc(progressRef);
        
        if (progressSnap.exists()) {
          const progressData = progressSnap.data();
          setProgress(progressData.tasks || {});
        } else {
          setProgress({});
        }
      } catch (err) {
        console.error("Error fetching progress:", err);
        setProgress({});
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId, roadmap?.id]);

  if (loading) {
    return (
      <div className="min-h-48 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Internship Readiness...</p>
      </div>
    );
  }

  const { score, status, improvements } = calculateReadiness(progress, roadmap);

  return (
    <div className="internship-readiness p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        🎯 Internship Readiness
      </h3>

      <div className="flex flex-col items-center justify-center mb-6">
        <CircularProgress value={score} />
        <div className="mt-4 text-center">
          <p className={`text-lg font-semibold ${status === "Ready" ? "text-green-600" : status === "In Progress" ? "text-yellow-600" : "text-red-600"}`}>
            Status: {status}
          </p>
        </div>
      </div>

      {status === "Ready" && (
        <div className="action-panel mt-4 p-4 bg-green-50 rounded-lg text-center border border-green-200">
          <h4 className="font-semibold mb-3 text-green-800">🎉 You're ready to apply!</h4>
          <button className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow">
            View Internship Opportunities
          </button>
        </div>
      )}

      {status !== "Ready" && (
        <div className="improvement-tips mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3 text-gray-800">
            {score >= 40 ? "Almost there!" : "To reach 70% readiness:"}
          </h4>
          <ul className="space-y-2">
            {improvements.length > 0 ? (
              improvements.map((tip, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-600 italic">Keep completing tasks in your roadmap!</li>
            )}
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Progress: {score}%</span>
              <span className="text-sm font-medium">
                {score >= 40 ? `${70 - score}% to go` : "Keep going!"}
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}