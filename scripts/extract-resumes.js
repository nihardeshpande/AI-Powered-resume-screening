const { extractStructuredProfile } = require("./resume-parser");

const fs = require("node:fs/promises");
const path = require("node:path");
const mammoth = require("mammoth");

const INPUT_DIR = path.resolve("private-resumes");
const OUTPUT_DIR = path.resolve("private-data");
const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  "resume-extractions.json"
);

async function findDocxFiles(directory) {
  const entries = await fs.readdir(directory, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await findDocxFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.toLowerCase().endsWith(".docx")
    ) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function extractResume(filePath) {
  const fileName = path.basename(filePath);

  try {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    const text = result.value.trim();

    if (!text) {
      return {
        fileName,
        status: "failed",
        text: "",
        characterCount: 0,
        warnings: result.messages.map(
          (message) => message.message
        ),
        error: "No readable text found.",
      };
    }

    return {
      fileName,
      status: "success",
      text,
      characterCount: text.length,
      warnings: result.messages.map(
        (message) => message.message
      ),
      error: null,
    };
  } catch (error) {
    return {
      fileName,
      status: "failed",
      text: "",
      characterCount: 0,
      warnings: [],
      error: error.message,
    };
  }
}

async function main() {
  try {
    await fs.access(INPUT_DIR);

    const files = await findDocxFiles(INPUT_DIR);

    if (files.length === 0) {
      throw new Error("No DOCX resumes found.");
    }

    console.log(`Found ${files.length} resumes.`);
    console.log("Starting extraction...\n");

    const results = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const result = await extractResume(file);

      results.push({
        candidateId: `CAND-${String(index + 1).padStart(3, "0")}`,
        ...result,
        profile:
          result.status === "success"
            ? extractStructuredProfile(result.text)
            : null,
      });

      console.log(
        `[${index + 1}/${files.length}] ${result.fileName}: ${result.status}`
      );
    }

    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const successful = results.filter(
      (item) => item.status === "success"
    ).length;

    const failed = results.length - successful;

    const output = {
      generatedAt: new Date().toISOString(),
      totalResumes: results.length,
      successfulExtractions: successful,
      failedExtractions: failed,
      resumes: results,
    };

    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(output, null, 2),
      "utf8"
    );

    console.log("\nExtraction completed.");
    console.log(`Total: ${results.length}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    console.log(`Output: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Batch extraction failed:", error.message);
    process.exitCode = 1;
  }
}

main();
