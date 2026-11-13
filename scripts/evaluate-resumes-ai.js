
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");

const INPUT = path.resolve("private-data/resume-extractions.json");
const OUTPUT = path.resolve("private-data/candidate-evaluations-ai.json");
const ENV_FILE = path.resolve(".env.local");

const MODEL = "gemini-3.5-flash-lite";
const API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function getApiKey() {
  const raw = fsSync.readFileSync(ENV_FILE, "utf8");
  const line = raw.split(/\r?\n/).find((x) =>
    x.trim().startsWith("GEMINI_API_KEY=")
  );

  if (!line) throw new Error("GEMINI_API_KEY missing in .env.local");

  return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

function getRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.candidates)) return data.candidates;
  if (Array.isArray(data.resumes)) return data.resumes;
  if (Array.isArray(data.records)) return data.records;
  throw new Error("Resume records not found in extraction file.");
}

function parseJson(text) {
  return JSON.parse(
    text.trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
  );
}

function buildPrompt(candidate) {
  return `
You are an experienced recruitment screening assistant.
Evaluate this anonymized resume against BOTH job descriptions.

IMPORTANT:
- Use only evidence explicitly supported by the resume.
- Do not invent skills, experience, projects or qualifications.
- Do not treat keyword presence alone as proof of competence.
- Do not infer years of experience without supporting dates or duration.
- Do not evaluate protected personal characteristics.
- Be fair to early-career candidates.
- This is preliminary screening, not a hiring decision.
- Return ONLY valid JSON.

LCA CONSULTANT:

The required relevant experience is 4–6 years, as specified
in the assignment PDF.

Evaluate the candidate against this requirement.
Do not mention or use the separate 2–3-year job-description
figure.

Relevant evidence:

Relevant evidence:
- Practical Life Cycle Assessment projects.
- GaBi, SimaPro, openLCA or equivalent software.
- ISO 14040 and ISO 14044.
- Life Cycle Inventory, impact assessment and interpretation.
- EPDs, carbon footprinting and environmental benchmarking.
- Relevant environmental or sustainability education.

UI/UX DESIGN INTERN:
The job description specifies 0–1 years of experience.

Relevant evidence:
- Figma and interface design tools.
- UI/UX principles, visual design and user psychology.
- Wireframes, prototypes and high-fidelity designs.
- User research, usability testing and design iteration.
- Creative thinking, aesthetic judgement and portfolio work.

SCORING:
Give each role a score from 0 to 100.
Scores must reflect the relevance, quality and depth of evidence.
A score of 30 or above indicates potential relevance, not automatic qualification.

CLASSIFICATION:
Use exactly one: LCA, UIUX, Both, Neither, Uncertain.

Return exactly this JSON structure:
{
  "classification": "LCA | UIUX | Both | Neither | Uncertain",
  "lca": {
    "score": 0,
    "experienceStatus": "meets | below | exceeds | unclear | not_applicable",
    "summary": "Short explanation",
    "evidence": [],
    "missing": [],
    "reason": "Evidence-based reasoning"
  },
  "uiux": {
    "score": 0,
    "summary": "Short explanation",
    "evidence": [],
    "missing": [],
    "reason": "Evidence-based reasoning"
  },
  "reviewFlags": []
}

RESUME ID: ${candidate.candidateId}

RESUME TEXT:
${String(candidate.text || "").slice(0, 24000)}
`;
}

async function evaluateWithGemini(candidate, apiKey) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(candidate) }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        maxOutputTokens: 4000,
      },
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.error?.message || `Gemini HTTP ${response.status}`
    );
  }

  const choice = body.candidates?.[0];
  const text = choice?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned no usable text.");

  if (choice?.finishReason === "MAX_TOKENS") {
    throw new Error("Gemini response was truncated.");
  }

  const result = parseJson(text);

  if (
    !result.lca ||
    !result.uiux ||
    typeof result.lca.score !== "number" ||
    typeof result.uiux.score !== "number"
  ) {
    throw new Error("Gemini returned an incomplete evaluation.");
  }

  return result;
}

function score(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function convertEvaluation(candidate, result) {
  const lcaScore = score(result.lca.score);
  const uiuxScore = score(result.uiux.score);

  const validClassifications = [
    "LCA", "UIUX", "Both", "Neither", "Uncertain"
  ];

  return {
    candidateId: candidate.candidateId,
    status: "evaluated",
    evaluationMethod: "Gemini AI",
    evaluationModel: MODEL,
    classification: validClassifications.includes(result.classification)
      ? result.classification
      : "Uncertain",

    lca: {
      score: lcaScore,
      maxScore: 100,
      experience: {
        status: result.lca.experienceStatus || "unclear",
        aiSummary: result.lca.summary || "",
      },
      evidence: {
        concepts: asArray(result.lca.evidence),
        tools: [],
        standards: [],
        projectLines: [],
      },
      explanations: [
        result.lca.reason || result.lca.summary || "",
        ...asArray(result.lca.missing).map((x) => `Missing: ${x}`),
      ],
    },

    uiux: {
      score: uiuxScore,
      maxScore: 100,
      evidence: {
        concepts: asArray(result.uiux.evidence),
        tools: [],
        standards: [],
        projectLines: [],
      },
      explanations: [
        result.uiux.reason || result.uiux.summary || "",
        ...asArray(result.uiux.missing).map((x) => `Missing: ${x}`),
      ],
    },

    reviewFlags: [
      ...asArray(result.reviewFlags),
      "AI-generated preliminary assessment. Human review required.",
    ],
  };
}

async function save(savedData) {
  savedData.generatedAt = new Date().toISOString();
  savedData.totalCandidates = savedData.evaluations.length;

  await fs.writeFile(
    OUTPUT,
    JSON.stringify(savedData, null, 2),
    "utf8"
  );
}

async function main() {
  const apiKey = getApiKey();

  const inputData = JSON.parse(await fs.readFile(INPUT, "utf8"));
  const candidates = getRecords(inputData);

  const savedData = JSON.parse(await fs.readFile(OUTPUT, "utf8"));

  if (!Array.isArray(savedData.evaluations)) {
    throw new Error("Saved evaluations array missing. Stopping safely.");
  }

  const evaluations = savedData.evaluations;

  const byId = new Map(
    evaluations.map((item, index) => [item.candidateId, index])
  );

  const completedGemini = new Set(
    evaluations
      .filter((item) =>
        item.evaluationMethod === "Gemini AI" &&
        item.evaluationModel === MODEL &&
        item.status === "evaluated"
      )
      .map((item) => item.candidateId)
  );

  const remaining = candidates.filter(
    (candidate) => !completedGemini.has(candidate.candidateId)
  );

  console.log("\nGEMINI-ONLY RE-EVALUATION");
  console.log("------------------------");
  console.log("Total resumes:", candidates.length);
  console.log("Already evaluated by Gemini:", completedGemini.size);
  console.log("Remaining:", remaining.length);
  console.log("Model:", MODEL);
  console.log("");

  for (const candidate of remaining) {
    console.log(`Evaluating ${candidate.candidateId}...`);

    if (!candidate.text || candidate.status === "error") {
      console.log("No extracted text. Keeping for manual review.");

      const manualRecord = {
        candidateId: candidate.candidateId,
        status: "needs_review",
        evaluationMethod: "Not evaluated",
        evaluationModel: null,
        classification: "Uncertain",
        lca: { score: 0, maxScore: 100 },
        uiux: { score: 0, maxScore: 100 },
        reviewFlags: [
          "Resume text could not be extracted. Manual review required.",
        ],
      };

      const existingIndex = byId.get(candidate.candidateId);

      if (existingIndex === undefined) {
        byId.set(candidate.candidateId, evaluations.length);
        evaluations.push(manualRecord);
      } else {
        evaluations[existingIndex] = manualRecord;
      }

      await save(savedData);
      continue;
    }

    try {
      const result = await evaluateWithGemini(candidate, apiKey);
      const evaluation = convertEvaluation(candidate, result);

      const existingIndex = byId.get(candidate.candidateId);

      if (existingIndex === undefined) {
        byId.set(candidate.candidateId, evaluations.length);
        evaluations.push(evaluation);
      } else {
        evaluations[existingIndex] = evaluation;
      }

      await save(savedData);

      console.log(
        `Saved ${candidate.candidateId} | ` +
        `LCA ${evaluation.lca.score}/100 | ` +
        `UIUX ${evaluation.uiux.score}/100`
      );
    } catch (error) {
      console.error(`Failed ${candidate.candidateId}: ${error.message}`);
      console.log("Stopping safely. Rerun this script later to resume.");
      await save(savedData);
      break;
    }
  }

  const finalGeminiCount = evaluations.filter(
    (item) =>
      item.status === "evaluated" &&
      item.evaluationMethod === "Gemini AI" &&
      item.evaluationModel === MODEL
  ).length;

  const manualCount = evaluations.filter(
    (item) => item.status === "needs_review"
  ).length;

  console.log("\nFINAL STATUS");
  console.log("------------");
  console.log("Total records:", evaluations.length);
  console.log("Gemini evaluations:", finalGeminiCount);
  console.log("Manual review:", manualCount);
  console.log("Output:", OUTPUT);
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exitCode = 1;
});
