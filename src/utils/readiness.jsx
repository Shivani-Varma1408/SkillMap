export const calculateReadiness = (progress, roadmap) => {
  const skillsLearned = progress.completedSkills / progress.totalSkills;
  const projectsBuilt = progress.completedProjects / progress.totalProjects;
  const timeInvested = progress.daysActive / 180; // assuming 6-month plan

  const readiness = (skillsLearned * 0.5 + projectsBuilt * 0.3 + timeInvested * 0.2) * 100;

  let status = "";
  if (readiness >= 70) status = "Ready";
  else if (readiness >= 40) status = "Almost Ready";
  else status = "Keep Learning";

  // Generate tips for improvement
  const improvements = [];
  if (skillsLearned < 1) improvements.push("Complete remaining skills in your roadmap");
  if (projectsBuilt < 1) improvements.push("Finish pending projects");
  if (timeInvested < 1) improvements.push("Invest more consistent time");

  return {
    score: Math.round(readiness),
    status,
    improvements,
  };
};
