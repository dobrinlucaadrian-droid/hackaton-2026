// Convex Auth setup: accounts with a username and a password. The email is asked only at sign-up and confirmed with a 6-digit code; after that, students sign in with username and password. Forgotten passwords are reset with a code sent to the account's email.
import { Email } from "@convex-dev/auth/providers/Email";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { TOO_MANY, type LimitName } from "./authLimits";
import { cleanName } from "../lib/name";
import { cleanEmail, cleanUsername, validPassword } from "../lib/username";

/** Emails of the administrators, from the ADMIN_EMAILS setting of the deployment (comma separated). Empty until the team decides. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A random 6-digit code, from the platform's secure random numbers. */
function sixDigits(): string {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, "0");
}

/** An email provider that sends a 6-digit code. `purpose` only changes the wording of the email. */
function emailCode(id: string, purpose: "verify" | "reset") {
  const intro =
    purpose === "verify"
      ? "Codul pentru confirmarea adresei tale de email la FindMyUni este:"
      : "Ai cerut o parolă nouă pentru contul tău FindMyUni. Codul tău este:";
  return Email({
    id,
    maxAge: 15 * 60, // the code works for 15 minutes
    generateVerificationToken: async () => sixDigits(),
    async sendVerificationRequest({ identifier: email, token }) {
      // Development only (AUTH_DEV_LOG_LINKS=1 is set just on the dev deployment): write the code to the function log instead of emailing it.
      if (process.env.AUTH_DEV_LOG_LINKS === "1") {
        console.log(`[dev email code] ${purpose} ${email} ${token}`);
        return;
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          // Until the team verifies its own domain in Resend, emails can only be sent from this test address.
          from: process.env.AUTH_EMAIL_FROM ?? "Echipa FindMyUni <onboarding@resend.dev>",
          to: email,
          subject: purpose === "verify" ? "Codul tău de confirmare FindMyUni" : "Codul pentru parola nouă FindMyUni",
          text: `Bună!\n\n${intro} ${token}\n\nCodul este valabil 15 minute. Dacă nu ai cerut tu acest email, îl poți ignora.\n\nEchipa FindMyUni`,
          html: `<p>Bună!</p><p>${escapeHtml(intro)}</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#61122d">${token}</p><p>Codul este valabil 15 minute. Dacă nu ai cerut tu acest email, îl poți ignora.</p><p>Echipa FindMyUni</p>`,
        }),
      });
      if (!res.ok) throw new Error(`Emailul nu a putut fi trimis (Resend ${res.status}).`);
    },
  });
}

// The standard password provider: the account is keyed by the (verified) email, the password is stored only as a scrypt hash,
// and repeated wrong passwords or codes are rate limited by Convex Auth.
const base = Password({
  profile: (params) => ({
    email: params.email as string,
    ...(typeof params.name === "string" ? { name: params.name } : {}),
    ...(typeof params.username === "string" ? { username: params.username } : {}),
  }),
  validatePasswordRequirements: (password) => {
    if (!validPassword(password)) throw new ConvexError("Parola trebuie să aibă cel puțin 8 caractere.");
  },
  verify: emailCode("email-code", "verify"),
  reset: emailCode("email-reset", "reset"),
});
const baseAuthorize = (base as unknown as { options: { authorize: (params: Record<string, unknown>, ctx: unknown) => Promise<unknown> } }).options.authorize;

/** Spends one try from a limit in convex/authLimits.ts; stops the request with a plain message when it is used up. */
async function spend(ctx: { runMutation: (ref: typeof internal.authLimits.hit, args: { name: LimitName; key?: string }) => Promise<boolean> }, name: LimitName, key?: string) {
  if (!(await ctx.runMutation(internal.authLimits.hit, key === undefined ? { name } : { name, key }))) throw new ConvexError(TOO_MANY);
}

// The same provider, but students type a username instead of an email: for every step after sign-up the server finds the
// account's email from the username itself, so the email is never asked again and never sent to the browser.
const usernamePassword = ConvexCredentials({
  ...(base as unknown as { options: object }).options,
  id: "password",
  authorize: async (params, ctx) => {
    const flow = params.flow;
    const username = cleanUsername(String(params.username ?? ""));
    if (flow === "signUp") {
      const email = cleanEmail(String(params.email ?? ""));
      const name = cleanName(String(params.name ?? ""));
      if (!username) throw new ConvexError("Numele de utilizator trebuie să aibă 3–20 de caractere: litere fără diacritice, cifre, punct sau _.");
      if (!name) throw new ConvexError("Scrie numele tău complet (prenume și nume).");
      if (!email) throw new ConvexError("Scrie o adresă de email corectă.");
      // Accounts only from 16 years (GDPR art. 8; the age of digital consent in Romania, to be confirmed by a lawyer).
      if (params.age16 !== "yes") throw new ConvexError("Contul se poate face de la 16 ani. Până atunci poți folosi tot site-ul fără cont.");
      await spend(ctx, "signUpSite");
      await spend(ctx, "signUpEmail", email);
      if ((await ctx.runQuery(internal.users.emailOfUsername, { username })) !== null) {
        throw new ConvexError("Acest nume de utilizator este deja folosit. Alege altul.");
      }
      try {
        return (await baseAuthorize({ flow, username, name, email, password: params.password }, ctx)) as never;
      } catch (e) {
        if (e instanceof Error && /already exists/.test(e.message)) {
          throw new ConvexError("Există deja un cont cu acest email. Conectează-te cu numele de utilizator sau folosește „Am uitat parola”.");
        }
        throw e;
      }
    }
    // signIn, email-verification, reset, reset-verification: only the username is typed.
    await spend(ctx, "signInUsername", username ?? "(invalid)");
    const email = username ? await ctx.runQuery(internal.users.emailOfUsername, { username }) : null;
    if (email === null) throw new Error("Invalid credentials");
    if (flow === "reset") {
      await spend(ctx, "codeSite");
      await spend(ctx, "codeEmail", email);
    }
    return (await baseAuthorize({ ...params, email }, ctx)) as never;
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [usernamePassword],
  callbacks: {
    // After every sign-in the server (never the browser) decides the role, only from an email that was confirmed with a code.
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user) return;
      const email = typeof user.email === "string" && user.emailVerificationTime ? user.email.toLowerCase() : "";
      const shouldBeAdmin = email !== "" && adminEmails().includes(email);
      if (shouldBeAdmin && user.role !== "admin") await ctx.db.patch(userId, { role: "admin" });
      if (!shouldBeAdmin && user.role === "admin") await ctx.db.patch(userId, { role: undefined });
    },
  },
});
