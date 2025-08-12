import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="rounded border border-white/10 p-5">Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}