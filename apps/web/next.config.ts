// Next.js configuration: security headers sent with every response (the content security policy itself is added per request in proxy.ts) and redirects for pages that moved.
import type { NextConfig } from "next";

const securityHeaders = [
  // Browsers must not guess file types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites learn only our address, not the page the visitor came from.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site may not be shown inside another site's frame (older browsers; newer ones use frame-ancestors).
  { key: "X-Frame-Options", value: "DENY" },
  // The site never asks for camera, microphone or location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Always use the secure connection.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

// Faculty sheets of the Pitești centre moved from the Politehnica București sheet to its own sheet (October 2026): old links keep working.
const MOVED_TO_PITESTI = [
  "facultatea-de-electronica-comunicatii-si-calculatoare",
  "facultatea-de-mecanica-si-tehnologie",
  "facultatea-de-stiinte-ale-educatiei-stiinte-sociale-si-psihologie",
  "facultatea-de-stiinte-economice-si-drept",
  "facultatea-de-stiinte-educatie-fizica-si-informatica",
  "facultatea-de-teologie-litere-istorie-si-arte",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return MOVED_TO_PITESTI.flatMap((slug) => [
      { source: `/universitati/upb/${slug}`, destination: `/universitati/upb-pitesti/${slug}`, permanent: true },
      { source: `/en/universitati/upb/${slug}`, destination: `/en/universitati/upb-pitesti/${slug}`, permanent: true },
    ]);
  },
};

export default nextConfig;
