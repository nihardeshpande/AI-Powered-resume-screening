"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { company, navigation } from "@/data/jobs";

export function Sidebar({ open, onNavigate }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#0c2340] text-white transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-sm font-semibold tracking-wide">
            GFI
          </span>
          <div>
            <p className="text-sm font-semibold leading-5">{company.name}</p>
            <p className="text-xs text-slate-300">Recruitment</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
        {navigation.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/12 text-white ring-1 ring-white/15"
                  : "text-slate-200 hover:bg-white/8 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="px-6 py-5 text-xs leading-5 text-slate-400">
        The queue stays in memory while you move between pages. Refreshing clears it. Resume text is not read, and match scores are not created.
      </p>
    </aside>
  );
}
