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
      
      IMPORTANT RULES:
      1. ALL VALUES MUST BE STRINGS, NOT OBJECTS
      2. "focus" MUST be a string, not an object
      3. "skills" array must contain strings
      4. "projects" array must contain strings
      5. Keep descriptions concise and practical
      
      Respond ONLY with this JSON structure:
      {
        "roadmap": [{
          "month": number,
          "title": "string",
          "focus": "string description of what to focus on",
          "skills": ["string skill 1", "string skill 2"],
          "resources": [{"name": "string resource name", "type": "string", "link": "string"}],
          "projects": ["string project name", "string project name"],
          "weeklyHours": "string"
        }],
        "totalEstimate": "string",
        "nextSteps": "string"
      }
      
      Example of CORRECT format:
      {
        "roadmap": [{
          "month": 1,
          "title": "Web Development Fundamentals",
          "focus": "Learn HTML, CSS, and basic JavaScript to build static websites",
          "skills": ["HTML5", "CSS3", "JavaScript Basics"],
          "resources": [{"name": "freeCodeCamp HTML/CSS", "type": "Interactive Course", "link": "https://freecodecamp.org"}],
          "projects": ["Personal Portfolio Website", "Responsive Landing Page"],
          "weeklyHours": "10-15 hours"
        }]
      }`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());
    
    // Validate and sanitize the response
    return sanitizeRoadmapResponse(response);
  } catch (error) {
    console.error('❌ Roadmap Generation Error:', error);
    throw error;
  }
};

// Helper function to sanitize roadmap response
const sanitizeRoadmapResponse = (response) => {
  if (!response.roadmap) return response;
  
  // Process each month in the roadmap
  const sanitizedRoadmap = response.roadmap.map((month, index) => {
    // Ensure focus is a string
    let focusText = "";
    if (typeof month.focus === 'string') {
      focusText = month.focus;
    } else if (month.focus && typeof month.focus === 'object') {
      // If focus is an object, convert to string
      focusText = month.focus.description || month.focus.name || 
                 month.focus.focus || `Month ${month.month || index + 1} focus`;
    } else {
      focusText = `Month ${month.month || index + 1} learning objectives`;
    }
    
    // Ensure skills are strings
    const sanitizedSkills = (month.skills || []).map(skill => {
      if (typeof skill === 'string') return skill;
      if (skill && typeof skill === 'object') {
        return skill.name || skill.skill || skill.description || String(skill);
      }
      return String(skill);
    });
    
    // Ensure projects are strings
    const sanitizedProjects = (month.projects || []).map(project => {
      if (typeof project === 'string') return project;
      if (project && typeof project === 'object') {
        return project.name || project.project || project.description || String(project);
      }
      return String(project);
    });
    
    // Ensure resources have proper structure
    const sanitizedResources = (month.resources || []).map(resource => {
      if (typeof resource === 'string') {
        return {
          name: resource,
          type: "Resource",
          link: "#"
        };
      }
      if (resource && typeof resource === 'object') {
        return {
          name: resource.name || resource.title || "Resource",
          type: resource.type || "Resource",
          link: resource.link || resource.url || "#"
        };
      }
      return {
        name: "Learning Resource",
        type: "Resource",
        link: "#"
      };
    });
    
    return {
      month: month.month || index + 1,
      title: month.title || `Month ${month.month || index + 1}`,
      focus: focusText,
      skills: sanitizedSkills,
      projects: sanitizedProjects,
      resources: sanitizedResources,
      weeklyHours: month.weeklyHours || "10-15 hours"
    };
  });
  
  return {
    ...response,
    roadmap: sanitizedRoadmap,
    totalEstimate: response.totalEstimate || "6 months",
    nextSteps: response.nextSteps || "Continue building projects and applying for jobs"
  };
};