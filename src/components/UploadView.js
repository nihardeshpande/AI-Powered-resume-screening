
"use client";

import { useState } from "react";
import { roles } from "@/data/jobs";

export function UploadView() {
  const [roleId, setRoleId] = useState("");
  const [results, setResults] = useState([]);
  const [notice, setNotice] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function screenFiles(fileList) {
    const files = Array.from(fileList || []);

    if (!files.length) return;

    setProcessing(true);
    setNotice("");

    let successCount = 0;
    let failureCount = 0;

    for (const file of files) {
      const id = `${Date.now()}-${Math.random()}`;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/screen", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Screening failed.");
        }

        setResults((current) => [
          {
            id,
            fileName: data.fileName,
            evaluation: data.evaluation,
            note: data.note,
            error: null,
          },
          ...current,
        ]);

        successCount += 1;
      } catch (error) {
        setResults((current) => [
          {
            id,
            fileName: file.name,
            evaluation: null,
            error: error.message,
          },
          ...current,
        ]);

        failureCount += 1;
      }
    }

    setProcessing(false);

    setNotice(
      `${successCount} resume(s) screened successfully. ${failureCount} failed.`
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">
          Growth For Impact
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Upload Resumes
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Upload DOCX resumes to extract job-related information and
          generate preliminary LCA and UI/UX match assessments.
          Original resume text is processed on the server and is not
          returned to the browser.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="assign-role"
          className="block text-sm font-medium text-slate-700"
        >
          Role of interest
        </label>

        <select
          id="assign-role"
          value={roleId}
          onChange={(event) => setRoleId(event.target.value)}
          className="mt-1.5 h-10 w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="">Evaluate for both roles</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.title}
            </option>
          ))}
        </select>

        <p className="mt-2 text-sm text-slate-500">
          Both role scores are generated. This selection identifies
          the role you want to focus on.
        </p>

        <label
          className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center ${
            dragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-slate-50"
          } ${processing ? "pointer-events-none opacity-60" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            screenFiles(event.dataTransfer.files);
          }}
        >
          <span className="text-base font-semibold text-slate-900">
            {processing
              ? "Screening resumes..."
              : "Drop DOCX resumes here, or browse"}
          </span>

          <span className="mt-1 text-sm text-slate-500">
            DOCX format only · Maximum file size 10 MB
          </span>

          <input
            type="file"
            accept=".docx"
            multiple
            disabled={processing}
            className="sr-only"
            onChange={(event) => {
              screenFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {notice && (
          <p className="mt-4 text-sm text-slate-700">{notice}</p>
        )}

        {processing && (
          <p className="mt-3 text-sm font-medium text-blue-700">
            Please wait while the resumes are processed.
          </p>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Screening results
            </h2>
            <p className="text-sm text-slate-500">
              {results.length} resume(s) processed in this session.
            </p>
          </div>

          <button
            type="button"
            disabled={results.length === 0 || processing}
            onClick={() => {
              setResults([]);
              setNotice("Screening results cleared.");
            }}
            className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Clear results
          </button>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No new resumes screened yet.
          </div>
        ) : (
          results.map((item) => (
            <article
              key={item.id}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-semibold text-slate-950">
                  {item.fileName}
                </h3>
                {item.error && (
                  <p className="mt-2 text-sm text-red-700">
                    {item.error}
                  </p>
                )}
              </div>

              {item.evaluation && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        LCA Consultant
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {item.evaluation.scores.lca}/100
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">
                        UI/UX Design
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-950">
                        {item.evaluation.scores.uiux}/100
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700">
                    Classification:{" "}
                    <strong>{item.evaluation.classification}</strong>
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        LCA evidence
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        Concepts:{" "}
                        {item.evaluation.evidence.lca.concepts.join(", ") ||
                          "None detected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Tools:{" "}
                        {item.evaluation.evidence.lca.tools.join(", ") ||
                          "None detected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Standards:{" "}
                        {item.evaluation.evidence.lca.standards.join(", ") ||
                          "None detected"}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-900">
                        UI/UX evidence
                      </h4>
                      <p className="mt-2 text-sm text-slate-600">
                        Methods:{" "}
                        {item.evaluation.evidence.uiux.methods.join(", ") ||
                          "None detected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Tools:{" "}
                        {item.evaluation.evidence.uiux.tools.join(", ") ||
                          "None detected"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Concepts:{" "}
                        {item.evaluation.evidence.uiux.concepts.join(", ") ||
                          "None detected"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900">
                      Evaluation explanations
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {[
                        ...item.evaluation.explanations.lca,
                        ...item.evaluation.explanations.uiux,
                      ].map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    {item.note} This assessment is not a hiring
                    decision. Verify the original resume and
                    qualifications manually.
                  </p>
                </>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
