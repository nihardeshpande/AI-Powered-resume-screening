"use client";

import { useState } from "react";
import { ScreeningProvider } from "@/context/ScreeningContext";
import { Sidebar } from "@/components/Sidebar";

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <ScreeningProvider>
      <div className="min-h-full bg-[#f3f6fb] text-slate-900">
        <Sidebar open={open} onNavigate={() => setOpen(false)} />
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        ) : null}

        <div className="lg:pl-72">
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                <path d="M3 5.25h14v1.5H3v-1.5Zm0 4h14v1.5H3v-1.5Zm0 4h14v1.5H3v-1.5Z" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-semibold">Growth For Impact</p>
              <p className="text-xs text-slate-500">Resume screening</p>
            </div>
          </div>

          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </ScreeningProvider>
  );
}
