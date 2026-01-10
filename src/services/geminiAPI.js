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

// NEW FUNCTION: Generate certification recommendations
export const generateCertifications = async (skills, careerPath, quizData) => {
  try {
    const model = genAI.getGenerativeModel(modelConfig);

    const prompt = `Based on this career path: ${careerPath}, 
    the user's skills: ${JSON.stringify(skills)},
    and their quiz preferences: ${JSON.stringify(quizData)}
    
    Recommend REAL certification programs from reputable providers like:
    - Microsoft (Azure, Microsoft Certified)
    - Google (Google Cloud, Google Career Certificates)
    - AWS (Amazon Web Services)
    - Oracle
    - IBM
    - CompTIA
    - Cisco
    - Nvidia
    - SAS
    - Tableau
    - Salesforce
    - PMI (Project Management Institute)
    
    For each skill/topic, recommend 1-2 specific certifications with:
    1. Certification name
    2. Provider (Company/Organization)
    3. Level (Beginner/Intermediate/Advanced)
    4. Estimated time to complete
    5. Official website link
    
    Respond ONLY with this JSON structure:
    {
      "certifications": [
        {
          "skill": "string (the skill topic)",
          "certifications": [
            {
              "name": "string (certification name)",
              "provider": "string (e.g., Microsoft, Google, AWS)",
              "level": "string (Beginner/Intermediate/Advanced)",
              "duration": "string (e.g., 2-3 months, 6 weeks)",
              "cost": "string (e.g., Free, $99, $165)",
              "description": "string (brief description)",
              "link": "string (official URL)",
              "prerequisites": ["string"],
              "examRequired": boolean
            }
          ],
          "whyRecommended": "string (why this certification fits the user)"
        }
      ],
      "recommendedProvider": "string (e.g., Microsoft for cloud, Google for data)",
      "timeline": "string (suggested certification timeline)"
    }
    
    Example:
    {
      "certifications": [
        {
          "skill": "Python Programming",
          "certifications": [
            {
              "name": "PCAP: Programming Essentials in Python",
              "provider": "Cisco",
              "level": "Beginner",
              "duration": "2-3 months",
              "cost": "Free",
              "description": "Covers Python fundamentals, OOP, and basic algorithms",
              "link": "https://www.netacad.com/courses/programming/pcap-programming-essentials-python",
              "prerequisites": ["Basic programming knowledge"],
              "examRequired": true
            },
            {
              "name": "Microsoft Certified: Azure AI Fundamentals",
              "provider": "Microsoft",
              "level": "Beginner",
              "duration": "1-2 months",
              "cost": "$99",
              "description": "Covers AI/ML concepts including Python for AI",
              "link": "https://learn.microsoft.com/en-us/certifications/azure-ai-fundamentals/",
              "prerequisites": [],
              "examRequired": true
            }
          ],
          "whyRecommended": "These certifications combine Python skills with cloud/AI applications relevant to Data Solutions"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('❌ Certification Generation Error:', error);
    // Return fallback certifications if API fails
    return getFallbackCertifications(skills, careerPath);
  }
};

// Fallback certifications in case API fails
const getFallbackCertifications = (skills, careerPath) => {
  const providerMap = {
    "Python": ["Microsoft", "Google"],
    "SQL": ["Microsoft", "Oracle"],
    "Data Analysis": ["Microsoft", "Google", "Tableau"],
    "Machine Learning": ["Google", "AWS", "Nvidia"],
    "Cloud": ["AWS", "Microsoft Azure", "Google Cloud"],
    "AI": ["Microsoft", "Google", "IBM"],
    "Database": ["Oracle", "MongoDB"],
    "Cybersecurity": ["CompTIA", "Cisco"],
    "DevOps": ["AWS", "Microsoft"],
    "Web Development": ["Google", "Microsoft"]
  };

  const certifications = skills.map(skill => {
    const providers = providerMap[skill] || ["Microsoft", "Google"];
    const mainProvider = providers[0];
    
    return {
      skill: skill,
      certifications: [
        {
          name: `${mainProvider} Certified: ${skill} Fundamentals`,
          provider: mainProvider,
          level: "Beginner",
          duration: "1-2 months",
          cost: "$99-$165",
          description: `Official ${mainProvider} certification for ${skill} fundamentals`,
          link: `https://${mainProvider.toLowerCase()}.com/certifications`,
          prerequisites: ["Basic knowledge recommended"],
          examRequired: true
        },
        {
          name: `Google Career Certificate: ${skill}`,
          provider: "Google",
          level: "Beginner",
          duration: "3-6 months",
          cost: "$49/month",
          description: `Comprehensive ${skill} certification from Google`,
          link: "https://grow.google/certificates/",
          prerequisites: [],
          examRequired: false
        }
      ],
      whyRecommended: `These certifications are industry-recognized and relevant for ${careerPath}`
    };
  });

  return {
    certifications,
    recommendedProvider: "Microsoft and Google offer the most comprehensive certifications",
    timeline: "Complete 1-2 certifications every 3 months"
  };
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
      1. Return projects as objects with "name" and "description" fields
      2. "focus" MUST be a string description
      3. "skills" array must contain strings
      4. Projects should have learning resources when relevant
      5. Keep descriptions concise and practical
      
      Respond ONLY with this JSON structure:
      {
        "roadmap": [{
          "month": number,
          "title": "string",
          "focus": "string description of what to focus on",
          "skills": ["string skill 1", "string skill 2"],
          "resources": [{"name": "string resource name", "type": "string", "link": "string"}],
          "projects": [
            {
              "name": "Project Title",
              "description": "Brief description of the project",
              "resources": [
                {"name": "Resource name", "type": "Tutorial/Website", "link": "https://"}
              ]
            }
          ],
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
          "projects": [
            {
              "name": "Personal Portfolio Website",
              "description": "Build a responsive portfolio website with HTML, CSS, and JavaScript",
              "resources": [
                {"name": "freeCodeCamp Responsive Web Design", "type": "Tutorial", "link": "https://freecodecamp.org"}
              ]
            }
          ],
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
    
    // Ensure projects have proper structure
    const sanitizedProjects = (month.projects || []).map(project => {
      // If project is already an object with name and description
      if (project && typeof project === 'object' && project.name) {
        return {
          name: project.name,
          description: project.description || `Project for Month ${month.month || index + 1}`,
          resources: project.resources || []
        };
      }
      
      // If project is a string
      if (typeof project === 'string') {
        return {
          name: project,
          description: `Complete this project to practice skills from Month ${month.month || index + 1}`,
          resources: []
        };
      }
      
      // If project is an object without proper structure
      if (project && typeof project === 'object') {
        return {
          name: project.title || project.name || `Project ${index}`,
          description: project.description || project.desc || `Project for Month ${month.month || index + 1}`,
          resources: project.resources || []
        };
      }
      
      // Default fallback
      return {
        name: `Project ${index + 1}`,
        description: `Complete this project to practice skills from Month ${month.month || index + 1}`,
        resources: []
      };
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