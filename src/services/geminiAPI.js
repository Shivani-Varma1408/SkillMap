import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with your key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// IMPORTANT: Use gemini-3-flash-preview or gemini-2.5-flash
// gemini-1.5-flash was retired in Sept 2025 and causes the 404 error
const modelConfig = {
  model: "gemini-3-flash-preview", 
  generationConfig: {
    responseMimeType: "application/json",
  },
};

export const generateCareerSuggestions = async (quizAnswers) => {
  try {
    const model = genAI.getGenerativeModel(modelConfig);

    const prompt = `Based on these career quiz responses: ${JSON.stringify(quizAnswers)}
      Suggest exactly 3 suitable tech career paths. Respond ONLY with this JSON structure:
      {
        "careers": [
          {
            "title": "string",
            "description": "string",
            "skills": ["string"],
            "match": "string",
            "salary": "string",
            "demand": "string"
          }
        ]
      }`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('❌ Career Suggestion Error:', error);
    throw error;
  }
};

export const generateLearningRoadmap = async ({ careerTitle, currentSkills, currentYear }) => {
  try {
    const model = genAI.getGenerativeModel(modelConfig);

    const prompt = `Create a 6-month roadmap for a ${currentYear} student to become a ${careerTitle}.
      Current level: ${currentSkills || 'Beginner'}.
      Respond ONLY with this JSON structure:
      {
        "roadmap": [{
          "month": number,
          "title": "string",
          "focus": "string",
          "skills": ["string"],
          "resources": [{"name": "string", "type": "string", "link": "string"}],
          "projects": [{"name": "string", "description": "string"}],
          "weeklyHours": "string"
        }],
        "totalEstimate": "string",
        "nextSteps": "string"
      }`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('❌ Roadmap Generation Error:', error);
    throw error;
  }
};