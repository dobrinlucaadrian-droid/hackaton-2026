"use client";
// The account form, in the page language, shared by the account window and the sign-in page: sign in with username and password, make an account (username, full name, email, password, then the 6-digit code from the email) and reset a forgotten password with a code.
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { useConvex, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/convex/_generated/api";
import { localHref, type Lang } from "@/lib/i18n";
import { cleanName } from "@/lib/name";
import { serverMessage } from "@/lib/serverMessages";
import { cleanEmail, cleanUsername, PASSWORD_MIN, validPassword } from "@/lib/username";
import { useLang, useT } from "./LangProvider";
import Link from "./LocalLink";
import { Turnstile } from "./Turnstile";

const field = "mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const label = "text-sm font-extrabold uppercase tracking-wide text-primary";
const primary = "min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50";
const textButton = "min-h-11 font-bold text-primary underline underline-offset-2";

// What the browser's password manager should offer in the password field.
const PASSWORD_HINT = { current: "current-password", fresh: "new-password" } as const;

type Mode = "signIn" | "signUp" | "code" | "forgot" | "reset";

/** The message to show for an error from the server: our own messages (a ConvexError with a text) as they are, anything else as `fallback`.
 * Checked by shape, not with instanceof: the sign-in call can come back with an error object from another copy of the Convex library. */
function messageOf(e: unknown, fallback: string, lang: Lang): string {
  const data = e instanceof ConvexError || (typeof e === "object" && e !== null && "data" in e) ? (e as { data: unknown }).data : undefined;
  if (typeof data === "string") return serverMessage(data, lang);
  // Through the Next.js sign-in proxy the error arrives as plain text: "... Uncaught ConvexError: <our message>".
  const text = e instanceof Error ? e.message.match(/ConvexError: ([^\n]+)/)?.[1] : undefined;
  return text ? serverMessage(text, lang) : fallback;
}

/** `idPrefix` keeps the field ids unique when the form is on the page twice (the sign-in page under the account window). */
export function SignInForm({ idPrefix = "", startWith = "signIn" }: { idPrefix?: string; startWith?: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const lang = useLang();
  const t = useT();
  const convex = useConvex();
  const methods = useQuery(api.account.signInMethods);
  const [mode, setMode] = useState<Mode>(startWith);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [age16, setAge16] = useState(false);
  // The Cloudflare "not a robot" check for the steps that send an email; a token works once, so the box is reset after each try.
  const [robotToken, setRobotToken] = useState("");
  const [robotKey, setRobotKey] = useState(0);
  const onRobotToken = useCallback((t: string) => setRobotToken(t), []);
  const resetRobot = () => {
    setRobotToken("");
    setRobotKey((k) => k + 1);
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const id = (n: string) => `${idPrefix}${n}`;
  const emailOff = methods?.email === false;

  function go(next: Mode, message: string | null = null) {
    setMode(next);
    setError(null);
    setInfo(message);
    setCode("");
    if (next !== "signIn") setPassword("");
  }

  async function run(params: Record<string, string>, fallback: string): Promise<boolean | null> {
    setBusy(true);
    setError(null);
    try {
      const { signingIn } = await signIn("password", params);
      return signingIn;
    } catch (e) {
      setError(messageOf(e, fallback, lang));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = cleanUsername(username);
    if (mode === "signUp") {
      if (!user) return setError(t("Numele de utilizator trebuie să aibă 3–20 de caractere: litere fără diacritice, cifre, punct sau _.", "The username must have 3–20 characters: letters without accents, digits, a dot or _."));
      const fullName = cleanName(name);
      if (!fullName) return setError(t("Scrie numele tău complet (prenume și nume).", "Write your full name (first name and surname)."));
      const mail = cleanEmail(email);
      if (!mail) return setError(t("Scrie o adresă de email corectă.", "Write a valid email address."));
      if (!validPassword(password)) return setError(t(`Parola trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`, `The password must have at least ${PASSWORD_MIN} characters.`));
      if (!age16) return setError(t("Contul se poate face de la 16 ani. Până atunci poți folosi tot site-ul fără cont.", "You can make an account from the age of 16. Until then you can use the whole site without one."));
      if (!robotToken) return setError(t("Bifează căsuța „Nu sunt robot”.", "Tick the “I am not a robot” box."));
      if (!(await convex.mutation(api.account.usernameFree, { username: user }).catch(() => true))) {
        return setError(t("Acest nume de utilizator este deja folosit. Alege altul.", "This username is already taken. Choose another one."));
      }
      resetRobot();
      const done = await run({ flow: "signUp", username: user, name: fullName, email: mail, password, age16: "yes", turnstile: robotToken }, t("Nu am putut crea contul. Dacă ai deja un cont cu acest email, conectează-te sau folosește „Am uitat parola”.", "We could not create the account. If you already have an account with this email, sign in or use “I forgot my password”."));
      if (done === false) go("code", t(`Ți-am trimis un cod din 6 cifre la ${mail}. Uită-te și în Spam.`, `We sent a 6-digit code to ${mail}. Check your spam folder too.`));
      return;
    }
    if (!user) return setError(t("Scrie numele tău de utilizator.", "Write your username."));
    if (mode === "signIn") {
      if (!password) return setError(t("Scrie parola.", "Write your password."));
      const done = await run({ flow: "signIn", username: user, password }, t("Numele de utilizator sau parola nu sunt corecte.", "The username or password is not correct."));
      if (done === true) router.push(localHref(lang, "/cont"));
      if (done === false) go("code", t("Emailul contului nu este încă confirmat. Ți-am trimis un cod din 6 cifre pe email.", "The email of this account is not confirmed yet. We sent a 6-digit code to your email."));
      return;
    }
    if (mode === "code") {
      const done = await run({ flow: "email-verification", username: user, code: code.trim() }, t("Codul nu este corect sau a expirat.", "The code is not correct or has expired."));
      if (done === true) router.push(localHref(lang, "/cont"));
      return;
    }
    if (mode === "forgot") {
      if (!robotToken) return setError(t("Bifează căsuța „Nu sunt robot”.", "Tick the “I am not a robot” box."));
      const token = robotToken;
      resetRobot();
      // The same answer whether the username exists or not, so the form does not reveal who has an account.
      // Only our own messages (robot check, too many tries) stop here; "unknown username" looks like success.
      setBusy(true);
      setError(null);
      try {
        await signIn("password", { flow: "reset", username: user, turnstile: token });
      } catch (e) {
        const own = messageOf(e, "", lang);
        if (own) {
          setBusy(false);
          return setError(own);
        }
      }
      setBusy(false);
      go("reset", t("Dacă acest nume de utilizator există, am trimis un cod din 6 cifre pe emailul contului.", "If this username exists, we sent a 6-digit code to the account's email."));
      return;
    }
    if (!validPassword(password)) return setError(t(`Parola nouă trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`, `The new password must have at least ${PASSWORD_MIN} characters.`));
    const done = await run({ flow: "reset-verification", username: user, code: code.trim(), newPassword: password }, t("Codul nu este corect sau a expirat.", "The code is not correct or has expired."));
    if (done === true) router.push(localHref(lang, "/cont"));
  }

  const TITLE: Record<Mode, string> = {
    signIn: t("Conectează-te", "Sign in"),
    signUp: t("Fă-ți un cont", "Make an account"),
    code: t("Confirmă emailul", "Confirm your email"),
    forgot: t("Ai uitat parola?", "Forgot your password?"),
    reset: t("Alege o parolă nouă", "Choose a new password"),
  };
  const submitLabel: Record<Mode, string> = {
    signIn: t("Intră în cont", "Sign in"),
    signUp: t("Creează contul", "Create the account"),
    code: t("Confirmă", "Confirm"),
    forgot: t("Trimite-mi un cod", "Send me a code"),
    reset: t("Salvează parola nouă", "Save the new password"),
  };

  return (
    <div data-account-form={mode}>
      <h2 className="mt-6 text-xl font-black tracking-tight text-ink">{TITLE[mode]}</h2>
      {info && (
        <p className="mt-2 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="status">
          {info}
        </p>
      )}
      <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor={id("utilizator")} className={label}>{t("Nume de utilizator", "Username")}</label>
          <input
            id={id("utilizator")}
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            value={username}
            readOnly={mode === "code" || mode === "reset"}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t("de exemplu andrei.pop07", "for example andrei.pop07")}
            className={field}
          />
          {mode === "signUp" && <p className="mt-1 text-xs text-ink-soft">{t("3–20 caractere: litere fără diacritice, cifre, punct sau _. Cu el te vei conecta.", "3–20 characters: letters without accents, digits, a dot or _. You will sign in with it.")}</p>}
        </div>

        {mode === "signUp" && (
          <>
            <div>
              <label htmlFor={id("nume")} className={label}>{t("Numele tău complet", "Your full name")}</label>
              <input id={id("nume")} name="name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Prenume și nume", "First name and surname")} className={field} />
            </div>
            <div>
              <label htmlFor={id("email")} className={label}>{t("Adresa ta de email", "Your email address")}</label>
              <input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("nume@exemplu.ro", "name@example.com")} className={field} />
              <p className="mt-1 text-xs text-ink-soft">{t("O cerem doar acum, ca să-ți trimitem codul de confirmare și, dacă uiți parola, un cod pentru una nouă.", "We ask for it only now, to send you the confirmation code and, if you forget your password, a code to set a new one.")}</p>
            </div>
          </>
        )}

        {(mode === "code" || mode === "reset") && (
          <div>
            <label htmlFor={id("cod")} className={label}>{t("Codul din email", "The code from the email")}</label>
            <input
              id={id("cod")}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder={t("6 cifre", "6 digits")}
              className={`${field} tracking-[0.4em]`}
            />
          </div>
        )}

        {(mode === "signIn" || mode === "signUp" || mode === "reset") && (
          <div>
            <label htmlFor={id("parola")} className={label}>{mode === "reset" ? t("Parola nouă", "New password") : t("Parola", "Password")}</label>
            <input
              id={id("parola")}
              name="password"
              type="password"
              autoComplete={mode === "signIn" ? PASSWORD_HINT.current : PASSWORD_HINT.fresh}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
            {mode !== "signIn" && <p className="mt-1 text-xs text-ink-soft">{t(`Cel puțin ${PASSWORD_MIN} caractere.`, `At least ${PASSWORD_MIN} characters.`)}</p>}
            {mode === "signIn" && (
              <div className="mt-1 text-right text-sm">
                <button type="button" onClick={() => go("forgot")} className={textButton}>{t("Am uitat parola", "I forgot my password")}</button>
              </div>
            )}
          </div>
        )}

        {mode === "signUp" && (
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={age16} onChange={(e) => setAge16(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
            <span>{t("Am cel puțin 16 ani. Dacă ai mai puțin, poți folosi tot site-ul fără cont.", "I am at least 16 years old. If you are younger, you can use the whole site without an account.")}</span>
          </label>
        )}

        {(mode === "signUp" || mode === "forgot") && <Turnstile key={robotKey} onToken={onRobotToken} />}

        <button type="submit" disabled={busy || (emailOff && (mode === "signUp" || mode === "forgot"))} className={primary}>
          {busy ? t("Așteaptă...", "Please wait...") : submitLabel[mode]}
        </button>
        {error && (
          <p className="text-sm font-bold text-primary-dark" role="alert">
            {error}
          </p>
        )}
        {emailOff && (mode === "signUp" || mode === "forgot") && (
          <p className="text-sm text-ink-soft" role="note">{t("Trimiterea codurilor pe email nu este încă pornită. Revino în curând.", "Sending codes by email is not switched on yet. Please come back soon.")}</p>
        )}
      </form>

      <div className="mt-4 flex flex-col items-start gap-1 text-sm">
        {mode === "signIn" && <button type="button" onClick={() => go("signUp")} className={textButton}>{t("Nu ai cont? Fă-ți unul", "No account? Make one")}</button>}
        {mode === "signUp" && <button type="button" onClick={() => go("signIn")} className={textButton}>{t("Ai deja cont? Conectează-te", "Already have an account? Sign in")}</button>}
        {mode === "code" && (
          <button
            type="button"
            onClick={() => go("signIn", t("Conectează-te cu numele și parola; îți trimitem un cod nou pe email.", "Sign in with your username and password; we will send you a new code by email."))}
            className={textButton}
          >
            {t("Nu a venit codul? Cere unul nou", "Code did not arrive? Ask for a new one")}
          </button>
        )}
        {(mode === "forgot" || mode === "reset") && <button type="button" onClick={() => go("signIn")} className={textButton}>{t("Înapoi la conectare", "Back to sign in")}</button>}
      </div>

      <p className="mt-6 text-sm text-ink-soft" role="note">
        {t(
          "Păstrăm numele de utilizator, numele tău, adresa de email, parola (păstrată doar ca o amprentă din care nu se poate afla, nici de noi) și rezultatul chestionarului, dacă îl salvezi. Îți poți șterge contul oricând, din pagina „Contul meu”.",
          "We keep your username, your name, your email address, your password (kept only as a fingerprint that nobody, not even us, can read) and your quiz result, if you save it. You can delete your account at any time from the “My account” page.",
        )}{" "}
        <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">{t("Află mai multe", "Learn more")}</Link>
      </p>
    </div>
  );
}
