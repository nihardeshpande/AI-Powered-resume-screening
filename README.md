from pathlib import Path

readme = """# AI-Powered Resume Screening System

A web application for reviewing resumes against two job profiles: **LCA Consultant** and **UI/UX Design Internship**. The application extracts text from uploaded DOCX resumes, evaluates role relevance, and presents scores, evidence, explanations, and review flags in a dashboard.

**Live demo:** https://ai-powered-resume-screening-bice.vercel.app/

## Features

- Upload DOCX resumes for screening.
- Extract resume text for evaluation.
- Evaluate candidates against the LCA Consultant and UI/UX Design Internship roles.
- Display role-specific scores and candidate classifications.
- Show supporting evidence, including relevant concepts, tools, methods, and standards.
- Provide explanations and flags for cases that need human review.
- Browse and filter candidate results in the dashboard.
- Deploy the application through Vercel.

## How it works

1. A user uploads a DOCX resume.
2. The application extracts the resume text.
3. The screening API sends the resume content for AI-assisted evaluation when the configured Gemini API is available.
4. The evaluation is mapped to the relevant job profile and scoring structure.
5. The dashboard displays the candidate's scores, classification, evidence, explanations, and review flags.

AI-assisted screening is a preliminary aid. It does not make hiring decisions and must not replace human review. Review the original resume and verify qualifications before making any decision.

## Technology

- Next.js
- React
- JavaScript
- Gemini API for AI-assisted evaluation
- Mammoth for DOCX text extraction
- Vercel for deployment

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/nihardeshpande/AI-Powered-resume-screening.git
cd AI-Powered-resume-screening
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root. Add your own API key locally:

```env
GEMINI_API_KEY=your_gemini_api_key
```

The application may also have an `OPENROUTER_API_KEY` configured for optional or earlier evaluation workflows. Never commit real API keys.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create a production build

```bash
npm run build
```

## Project structure

```text
.
├── scripts/                 # Resume extraction, evaluation, and export scripts
├── src/
│   ├── app/                 # Next.js pages and API routes
│   ├── components/          # Dashboard and candidate UI components
│   ├── context/             # Screening state/context
│   ├── data/                # Job profiles and public dashboard data
│   └── lib/                 # Evaluation and candidate utilities
├── .gitignore
└── package.json
```

## Privacy and responsible use

- Do not commit original resumes, extracted resume text, private evaluation files, or API credentials.
- Resume contents may be sent to the configured AI provider for evaluation. Only upload documents when you have an appropriate legal basis and authorization to process them.
- Candidate scores and classifications are model-assisted estimates and may contain errors or omissions.
- Human reviewers must verify the original resume, experience, tools, standards, and other qualifications.
- The system is intended to support review, not to make automated hiring decisions.

## Limitations

- Resume parsing and AI evaluation depend on the quality and completeness of the uploaded document.
- DOCX extraction may not preserve every layout element, table, or visual detail.
- A score is an indication of alignment with the configured role criteria, not a guarantee of candidate suitability.
- Results should be interpreted alongside the job description and a human review.

## Author

Developed as part of the Growth For Impact software engineering assignment.
"""

path = Path("/mnt/data/README.md")
path.write_text(readme, encoding="utf-8")
print(f"Created {path}")
