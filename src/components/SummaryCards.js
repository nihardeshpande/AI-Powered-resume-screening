import { roles } from "@/data/jobs";
import { countByRole } from "@/lib/candidates";

export function SummaryCards({ queue, choices }) {
  const lcaCount = countByRole(queue, "lca-consultant");
  const designCount = countByRole(queue, "ui-ux-design-intern");
  const unassignedCount = queue.filter((item) => !item.roleId).length;
  const openQuestions = roles.filter((role) => role.experience.conflict && !choices[role.id]).length;

  const cards = [
    {
      label: "Total Resumes",
      value: queue.length,
      detail:
        queue.length === 0
          ? "No files in this browser session."
          : unassignedCount > 0
            ? `${unassignedCount} not assigned to a role.`
            : "Listed from this browser session only.",
      tone: "text-blue-700 bg-blue-50",
    },
    {
      label: "LCA Candidates",
      value: lcaCount,
      detail: "Assigned to LCA Consultant. Not scored.",
      tone: "text-[#0c2340] bg-slate-100",
    },
    {
      label: "UI/UX Candidates",
      value: designCount,
      detail: "Assigned to UI/UX Design Intern. Not scored.",
      tone: "text-[#0c2340] bg-slate-100",
    },
    {
      label: "Needs Review",
      value: openQuestions + queue.length,
      detail:
        openQuestions > 0
          ? `${openQuestions} job-requirement question. ${queue.length} resume${queue.length === 1 ? "" : "s"} not screened.`
          : `${queue.length} resume${queue.length === 1 ? "" : "s"} not screened. The LCA experience question is recorded.`,
      tone: "text-amber-800 bg-amber-50",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary">
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-medium text-slate-500">{card.label}</h2>
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${card.tone}`}>
              Session
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
          <p className="mt-2 text-sm leading-5 text-slate-500">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
