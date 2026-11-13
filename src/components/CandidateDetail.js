
"use client";

import { useEffect } from "react";

export function CandidateDetail({ candidate, onClose, onRemove }) {
  useEffect(() => {
    if (!candidate) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [candidate, onClose]);

  if (!candidate) return null;

  const lca = candidate.evidence?.lca;
  const uiux = candidate.evidence?.uiux;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-detail-title"
        className="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Candidate evaluation
            </p>
            <h2
              id="candidate-detail-title"
              className="mt-1 text-xl font-semibold text-slate-950"
            >
              {candidate.candidateId || candidate.localId}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Preliminary keyword-based evaluation. Detected terms are not
            proof of proficiency. A human reviewer should verify the
            original resume before making a hiring decision.
          </div>

          <section>
            <h3 className="font-semibold text-slate-900">Overall classification</h3>
            <p className="mt-2 text-sm text-slate-700">
              {candidate.classification}
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900">Role match scores</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">LCA Consultant</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {candidate.scores?.lca ?? "—"}/100
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">UI/UX Design</p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {candidate.scores?.uiux ?? "—"}/100
                </p>
              </div>
            </div>
          </section>

          {lca && (
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900">
                LCA evidence detected
              </h3>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Concepts
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {lca.concepts.join(", ") || "None detected"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Tools
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {lca.tools.join(", ") || "None detected"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Standards
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {lca.standards.join(", ") || "None detected"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Experience detection
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {lca.experienceStatus || "Not detected"}
                </p>
              </div>
            </section>
          )}

          {uiux && (
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-900">
                UI/UX evidence detected
              </h3>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Design methods
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {uiux.methods.join(", ") || "None detected"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Tools
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {uiux.tools.join(", ") || "None detected"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Concepts
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {uiux.concepts.join(", ") || "None detected"}
                </p>
              </div>
            </section>
          )}

          <section>
            <h3 className="font-semibold text-slate-900">
              Evaluation explanations
            </h3>

            {["lca", "uiux"].map((role) => (
              <div key={role} className="mt-3">
                <p className="text-sm font-medium text-slate-700">
                  {role === "lca" ? "LCA Consultant" : "UI/UX Design"}
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-600">
                  {(candidate.explanations?.[role] || []).map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-semibold text-slate-900">Review flags</h3>
            {candidate.reviewFlags?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
                {candidate.reviewFlags.map((flag, index) => (
                  <li key={index}>{flag}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No automated review flags.
              </p>
            )}
          </section>

          {onRemove && candidate.localId && (
            <button
              type="button"
              onClick={() => onRemove(candidate.localId)}
              className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Remove from queue
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
