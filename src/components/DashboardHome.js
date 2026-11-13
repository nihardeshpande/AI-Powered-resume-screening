
"use client";

import { useMemo, useState } from "react";
import evaluationData from "@/data/candidate-evaluations.json";
import { company, roles, roleTitle } from "@/data/jobs";
import { CandidateControls } from "@/components/CandidateControls";
import { CandidateTable } from "@/components/CandidateTable";
import { CandidateDetail } from "@/components/CandidateDetail";
import { JobRoleSection } from "@/components/JobRoleSection";

export function DashboardHome() {
  const [query, setQuery] = useState("");
  const [roleId, setRoleId] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selected, setSelected] = useState(null);

  const candidates = evaluationData.candidates || [];

  const evaluatedCount = candidates.filter(
    (candidate) => candidate.status === "evaluated"
  ).length;

  const reviewCount = candidates.filter(
    (candidate) => candidate.status !== "evaluated"
  ).length;

  const visibleRoles = roles.filter(
    (role) => roleId === "all" || role.id === roleId
  );

  const rowsFor = useMemo(() => {
    return (role) => {
      const scoreKey =
        role.id === "lca-consultant" ? "lca" : "uiux";

      const needle = query.trim().toLowerCase();

      const filtered = candidates
      .map((candidate, index) => ({
        ...candidate,
        localId: candidate.candidateId,
        roleId: role.id,
        matchScore: candidate.scores?.[scoreKey] ?? null,
        addedOrder: index,
      }))
      .filter((candidate) => {
        const classification = candidate.classification;
    
        if (role.id === "lca-consultant") {
          return classification === "LCA" || classification === "Both";
        }
    
        if (role.id === "ui-ux-design-intern") {
          return classification === "UIUX" || classification === "Both";
        }
    
        return false;
      })
      .filter((candidate) => {
          if (!needle) return true;

          return [
            candidate.candidateId,
            candidate.classification,
            ...(candidate.explanations?.lca || []),
            ...(candidate.explanations?.uiux || []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(needle);
        });

      return filtered.sort((a, b) => {
        const aScore = a.matchScore;
        const bScore = b.matchScore;

        if (aScore === null && bScore === null) {
          return a.addedOrder - b.addedOrder;
        }
        if (aScore === null) return 1;
        if (bScore === null) return -1;

        return sortDirection === "asc"
          ? aScore - bScore
          : bScore - aScore;
      });
    };
  }, [candidates, query, sortDirection]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {company.product}
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          {company.name}
        </p>
        <p className="mt-3 text-sm text-slate-500">
          AI-assisted preliminary resume screening across both roles.
          All scores require human review.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Resumes",
            value: candidates.length,
          },
          {
            label: "AI Evaluated",
            value: evaluatedCount,
          },
          {
            label: "LCA Candidates",
            value: candidates.filter(
              (c) => (c.scores?.lca ?? 0) >= 30
            ).length,
          },
          {
            label: "Needs Review",
            value: reviewCount,
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-sm font-medium text-slate-500">
              {card.label}
            </h2>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <div className="space-y-3">
        <CandidateControls
          query={query}
          onQueryChange={setQuery}
          roleId={roleId}
          onRoleChange={setRoleId}
          sortDirection={sortDirection}
          onSortChange={setSortDirection}
        />
        <p className="text-sm text-slate-500">
          Candidates are ordered by their role-specific AI match score.
        </p>
      </div>

      {visibleRoles.map((role) => (
        <JobRoleSection key={role.id} role={role}>
          <CandidateTable
            rows={rowsFor(role)}
            onView={setSelected}
          />
        </JobRoleSection>
      ))}

      <CandidateDetail
        candidate={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
