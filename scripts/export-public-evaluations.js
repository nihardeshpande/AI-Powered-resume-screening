
const fs = require("node:fs/promises");
const path = require("node:path");

const INPUT = path.resolve(
  "private-data/candidate-evaluations-ai.json"
);

const OUTPUT = path.resolve(
  "src/data/candidate-evaluations.json"
);

function normalizeClassification(value) {
  const classification = String(value || "Uncertain").trim();

  if (/^ui\s*\/\s*ux$/i.test(classification) || /^uiux$/i.test(classification)) {
    return "UIUX";
  }

  if (/^lca$/i.test(classification)) return "LCA";
  if (/^both$/i.test(classification)) return "Both";

  if (/^neither/i.test(classification)) return "Neither";

  return "Uncertain";
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function getEvaluationMethod(item) {
  if (item.evaluationMethod) return item.evaluationMethod;

  if (item.evaluationModel) {
    return item.evaluationModel.toLowerCase().includes("gemini")
      ? "Gemini AI"
      : "OpenRouter AI";
  }

  return "Legacy evaluation — model not recorded";
}

function getExplanations(role) {
  return asArray(role?.explanations || role?.reasons);
}

async function main() {
  const raw = await fs.readFile(INPUT, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.evaluations)) {
    throw new Error("Input file does not contain an evaluations array.");
  }

  const candidates = data.evaluations.map((item) => {
    const isManualReview = item.status === "needs_review";
    const lcaScore = item.lca?.score ?? null;
    const uiuxScore = item.uiux?.score ?? null;

    const reviewFlags = asArray(item.reviewFlags);

    if (
      String(item.classification || "").toLowerCase().includes("needs review") &&
      !reviewFlags.some((flag) =>
        String(flag).toLowerCase().includes("classification")
      )
    ) {
      reviewFlags.push(
        "Original classification included a needs-review label. Verify manually."
      );
    }

    return {
      candidateId: item.candidateId,
      status: item.status || "needs_review",
      classification: normalizeClassification(item.classification),

      evaluationMethod:
      item.status === "evaluated" ? "AI Evaluated" : "Not Evaluated",

      scores: {
        lca: lcaScore,
        uiux: uiuxScore,
      },

      evidence: {
        lca: {
          concepts: asArray(item.lca?.evidence?.concepts),
          tools: asArray(item.lca?.evidence?.tools),
          standards: asArray(item.lca?.evidence?.standards),
          experienceStatus:
            item.lca?.experience?.status || "not_detected",
        },

        uiux: {
          methods: asArray(item.uiux?.evidence?.methods),
          tools: asArray(item.uiux?.evidence?.tools),
          concepts: asArray(item.uiux?.evidence?.concepts),
        },
      },

      explanations: {
        lca: getExplanations(item.lca),
        uiux: getExplanations(item.uiux),
      },

      reviewFlags: [
        ...reviewFlags,
        ...(isManualReview
          ? ["Manual review required: resume text was unavailable."]
          : []),
      ],
    };
  });

  const counts = {
    total: candidates.length,
    evaluated: candidates.filter((item) => item.status === "evaluated").length,
    needsReview: candidates.filter(
      (item) => item.status === "needs_review"
    ).length,
  };

  const outputData = {
    generatedAt: new Date().toISOString(),
    totalCandidates: candidates.length,
    experiencePolicy: data.experiencePolicy || null,
    evaluationSummary: counts,
    candidates,
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });

  await fs.writeFile(
    OUTPUT,
    JSON.stringify(outputData, null, 2),
    "utf8"
  );

  console.log("\nDashboard data exported successfully!");
  console.log("Total candidates:", counts.total);
  console.log("Evaluated:", counts.evaluated);
  console.log("Needs manual review:", counts.needsReview);
  console.log("Output:", OUTPUT);
}

main().catch((error) => {
  console.error("Export failed:", error.message);
  process.exitCode = 1;
});
