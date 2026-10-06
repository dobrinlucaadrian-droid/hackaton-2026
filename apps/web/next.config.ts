// Next.js configuration: security headers sent with every response (the content security policy itself is added per request in proxy.ts).
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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
