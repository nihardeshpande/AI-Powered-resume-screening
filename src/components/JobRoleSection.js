export function JobRoleSection({ role, children, showHeading = true }) {
  return (
    <section className="space-y-4" aria-labelledby={showHeading ? `role-${role.id}` : undefined}>
      {showHeading ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Job role</p>
          <h2 id={`role-${role.id}`} className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {role.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{role.summary}</p>
        </div>
      ) : null}

      <ul className="flex flex-wrap gap-2">
        {role.requirements.map((requirement) => (
          <li
            key={requirement.id}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
          >
            {requirement.text}
            {requirement.preferred ? (
              <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-blue-700">Preferred</span>
            ) : null}
          </li>
        ))}
      </ul>

      {children}
    </section>
  );
}
