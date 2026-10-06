// Tests the Content-Security-Policy builder: scripts only with the nonce, the database and the bot check allowed, nothing else.
import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

const part = (csp: string, name: string) => csp.split("; ").find((d) => d.startsWith(name + " ") || d === name) ?? "";

describe("buildCsp", () => {
  const csp = buildCsp("abc123", { convexUrl: "https://happy-animal-1.convex.cloud" });

  it("lets scripts run only with the request's nonce, never inline or eval in production", () => {
    const scripts = part(csp, "script-src");
    expect(scripts).toContain("'nonce-abc123'");
    expect(scripts).toContain("'strict-dynamic'");
    expect(scripts).not.toContain("unsafe-inline");
    expect(scripts).not.toContain("unsafe-eval");
    expect(part(buildCsp("n", { dev: true }), "script-src")).toContain("'unsafe-eval'");
  });

  it("allows data connections only to the site, the Convex database and the bot check", () => {
    expect(part(csp, "connect-src")).toBe("connect-src 'self' https://happy-animal-1.convex.cloud wss://happy-animal-1.convex.cloud https://challenges.cloudflare.com");
    expect(part(buildCsp("n", { convexUrl: "not a url" }), "connect-src")).toBe("connect-src 'self' https://challenges.cloudflare.com");
  });

  it("asks the browser to upgrade to the secure connection only when the site is already on one", () => {
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(buildCsp("n", { https: true })).toContain("upgrade-insecure-requests");
  });

  it("forbids framing, plugins and foreign form targets", () => {
    expect(part(csp, "frame-ancestors")).toBe("frame-ancestors 'none'");
    expect(part(csp, "object-src")).toBe("object-src 'none'");
    expect(part(csp, "form-action")).toBe("form-action 'self'");
    expect(part(csp, "base-uri")).toBe("base-uri 'self'");
    expect(part(csp, "default-src")).toBe("default-src 'self'");
    expect(part(csp, "frame-src")).toBe("frame-src https://challenges.cloudflare.com");
  });
});
