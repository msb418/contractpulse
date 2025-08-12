"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 420);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function safeJson(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {} as any;
    try {
      return await res.json();
    } catch {
      return {} as any;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const trimmed = email.trim();
    if (!trimmed || !password || password.length < 8) {
      setErr("Use a valid email and a password of at least 8 characters.");
      return;
    }

    if (!captchaToken) {
      setErr("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed, password, captchaToken }),
        cache: "no-store",
      });
      if (res.ok) {
        // Redirect to login with success flag; some 2xx responses may have no JSON body
        router.push("/login?registered=1");
        return;
      } else {
        // Try to surface server error message if present
        const data = await safeJson(res);
        const text = !Object.keys(data as any).length ? await res.text().catch(() => "") : "";
        setErr(((data as any)?.error as string) || text || "Registration failed.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border border-white/10 p-5">
      <h2 className="mb-4 text-lg font-medium">Create account</h2>
      {err && <p className="mb-3 rounded bg-red-900/40 p-2 text-sm text-red-200">{err}</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-white/70">Email</label>
          <input
            className="w-full rounded bg-zinc-900 p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-white/70">Password</label>
          <input
            className="w-full rounded bg-zinc-900 p-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
            minLength={8}
          />
        </div>

        <HCaptcha
          sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
          size={isMobile ? "compact" : "normal"}
          onVerify={(token: string) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
          theme="dark"
        />

        <button
          disabled={loading || !captchaToken}
          className="w-full rounded bg-blue-600/80 px-3 py-2 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-white/60">
        Already have an account?{" "}
        <a className="text-white underline" href="/login">
          Sign in
        </a>
      </p>
    </div>
  );
}