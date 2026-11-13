const TOOL_KEYWORDS = [
    "Figma",
    "Adobe XD",
    "Sketch",
    "Photoshop",
    "Illustrator",
    "Miro",
    "SimaPro",
    "GaBi",
    "openLCA",
    "Power BI",
    "Excel",
    "Python",
    "AutoCAD",
  ];
  
  const LCA_KEYWORDS = [
    "life cycle assessment",
    "life cycle analysis",
    "LCA",
    "life cycle inventory",
    "LCI",
    "ISO 14040",
    "ISO 14044",
    "carbon footprint",
    "environmental impact",
    "impact assessment",
    "sustainability assessment",
    "environmental benchmarking",
  ];
  
  const UIUX_KEYWORDS = [
    "UI/UX",
    "user interface",
    "user experience",
    "user research",
    "user testing",
    "wireframe",
    "wireframing",
    "prototyping",
    "prototype",
    "usability",
    "interaction design",
    "visual design",
    "design system",
    "Figma",
    "Adobe XD",
  ];
  
  const DEGREE_KEYWORDS = [
    "B.Tech",
    "B.E.",
    "Bachelor of Technology",
    "Bachelor of Engineering",
    "M.Tech",
    "M.E.",
    "Master of Technology",
    "Master of Engineering",
    "B.Des",
    "M.Des",
    "Bachelor of Design",
    "Master of Design",
    "BFA",
    "MFA",
    "MBA",
    "PhD",
    "Ph.D.",
  ];
  
  function findMatches(text, keywords) {
    const lowerText = text.toLowerCase();
  
    return keywords.filter((keyword) =>
      lowerText.includes(keyword.toLowerCase())
    );
  }
  
  function findEvidence(text, keywords, maxPerCategory = 8) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  
    const matches = [];
  
    for (const line of lines) {
      const matchedKeywords = keywords.filter((keyword) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );
  
      if (matchedKeywords.length > 0) {
        matches.push({
          text: line.slice(0, 350),
          matchedKeywords,
        });
      }
  
      if (matches.length >= maxPerCategory) break;
    }
  
    return matches;
  }
  
  function extractExperienceReferences(text) {
    const patterns = [
      /\b(\d+(?:\.\d+)?)\s*\+?\s*years?\s+(?:of\s+)?(?:work\s+)?experience\b/gi,
      /\b(\d+(?:\.\d+)?)\s*\+?\s*years?\s+in\s+(?:the\s+)?industry\b/gi,
      /\bexperience\s*:\s*(\d+(?:\.\d+)?)\s*\+?\s*years?\b/gi,
    ];
  
    const references = [];
  
    for (const pattern of patterns) {
      let match;
  
      while ((match = pattern.exec(text)) !== null) {
        references.push({
          matchedText: match[0],
          years: Number(match[1]),
        });
      }
    }
  
    return references;
  }
  
  function extractStructuredProfile(text) {
    const tools = findMatches(text, TOOL_KEYWORDS);
    const lcaSkills = findMatches(text, LCA_KEYWORDS);
    const uiuxSkills = findMatches(text, UIUX_KEYWORDS);
    const degrees = findMatches(text, DEGREE_KEYWORDS);
  
    const experienceReferences = extractExperienceReferences(text);
  
    return {
      extractionMethod: "keyword-and-pattern-based-v1",
  
      tools,
      degrees,
  
      experienceReferences,
  
      lca: {
        matchedKeywords: lcaSkills,
        evidence: findEvidence(text, LCA_KEYWORDS),
      },
  
      uiux: {
        matchedKeywords: uiuxSkills,
        evidence: findEvidence(text, UIUX_KEYWORDS),
      },
      
      // Missing keywords or an undetected experience phrase are not
      // extraction errors. These are shown separately as evidence gaps.
      reviewFlags: [],
    };
  }
  
  module.exports = { extractStructuredProfile };