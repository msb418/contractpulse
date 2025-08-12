"use client";

import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* your login form here */}
    </div>
  );
}