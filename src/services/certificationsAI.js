// services/certificationAI.js
export async function getCertifications(careerPath, missingSkills, quizResults) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  if (!API_KEY) {
    throw new Error("Gemini API key missing");
  }

  // Analyze quiz results for personalization
  const userProfile = analyzeQuizResults(quizResults);

  const prompt = `
# ROLE: Senior Career Certification Advisor

## USER'S PERSONAL PROFILE (From Quiz):
${userProfile.summary}

## TARGET CAREER PATH:
${careerPath}

## IDENTIFIED SKILL GAPS TO ADDRESS:
${missingSkills.map((skill) => `• ${skill}`).join("\n")}

## YOUR MISSION:
Recommend 3-5 certifications that are PERFECTLY TAILORED to this user. Consider:
1. Their specific career goal: ${careerPath}
2. Their skill gaps listed above
3. Their learning preferences from the quiz
4. Their experience level and time availability
5. Cost considerations based on their situation

## FOR EACH CERTIFICATION, RETURN THIS EXACT JSON STRUCTURE:
{
  "id": "unique-id",
  "name": "Certification Name",
  "provider": "Issuing Organization",
  "skillsCovered": ["skill1", "skill2", "skill3"],
  "difficulty": "Beginner | Intermediate | Advanced",
  "priority": "High | Medium | Low",
  "cost": "Free | Under $100 | $100-$500 | $500+ | Company-sponsored",
  "reason": "Detailed explanation of WHY this certification is perfect for THIS specific user based on their quiz results",
  "url": "https://official-certification-website.com",
  "format": "Online Self-paced | Instructor-led | Hybrid | Bootcamp",
  "duration": "e.g., 2-4 weeks | 1-3 months | 6+ months",
  "examRequired": true/false,
  "industryRecognition": "High | Medium | Low",
  "prerequisites": ["prerequisite1", "prerequisite2"]
}

## CRITICAL GUIDELINES:
1. "reason" field MUST reference specific aspects from the user's quiz results
2. Prioritize certifications with good industry recognition
3. Include a mix of foundational and specialized certifications
4. Consider Google certifications when relevant to ${careerPath}
5. If user has limited budget, include free or low-cost options
6. If user prefers hands-on learning, include certifications with labs/projects
7. Tailor difficulty based on user's experience level

## PERSONALIZATION RULES BASED ON QUIZ RESULTS:
${userProfile.rules}

Return ONLY a valid JSON array. No markdown, no explanations outside the JSON.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  const data = await response.json();

  // Extract Gemini text safely
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    console.error("Gemini API error:", data);
    throw new Error("No response from Gemini");
  }

  // Clean possible extra text
  const jsonStart = rawText.indexOf("[");
  const jsonEnd = rawText.lastIndexOf("]") + 1;

  if (jsonStart === -1 || jsonEnd === -1) {
    console.error("Raw AI response (not JSON):", rawText);
    throw new Error("Invalid JSON from Gemini");
  }

  const jsonString = rawText.slice(jsonStart, jsonEnd);

  try {
    const certifications = JSON.parse(jsonString);
    
    // Add unique IDs if not present
    return certifications.map((cert, index) => ({
      id: cert.id || `cert-${Date.now()}-${index}`,
      ...cert
    }));
  } catch (err) {
    console.error("JSON parse error:", err);
    console.error("Problematic JSON string:", jsonString);
    throw new Error("Failed to parse certifications JSON");
  }
}

// Helper function to analyze quiz results for personalization
function analyzeQuizResults(quizResults) {
  if (!quizResults || Object.keys(quizResults).length === 0) {
    return {
      summary: "No detailed quiz results available. Providing general recommendations based on skill gaps.",
      rules: "Focus on widely recognized certifications that address the skill gaps."
    };
  }

  // Extract insights from quiz results
  const insights = {
    experienceLevel: "beginner",
    learningStyle: "balanced",
    timeAvailability: "moderate",
    budget: "moderate",
    careerGoal: "skill_development",
    rules: "",
    summary: ""
  };

  // Analyze experience level
  if (quizResults.experience === "intermediate" || quizResults.yearsOfExperience > 2) {
    insights.experienceLevel = "intermediate";
    insights.summary += "User has intermediate experience level. ";
  } else if (quizResults.experience === "advanced" || quizResults.yearsOfExperience > 5) {
    insights.experienceLevel = "advanced";
    insights.summary += "User has advanced experience level. ";
  } else {
    insights.summary += "User is at beginner level. ";
  }

  // Analyze learning style
  if (quizResults.learningStyle === "hands-on" || quizResults.preferredLearning?.includes("practical")) {
    insights.learningStyle = "hands-on";
    insights.summary += "Prefers hands-on, practical learning. ";
    insights.rules += "- Prioritize certifications with labs, projects, or practical assessments\n";
  } else if (quizResults.learningStyle === "visual" || quizResults.preferredLearning?.includes("visual")) {
    insights.learningStyle = "visual";
    insights.summary += "Prefers visual learning materials. ";
    insights.rules += "- Prioritize certifications with video content and visual aids\n";
  } else if (quizResults.learningStyle === "self-paced") {
    insights.summary += "Prefers self-paced learning. ";
    insights.rules += "- Prioritize certifications with on-demand, flexible scheduling\n";
  }

  // Analyze time availability
  if (quizResults.timeAvailable === "limited" || quizResults.studyHoursPerWeek < 5) {
    insights.timeAvailability = "low";
    insights.summary += "Has limited time available. ";
    insights.rules += "- Recommend shorter duration certifications (under 3 months)\n";
  } else if (quizResults.timeAvailable === "full-time" || quizResults.studyHoursPerWeek > 20) {
    insights.timeAvailability = "high";
    insights.summary += "Can dedicate significant time. ";
    insights.rules += "- Can handle intensive or longer duration certifications\n";
  }

  // Analyze budget
  if (quizResults.budget === "low" || quizResults.student === true) {
    insights.budget = "low";
    insights.summary += "Budget-conscious learner. ";
    insights.rules += "- Include free or low-cost certification options\n";
  } else if (quizResults.budget === "high" || quizResults.companySponsored === true) {
    insights.budget = "high";
    insights.summary += "Has budget flexibility. ";
    insights.rules += "- Can include premium certifications\n";
  }

  // Analyze career goal
  if (quizResults.careerGoal === "career_change") {
    insights.careerGoal = "career_change";
    insights.summary += "Looking for career change. ";
    insights.rules += "- Prioritize foundational certifications with high industry recognition\n";
    insights.rules += "- Include entry-level certifications that are hiring requirements\n";
  } else if (quizResults.careerGoal === "promotion") {
    insights.careerGoal = "promotion";
    insights.summary += "Aiming for promotion. ";
    insights.rules += "- Prioritize certifications that demonstrate advanced skills\n";
    insights.rules += "- Focus on certifications valued in current industry\n";
  } else if (quizResults.careerGoal === "skill_development") {
    insights.summary += "Focusing on skill development. ";
    insights.rules += "- Balance between breadth and depth of skills\n";
  }

  // Add any specific preferences
  if (quizResults.preferGoogleCerts === true) {
    insights.rules += "- Prioritize Google certifications when relevant\n";
  }
  
  if (quizResults.needCertQuickly === true) {
    insights.rules += "- Include certifications that can be completed quickly\n";
  }

  return insights;
}