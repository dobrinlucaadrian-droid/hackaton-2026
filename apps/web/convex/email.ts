// Sends the site's emails through Resend (codes, admin codes and security notices); on the development deployment it only writes them to the log.
import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Sends one email. `devLog` is what the development log shows instead (AUTH_DEV_LOG_LINKS=1 is set only on the dev deployment). */
export async function sendEmail({ to, subject, paragraphs, devLog }: { to: string; subject: string; paragraphs: string[]; devLog: string }): Promise<void> {
  if (process.env.AUTH_DEV_LOG_LINKS === "1") {
    console.log(`[dev email] ${devLog}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM ?? "Echipa FindMyUni <onboarding@resend.dev>",
      to,
      subject,
      text: ["Bună!", ...paragraphs, "Echipa FindMyUni"].join("\n\n"),
      html: ["Bună!", ...paragraphs, "Echipa FindMyUni"].map((p) => `<p>${escapeHtml(p)}</p>`).join(""),
    }),
  });
  if (!res.ok) throw new Error(`Emailul nu a putut fi trimis (Resend ${res.status}).`);
}

const CONTACT = "Dacă nu ai fost tu, scrie-ne imediat la adresa de contact de pe pagina de confidențialitate a site-ului.";

/** Security notices: a student learns at once when their password changed or their account was deleted. */
export const securityNotice = internalAction({
  args: { to: v.string(), kind: v.union(v.literal("passwordChanged"), v.literal("accountDeleted")) },
  returns: v.null(),
  handler: async (_ctx, { to, kind }) => {
    if (kind === "passwordChanged") {
      await sendEmail({
        to,
        subject: "Parola contului tău FindMyUni a fost schimbată",
        paragraphs: ["Parola contului tău FindMyUni tocmai a fost schimbată, cu un cod trimis pe acest email.", CONTACT],
        devLog: `passwordChanged ${to}`,
      });
    } else {
      await sendEmail({
        to,
        subject: "Contul tău FindMyUni a fost șters",
        paragraphs: ["Contul tău FindMyUni a fost șters, împreună cu tot ce păstram în el: rezultatul chestionarului și universitățile favorite.", CONTACT],
        devLog: `accountDeleted ${to}`,
      });
    }
    return null;
  },
});
