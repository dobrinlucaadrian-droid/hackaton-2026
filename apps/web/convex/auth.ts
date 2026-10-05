// Convex Auth setup: sign-in with an email magic link (sent through Resend) and, when configured, Google. No passwords are stored.
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

/** Emails of the administrators, from the ADMIN_EMAILS setting of the deployment (comma separated). Empty until the team decides. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const magicLink = Resend({
  // Until the team verifies its own domain in Resend, emails can only be sent from this test address.
  from: process.env.AUTH_EMAIL_FROM ?? "UniPath <onboarding@resend.dev>",
  maxAge: 15 * 60, // the link works for 15 minutes
  async sendVerificationRequest({ identifier: email, url, provider }) {
    // Development only (AUTH_DEV_LOG_LINKS=1 is set just on the dev deployment): write the link to the function log instead of emailing it.
    if (process.env.AUTH_DEV_LOG_LINKS === "1") {
      console.log(`[dev sign-in link] ${email} ${url}`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: provider.from,
        to: email,
        subject: "Linkul tău de conectare la UniPath",
        text: `Bună!\n\nApasă pe linkul de mai jos ca să te conectezi la UniPath. Linkul este valabil 15 minute.\n\n${url}\n\nDacă nu ai cerut tu acest email, îl poți ignora.`,
        html: `<p>Bună!</p><p>Apasă pe butonul de mai jos ca să te conectezi la UniPath. Linkul este valabil 15 minute.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#6b1530;color:#ffffff;font-weight:bold;text-decoration:none">Conectează-te la UniPath</a></p><p>Dacă nu ai cerut tu acest email, îl poți ignora.</p>`,
      }),
    });
    if (!res.ok) throw new Error(`Emailul nu a putut fi trimis (Resend ${res.status}).`);
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [magicLink, ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google] : [])],
  callbacks: {
    // After every sign-in the server (never the browser) decides the role from the verified email.
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user) return;
      const email = typeof user.email === "string" ? user.email.toLowerCase() : "";
      const shouldBeAdmin = email !== "" && adminEmails().includes(email);
      if (shouldBeAdmin && user.role !== "admin") await ctx.db.patch(userId, { role: "admin" });
      if (!shouldBeAdmin && user.role === "admin") await ctx.db.patch(userId, { role: undefined });
    },
  },
});
