
"use client";

import { useMemo, useState } from "react";
import evaluationData from "@/data/candidate-evaluations.json";
import { roles, roleTitle } from "@/data/jobs";
import { CandidateControls } from "@/components/CandidateControls";
import { CandidateTable } from "@/components/CandidateTable";
import { CandidateDetail } from "@/components/CandidateDetail";

export function AllCandidatesView() {
  const [query, setQuery] = useState("");
  const [roleId, setRoleId] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedId, setSelectedId] = useState(null);

  const candidates = useMemo(() => {
    return evaluationData.candidates.map((candidate) => ({
      ...candidate,
      localId: candidate.candidateId,
      fileName: "Anonymized resume",
      roleId:
        candidate.classification === "LCA"
          ? "lca-consultant"
          : candidate.classification === "UI/UX"
            ? "ui-ux-design-intern"
            : "",
      matchScore: Math.max(
        candidate.scores.lca ?? 0,
        candidate.scores.uiux ?? 0
      ),
    }));
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    let filtered = candidates.filter((candidate) => {
      if (roleId === "lca-consultant") {
        if (candidate.scores.lca === null) return false;
      } else if (roleId === "ui-ux-design-intern") {
        if (candidate.scores.uiux === null) return false;
      }

      if (!needle) return true;

      const searchable = [
        candidate.candidateId,
        candidate.classification,
        ...candidate.evidence.lca.concepts,
        ...candidate.evidence.lca.tools,
        ...candidate.evidence.uiux.methods,
        ...candidate.evidence.uiux.tools,
        ...candidate.reviewFlags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(needle);
    });

    filtered = [...filtered].sort((a, b) => {
      const scoreA =
        roleId === "lca-consultant"
          ? a.scores.lca ?? 0
          : roleId === "ui-ux-design-intern"
            ? a.scores.uiux ?? 0
            : Math.max(a.scores.lca ?? 0, a.scores.uiux ?? 0);

      const scoreB =
        roleId === "lca-consultant"
          ? b.scores.lca ?? 0
          : roleId === "ui-ux-design-intern"
            ? b.scores.uiux ?? 0
            : Math.max(b.scores.lca ?? 0, b.scores.uiux ?? 0);

      return sortDirection === "asc"
        ? scoreA - scoreB
        : scoreB - scoreA;
    });

    return filtered;
  }, [candidates, query, roleId, sortDirection]);

  const selected =
    candidates.find((candidate) => candidate.candidateId === selectedId) ||
    null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-blue-700">
          Growth For Impact
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          All Candidates
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
          Evaluated anonymized resumes, with separate preliminary LCA and
          UI/UX match scores. Scores are evidence-based screening indicators
          and require human review.
        </p>
      </header>

      <CandidateControls
        query={query}
        onQueryChange={setQuery}
        roleId={roleId}
        onRoleChange={setRoleId}
        sortDirection={sortDirection}
        onSortChange={setSortDirection}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
        <p>
          Showing {rows.length} of {candidates.length} evaluated candidates.
        </p>
        <p>
          Sort score:{" "}
          {roleId === "lca-consultant"
            ? "LCA"
            : roleId === "ui-ux-design-intern"
              ? "UI/UX"
              : "Highest of both roles"}
        </p>
      </div>

      <CandidateTable
        rows={rows}
        showRoleHint={false}
        onView={(candidate) => setSelectedId(candidate.candidateId)}
      />

      <CandidateDetail
        candidate={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
