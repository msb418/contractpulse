"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HCaptcha from "@hcaptcha/react-hcaptcha";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  async function safeJson(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return {} as any;
    try {
      return await res.json();
    } catch {
      return {} as any;
    }
  }

  // Responsive captcha: update isMobile state on load and resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 420);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!captchaToken) {
      setErr("Please complete the captcha.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, captchaToken }),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await safeJson(res);
        if ((data as any).token) {
          document.cookie = `token=${(data as any).token}; Secure; SameSite=Strict; path=/`;
        }
        router.replace("/contracts");
      } else {
        const data = await safeJson(res);
        setErr((data as any).error || "Invalid email or password.");
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border border-white/10 p-5">
      <h2 className="mb-4 text-lg font-medium">Log in</h2>
      {registered && (
        <p className="mb-3 rounded bg-green-700/50 p-2 text-sm text-green-100">
          Account created successfully — please sign in.
        </p>
      )}
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
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="mt-3 w-full overflow-hidden">
          <HCaptcha
            ref={captchaRef}
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            size={isMobile ? "compact" : "normal"}
            theme="dark"
          />
        </div>

        <button
          disabled={loading || !captchaToken}
          className="w-full rounded bg-blue-600/80 px-3 py-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-white/60">
        New here?{" "}
        <a className="text-white underline" href="/register">
          Create an account
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded border border-white/10 p-5">Loading…</div>}>
      <LoginInner />
    </Suspense>
  );
}