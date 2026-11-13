"use client";

import { useScreening } from "@/context/ScreeningContext";

export function ExperienceReview({ role }) {
  const { choices, setExperienceChoice } = useScreening();
  const experience = role.experience;

  if (!experience.conflict) {
    const source = experience.sources[0];
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience requirement</p>
        <p className="mt-2 text-base font-semibold text-slate-950">
          {experience.label}: {source.range}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Source: {source.label}. This role has one stated range, so there is no conflict to resolve.
        </p>
      </div>
    );
  }

  const selected = choices[role.id] || "";
  const selectedSource = experience.sources.find((source) => source.id === selected);

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Needs human review</p>
      <h2 className="mt-1 text-lg font-semibold text-amber-950">
        LCA experience does not match across sources
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-950/90">
        The assignment PDF says 4–6 years. The supplied job description says 2–3 years. Both values stay
        visible. Screening is not pointed at either range until you choose one. You can change the choice
        until you refresh the page.
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {experience.sources.map((source) => (
          <li key={source.id} className="rounded-xl border border-amber-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{source.label}</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{source.range}</p>
          </li>
        ))}
      </ul>

      <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor={`experience-${role.id}`}>
        Which requirement should screening use later?
      </label>
      <select
        id={`experience-${role.id}`}
        className="mt-2 h-11 w-full max-w-xl rounded-lg border border-amber-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2"
        value={selected}
        onChange={(event) => setExperienceChoice(role.id, event.target.value)}
      >
        <option value="">Not selected — leave flagged for review</option>
        {experience.sources.map((source) => (
          <option key={source.id} value={source.id}>
            Use {source.label} ({source.range})
          </option>
        ))}
      </select>

      <p className="mt-3 text-sm text-amber-950">
        {selectedSource
          ? `Recorded until refresh: ${selectedSource.label} (${selectedSource.range}). The other source is still listed above.`
          : "No source is selected. The Needs Review count includes this open question."}
      </p>
    </section>
  );
}
