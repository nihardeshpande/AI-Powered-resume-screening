
"use client";

import { useMemo, useState } from "react";
import evaluationData from "@/data/candidate-evaluations.json";
import { getRole } from "@/data/jobs";
import { ExperienceReview } from "@/components/ExperienceReview";
import { CandidateControls } from "@/components/CandidateControls";
import { CandidateTable } from "@/components/CandidateTable";
import { CandidateDetail } from "@/components/CandidateDetail";
import { JobRoleSection } from "@/components/JobRoleSection";

export function RoleView({ roleId }) {
  const role = getRole(roleId);

  const [query, setQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedId, setSelectedId] = useState(null);

  const rows = useMemo(() => {
    const scoreKey =
      roleId === "lca-consultant" ? "lca" : "uiux";

    const evidenceKey =
      roleId === "lca-consultant" ? "lca" : "uiux";

    const needle = query.trim().toLowerCase();

    return evaluationData.candidates
      .filter((candidate) => {
        return (
          candidate.status === "evaluated" &&
          (candidate.scores[scoreKey] ?? 0) > 0
        );
      })
      .map((candidate) => ({
        ...candidate,
        localId: candidate.candidateId,
        fileName: "Anonymized resume",
        roleId,
        matchScore: candidate.scores[scoreKey],
      }))
      .filter((candidate) => {
        if (!needle) return true;

        const evidence = candidate.evidence[evidenceKey];

        const searchable = [
          candidate.candidateId,
          candidate.classification,
          ...(evidence.concepts || []),
          ...(evidence.tools || []),
          ...(evidence.methods || []),
          ...(candidate.explanations[scoreKey] || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(needle);
      })
      .sort((a, b) =>
        sortDirection === "asc"
          ? a.matchScore - b.matchScore
          : b.matchScore - a.matchScore
      );
  }, [roleId, query, sortDirection]);

  const selected =
    rows.find((candidate) => candidate.candidateId === selectedId) ||
    null;

  if (!role) {
    return (
      <p className="text-sm text-slate-600">
        That role is not in the job list.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-blue-700">
          Growth For Impact
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          {role.title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          {role.summary} Candidates below are ordered by their
          preliminary role-specific evidence score. All evaluations
          require human verification.
        </p>
      </header>

      <ExperienceReview role={role} />

      <JobRoleSection role={role} showHeading={false}>
        <CandidateControls
          query={query}
          onQueryChange={setQuery}
          roleId={roleId}
          onRoleChange={() => {}}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
          lockRole={roleId}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            {rows.length} candidates with detected relevant evidence.
          </p>

          <p className="text-sm text-slate-500">
            Sorted by {roleId === "lca-consultant" ? "LCA" : "UI/UX"} score
          </p>
        </div>

        <CandidateTable
          rows={rows}
          onView={(candidate) =>
            setSelectedId(candidate.candidateId)
          }
        />
      </JobRoleSection>

      <CandidateDetail
        candidate={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
