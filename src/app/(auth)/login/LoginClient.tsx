

"use client";

import { useEffect, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

/**
 * Responsive hCaptcha renderer for the Login page.
 *
 * Usage in page.tsx (client or inside a client wrapper):
 *
 *   const [captchaToken, setCaptchaToken] = useState("");
 *   <LoginClient onVerify={setCaptchaToken} />
 *
 * Or provide a custom siteKey via props. Falls back to NEXT_PUBLIC_HCAPTCHA_SITE_KEY.
 */
export default function LoginClient({
  onVerify,
  siteKey,
  className = "",
}: {
  onVerify: (token: string) => void;
  siteKey?: string;
  className?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 420);
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const resolvedKey = siteKey || process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "";

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <HCaptcha
        sitekey={resolvedKey}
        onVerify={(token) => onVerify(token)}
        size={isMobile ? "compact" : "normal"}
        theme="dark"
      />
    </div>
  );
}