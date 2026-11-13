const fs = require("node:fs/promises");
const path = require("node:path");

const { evaluateAllCandidates } = require("../src/lib/evaluation-engine");

async function main() {
  const inputPath = path.resolve("private-data/resume-extractions.json");
  const outputPath = path.resolve("private-data/candidate-evaluations.json");

  try {
    const rawData = await fs.readFile(inputPath, "utf8");
    const dataset = JSON.parse(rawData);

    const result = evaluateAllCandidates(dataset);

    await fs.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      "utf8"
    );

    const counts = result.evaluations.reduce((acc, candidate) => {
      acc[candidate.classification] =
        (acc[candidate.classification] || 0) + 1;
      return acc;
    }, {});

    console.log("\nEvaluation complete!");
    console.log("Total candidates:", result.totalCandidates);
    console.log("Classification totals:", counts);
    console.log("LCA experience policy:", result.experiencePolicy.label);
    console.log("Output:", outputPath);
  } catch (error) {
    console.error("Evaluation failed:", error.message);
    process.exitCode = 1;
  }
}

main();