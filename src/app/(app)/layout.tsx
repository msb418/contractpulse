// src/app/(app)/layout.tsx
import "../globals.css";
import Nav from "@/components/Nav";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-pattern text-white">
      <Nav />

      {/* Always leave room for the sticky nav using the CSS variable */}
      <main className="pt-[var(--nav-h)]">
        {/* page chrome */}
        <section className="mx-auto w-full max-w-6xl px-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 shadow-xl backdrop-blur-md">
            <div className="p-6 sm:p-8">{children}</div>
          </div>
        </section>

        {/* bottom breathing room */}
        <div className="h-16" />
      </main>
    </div>
  );
}