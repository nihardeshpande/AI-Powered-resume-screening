
"use client";

export function CandidateTable({ rows, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[850px] w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Candidate ID</th>
              <th className="px-4 py-3 font-semibold">LCA Score</th>
              <th className="px-4 py-3 font-semibold">UI/UX Score</th>
              <th className="px-4 py-3 font-semibold">Classification</th>
              <th className="px-4 py-3 font-semibold">Review Status</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No candidates match your search.
                </td>
              </tr>
            ) : (
              rows.map((candidate) => {
                const needsReview =
                  candidate.status === "needs_review" ||
                  candidate.status === "not_evaluated";

                return (
                  <tr
                    key={candidate.candidateId}
                    className="border-t border-slate-100"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-950">
                      {candidate.candidateId}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {candidate.scores?.lca ?? "—"}/100
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {candidate.scores?.uiux ?? "—"}/100
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {candidate.classification}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {needsReview ? (
                        <span className="text-xs font-medium text-amber-700">
                          Needs review
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-700">
                          AI Evaluated
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onView(candidate)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
