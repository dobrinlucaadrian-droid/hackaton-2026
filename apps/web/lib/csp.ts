// Builds the Content-Security-Policy header: the list of places the browser may load scripts, styles, images and data from.

/** `nonce` is a fresh random value per request; only scripts carrying it (and scripts they load) may run. */
export function buildCsp(nonce: string, options: { convexUrl?: string; dev?: boolean; https?: boolean } = {}): string {
  let convex: string[] = [];
  try {
    if (options.convexUrl) {
      const host = new URL(options.convexUrl).host;
      convex = [`https://${host}`, `wss://${host}`];
    }
  } catch {
    convex = [];
  }
  const turnstile = "https://challenges.cloudflare.com"; // the bot check on the review form
  const directives: [string, string[]][] = [
    ["default-src", ["'self'"]],
    ["script-src", ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(options.dev ? ["'unsafe-eval'"] : [])]],
    // Inline style attributes are used for progress bars and animations; no user text ever reaches a style.
    ["style-src", ["'self'", "'unsafe-inline'"]],
    // data: and blob: are the diploma photos a student picks, which never leave the device.
    ["img-src", ["'self'", "data:", "blob:"]],
    ["font-src", ["'self'"]],
    ["connect-src", ["'self'", ...convex, turnstile]],
    ["frame-src", [turnstile]],
    ["object-src", ["'none'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    // Only on a secure connection: on a plain local address it would break the site's own requests.
    ...(options.https ? ([["upgrade-insecure-requests", []]] as [string, string[]][]) : []),
  ];
  return directives.map(([name, values]) => [name, ...values].join(" ")).join("; ");
}
