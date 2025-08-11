"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Nav() {
  const router = useRouter();

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // send cookies so server can clear them
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.replace("/login");
    }
  }

  return (
    <nav className="flex items-center justify-between bg-black/50 backdrop-blur-md border-b border-white/10 px-6 h-[var(--nav-h)]">
      <Link href="/contracts" className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        ContractPulse
      </Link>
      <div className="flex items-center space-x-4">
        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}