"use client";

import { roles } from "@/data/jobs";

const fieldClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none ring-blue-600 focus:ring-2";

export function CandidateControls({
  query,
  onQueryChange,
  roleId,
  onRoleChange,
  sortDirection,
  onSortChange,
  lockRole,
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)]">
      <label className="block text-sm font-medium text-slate-700">
        Search candidates
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by file name or local ID"
          className={`${fieldClass} mt-1.5`}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Filter by role
        <select
          value={lockRole ? lockRole : roleId}
          onChange={(event) => onRoleChange(event.target.value)}
          disabled={Boolean(lockRole)}
          className={`${fieldClass} mt-1.5 disabled:bg-slate-50 disabled:text-slate-500`}
        >
          {lockRole ? null : <option value="all">All roles</option>}
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.title}
            </option>
          ))}
          {lockRole ? null : <option value="">Unassigned</option>}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Sort by match score
        <select
          value={sortDirection}
          onChange={(event) => onSortChange(event.target.value)}
          className={`${fieldClass} mt-1.5`}
        >
          <option value="desc">High to low</option>
          <option value="asc">Low to high</option>
        </select>
      </label>
    </div>
  );
}
