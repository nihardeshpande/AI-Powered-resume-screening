
import mammoth from "mammoth";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return Response.json(
        { error: "Please upload a DOCX resume." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return Response.json(
        { error: "Only DOCX files are supported." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: "File must be between 1 byte and 10 MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });
    const extractedText = result.value.trim();

    if (!extractedText) {
      return Response.json(
        {
          error: "No readable text found in this document.",
          warnings: result.messages.map((item) => item.message),
        },
        { status: 422 }
      );
    }

    return Response.json({
      success: true,
      fileName: file.name,
      textLength: extractedText.length,
      extractedText,
      warnings: result.messages.map((item) => item.message),
    });
  } catch (error) {
    console.error("Resume extraction failed:", error);

    return Response.json(
      {
        error: "Could not read this document. Please check the DOCX file.",
      },
      { status: 500 }
    );
  }
}
