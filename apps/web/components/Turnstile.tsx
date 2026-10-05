"use client";
// Cloudflare Turnstile bot check: shows the widget and reports its token; the token is verified on the server before anything is stored.
import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
    if (!ready || !api || !box.current || !SITE_KEY) return;
    const id = api.render(box.current, {
      sitekey: SITE_KEY,
      language: "ro",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
    return () => api.remove(id);
  }, [ready, onToken]);

  if (!SITE_KEY) return <p className="text-sm text-ink-soft" role="note">Verificarea anti-robot nu este încă pornită.</p>;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={box} data-turnstile className="min-h-[65px]" />
    </>
  );
}
