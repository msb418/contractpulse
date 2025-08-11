// src/app/(auth)/layout.tsx
import * as React from "react";
import "../globals.css";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-pattern text-white">
      {/* Sticky brand bar (no logout on auth pages) */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10 h-[var(--nav-h)] flex items-center px-6">
        <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ContractPulse
        </div>
      </header>

      {/* Pad content below the sticky nav */}
      <main className="pt-[var(--nav-h)]">
        <section className="mx-auto w-full max-w-md px-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur-md">
            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </section>
        <div className="h-16" />
      </main>
    </div>
  );
}