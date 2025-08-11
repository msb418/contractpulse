"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
      });
      if (res.ok) {
        router.push("/contracts");
      } else {
        const data = await res.json().catch(() => ({}));
        setErr(data.error || "Registration failed.");
      }
    } catch {
      setErr("Network error. Try again.");
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
          onVerify={(token: string) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
          onError={() => setCaptchaToken(null)}
        />

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600/80 px-3 py-2"
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