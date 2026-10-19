// Checks a Cloudflare Turnstile token (the "I am not a robot" box) with Cloudflare, on the server. Used by the review form, the sign-up and the forgotten-password step.
import { ConvexError } from "convex/values";

/** Throws a plain Romanian message unless Cloudflare confirms the token. Call only from actions (it uses fetch). */
export async function verifyTurnstile(token: unknown): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new ConvexError("Verificarea anti-robot nu este încă pornită.");
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    throw new ConvexError("Verificarea anti-robot lipsește. Bifează căsuța „Nu sunt robot” sau reîncarcă pagina.");
  }
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token }),
  });
  const outcome = (await res.json().catch(() => ({}))) as { success?: boolean };
  if (!res.ok || outcome.success !== true) {
    throw new ConvexError("Verificarea anti-robot nu a trecut. Reîncarcă pagina și încearcă din nou.");
  }
}
