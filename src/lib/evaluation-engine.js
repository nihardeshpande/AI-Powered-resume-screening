const {
    LCA_EXPERIENCE_POLICIES,
    ACTIVE_LCA_EXPERIENCE_POLICY,
  } = require("./evaluation-config");
  
  function unique(items) {
    return [...new Set(items || [])];
  }
  
  function includesAny(items, keywords) {
    const normalized = (items || []).map((item) => item.toLowerCase());
  
    return keywords.some((keyword) =>
      normalized.includes(keyword.toLowerCase())
    );
  }
  
  function scoreEvidence(items, keywords, maxPoints) {
    const matched = unique(items).filter((item) =>
      keywords.some((keyword) =>
        item.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  
    const score =
      keywords.length === 0
        ? 0
        : Math.min(maxPoints, Math.round((matched.length / keywords.length) * maxPoints));
  
    return { score, matched };
  }
  
  function evaluateLCA(profile) {
    const keywords = profile.lca?.matchedKeywords || [];
    const tools = profile.tools || [];
  
    const domain = scoreEvidence(
      keywords,
      [
        "life cycle assessment",
        "life cycle inventory",
        "environmental impact",
        "carbon footprint",
        "sustainability assessment",
      ],
      40
    );
  
    const toolMatches = scoreEvidence(
      tools,
      ["GaBi", "SimaPro", "openLCA"],
      25
    );
  
    const standards = scoreEvidence(
      keywords,
      ["ISO 14040", "ISO 14044"],
      20
    );
  
    const projectEvidence = profile.lca?.evidence || [];
    const projectLines = projectEvidence.filter((item) =>
      /project|conducted|performed|completed|analysis|assessment/i.test(item.text)
    );
  
    const projectScore = Math.min(15, projectLines.length * 5);
  
    const experiencePolicy =
      LCA_EXPERIENCE_POLICIES[ACTIVE_LCA_EXPERIENCE_POLICY];
  
    const experienceReferences = profile.experienceReferences || [];
    const experienceYears = experienceReferences.map((item) => item.years);
  
    const qualifyingExperience = experienceYears.some(
      (years) => years >= experiencePolicy.min
    );
  
    const experienceBelowMinimum =
      experienceYears.length > 0 &&
      experienceYears.every((years) => years < experiencePolicy.min);
  
    // Experience is reported separately. It is not included in the
    // preliminary score because the extracted figures may be incomplete
    // or may describe total rather than directly relevant experience.
    const score = domain.score + toolMatches.score + standards.score + projectScore;
  
    const reasons = [];
  
    if (domain.matched.length) {
      reasons.push(`Relevant LCA concepts detected: ${domain.matched.join(", ")}`);
    }
  
    if (toolMatches.matched.length) {
      reasons.push(`LCA tools detected: ${toolMatches.matched.join(", ")}`);
    }
  
    if (standards.matched.length) {
      reasons.push(`Standards detected: ${standards.matched.join(", ")}`);
    }
  
    if (projectLines.length) {
      reasons.push(`${projectLines.length} potentially relevant evidence line(s) found`);
    }
  
    if (experienceYears.length === 0) {
      reasons.push("Experience duration not clearly detected; manual review needed");
    } else if (qualifyingExperience) {
      reasons.push(
        `At least ${experiencePolicy.min} years stated in an experience reference; relevance needs verification`
      );
    } else if (experienceBelowMinimum) {
      reasons.push(
        `Detected experience references are below the ${experiencePolicy.min}-year minimum; verify manually`
      );
    }
  
    if (!reasons.length) {
      reasons.push("No strong LCA-related evidence detected by the first-pass parser");
    }
  
    return {
      score,
      maxScore: 100,
      experience: {
        references: experienceReferences,
        policy: experiencePolicy.label,
        minimumYears: experiencePolicy.min,
        status:
          experienceYears.length === 0
            ? "not_detected"
            : qualifyingExperience
              ? "potentially_meets"
              : "below_minimum",
      },
      evidence: {
        concepts: domain.matched,
        tools: toolMatches.matched,
        standards: standards.matched,
        projectLines: projectLines.map((item) => item.text),
      },
      reasons,
    };
  }
  
  function evaluateUIUX(profile) {
    const keywords = profile.uiux?.matchedKeywords || [];
    const tools = profile.tools || [];
  
    const designMethods = scoreEvidence(
      keywords,
      [
        "user research",
        "wireframe",
        "prototyping",
        "usability",
        "interaction design",
        "visual design",
        "user testing",
      ],
      50
    );
  
    const designTools = scoreEvidence(
      tools,
      ["Figma", "Adobe XD", "Sketch"],
      25
    );
  
    const userExperienceConcepts = scoreEvidence(
      keywords,
      ["UI/UX", "user interface", "user experience", "design system"],
      25
    );
  
    const score =
      designMethods.score +
      designTools.score +
      userExperienceConcepts.score;
  
    const reasons = [];
  
    if (designMethods.matched.length) {
      reasons.push(`Design methods detected: ${designMethods.matched.join(", ")}`);
    }
  
    if (designTools.matched.length) {
      reasons.push(`Design tools detected: ${designTools.matched.join(", ")}`);
    }
  
    if (userExperienceConcepts.matched.length) {
      reasons.push(
        `UI/UX concepts detected: ${userExperienceConcepts.matched.join(", ")}`
      );
    }
  
    if (!reasons.length) {
      reasons.push("No strong UI/UX-related evidence detected by the first-pass parser");
    }
  
    return {
      score,
      maxScore: 100,
      evidence: {
        methods: designMethods.matched,
        tools: designTools.matched,
        concepts: userExperienceConcepts.matched,
      },
      reasons,
    };
  }
  
  function classifyCandidate(lca, uiux) {
    const threshold = 30;
    const lcaMatch = lca.score >= threshold;
    const uiuxMatch = uiux.score >= threshold;
  
    if (lcaMatch && uiuxMatch) return "Both";
    if (lcaMatch) return "LCA";
    if (uiuxMatch) return "UI/UX";
  
    return "Neither / Needs Review";
  }
  
  function evaluateCandidate(resume) {
    if (resume.status !== "success" || !resume.profile) {
      return {
        candidateId: resume.candidateId,
        status: "needs_review",
        classification: "Neither / Needs Review",
        lca: null,
        uiux: null,
        reviewFlags: ["Resume text could not be extracted or parsed"],
      };
    }
  
    const lca = evaluateLCA(resume.profile);
    const uiux = evaluateUIUX(resume.profile);
  
    return {
      candidateId: resume.candidateId,
      status: "evaluated",
      classification: classifyCandidate(lca, uiux),
      lca,
      uiux,
      reviewFlags: resume.profile.reviewFlags || [],
    };
  }
  
  function evaluateAllCandidates(dataset) {
    const evaluations = dataset.resumes.map(evaluateCandidate);
  
    return {
      generatedAt: new Date().toISOString(),
      experiencePolicy: {
        active: ACTIVE_LCA_EXPERIENCE_POLICY,
        ...LCA_EXPERIENCE_POLICIES[ACTIVE_LCA_EXPERIENCE_POLICY],
      },
      totalCandidates: evaluations.length,
      evaluations,
    };
  }
  
  module.exports = { evaluateAllCandidates };