// The supplied LCA job description says 2–3 years.
// The assignment PDF says 4–6 years.
// Keep this setting visible and configurable.
const LCA_EXPERIENCE_POLICIES = {
    jobDescription: { min: 2, max: 3, label: "Supplied job description (2–3 years)" },
    assignment: { min: 4, max: 6, label: "Assignment PDF (4–6 years)" },
  };
  
  // Start with the supplied job description as the active policy.
  // Change to "assignment" if the hiring team confirms that requirement.
  const ACTIVE_LCA_EXPERIENCE_POLICY = "jobDescription";
  
  module.exports = {
    LCA_EXPERIENCE_POLICIES,
    ACTIVE_LCA_EXPERIENCE_POLICY,
  };