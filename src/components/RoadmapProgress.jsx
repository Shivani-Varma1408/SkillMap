import React, { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const RoadmapProgress = () => {
  const userId = "demoUser"; // replace with auth user later

  const [roadmap, setRoadmap] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load roadmap from Firebase
  useEffect(() => {
    const ref = doc(db, "users", userId);

    const unsubscribe = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        // Initialize with sample roadmap
        const sample = [
          { month: 1, tasks: ["Learn React basics", "Build a todo app", "Understand hooks"], completed: [false, false, false] },
          { month: 2, tasks: ["Master component composition", "Build a weather app", "Learn state management"], completed: [false, false, false] }
        ];
        await setDoc(ref, { roadmap: sample, streak: 0, lastCompletedDate: null });
        setRoadmap(sample);
        setStreak(0);
        calculateProgress(sample);
        setLoading(false);
        return;
      }

      const data = snap.data();
      setRoadmap(data.roadmap || []);
      setStreak(data.streak || 0);
      calculateProgress(data.roadmap || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateProgress = (roadmapData) => {
    let total = 0;
    let done = 0;
    roadmapData.forEach((m) => {
      total += m.tasks.length;
      done += m.completed.filter(Boolean).length;
    });
    setProgressPercent(total ? Math.round((done / total) * 100) : 0);
  };

  const toggleTask = async (mIndex, tIndex) => {
    const updated = [...roadmap];
    updated[mIndex].completed[tIndex] = !updated[mIndex].completed[tIndex];
    setRoadmap(updated);
    calculateProgress(updated);

    await updateDoc(doc(db, "users", userId), { roadmap: updated });
    updateStreak();
  };

  const updateStreak = async () => {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    const data = snap.data();
    const lastCompletedDate = data?.lastCompletedDate || null;

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = streak;
    if (lastCompletedDate === yesterday) newStreak++;
    else if (lastCompletedDate !== today) newStreak = 1;

    setStreak(newStreak);
    await updateDoc(ref, { streak: newStreak, lastCompletedDate: today });
  };

  // Add sample roadmap
  const addSampleRoadmap = async () => {
    const sample = [
      { month: 1, tasks: ["Learn React basics", "Build a todo app", "Understand hooks"], completed: [false, false, false] },
      { month: 2, tasks: ["Master component composition", "Build a weather app", "Learn state management"], completed: [false, false, false] }
    ];
    setRoadmap(sample);
    calculateProgress(sample);
    await updateDoc(doc(db, "users", userId), { roadmap: sample });
  };

  // Reset progress
  const resetProgress = async () => {
    if (!window.confirm("Reset all progress?")) return;

    const reset = roadmap.map((month) => ({
      ...month,
      completed: month.tasks.map(() => false),
    }));

    setRoadmap(reset);
    setStreak(0);
    calculateProgress(reset);
    await updateDoc(doc(db, "users", userId), { roadmap: reset, streak: 0, lastCompletedDate: null });
  };

  // Clear all data
  const clearData = async () => {
    if (!window.confirm("Delete entire roadmap?")) return;

    setRoadmap([]);
    setStreak(0);
    setProgressPercent(0);
    await updateDoc(doc(db, "users", userId), { roadmap: [], streak: 0, lastCompletedDate: null });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8 px-4">
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Roadmap Progress</h2>
        <div className="flex gap-2">
          {roadmap.length === 0 && (
            <button
              onClick={addSampleRoadmap}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Sample
            </button>
          )}
          {roadmap.length > 0 && (
            <>
              <button
                onClick={resetProgress}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Reset
              </button>
              <button
                onClick={clearData}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {roadmap.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No roadmap yet</p>
          <button
            onClick={addSampleRoadmap}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Sample Roadmap
          </button>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-4 rounded mb-2">
            <div
              className="bg-pink-500 h-4 rounded transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-sm text-gray-700 mb-1">{progressPercent}% Completed</p>
          <p className="font-semibold text-orange-600 mb-4">🔥 {streak} day streak</p>

          {roadmap.map((month, mIndex) => (
            <div
              key={mIndex}
              className="border border-gray-300 p-3 mt-4 rounded-lg bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Month {month.month}</h3>

              {month.tasks.map((task, tIndex) => (
                <label
                  key={tIndex}
                  className="flex gap-2 items-start mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={month.completed[tIndex]}
                    onChange={() => toggleTask(mIndex, tIndex)}
                    className="mt-1 h-4 w-4"
                  />
                  <span
                    className={
                      month.completed[tIndex]
                        ? "line-through text-gray-400"
                        : "text-gray-700"
                    }
                  >
                    {task}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
    </div>
  );
};

export default RoadmapProgress;
