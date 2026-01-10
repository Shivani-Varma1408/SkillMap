export default function Certifications({ careerPath, missingSkills, quizResults }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        Certifications for {careerPath}
      </h2>

      {missingSkills?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missingSkills.map((skill, index) => (
            <div
              key={index}
              className="p-5 rounded-xl border-l-4 border-purple-600 bg-purple-50"
            >
              <h3 className="text-lg font-semibold">{skill}</h3>
              <p className="text-gray-600 mt-1">
                Recommended certification to master this skill
              </p>

              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg">
                View Courses
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No missing skills found 🎉</p>
      )}
    </div>
  );
}
