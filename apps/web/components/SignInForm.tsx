"use client";
// The account form, shared by the account window and the sign-in page: sign in with username and password, make an account (username, full name, email, password, then the 6-digit code from the email) and reset a forgotten password with a code.
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { useConvex, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { cleanName } from "@/lib/name";
import { cleanEmail, cleanUsername, PASSWORD_MIN, validPassword } from "@/lib/username";

const field = "mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const label = "text-sm font-extrabold uppercase tracking-wide text-primary";
const primary = "min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50";
const textButton = "min-h-11 font-bold text-primary underline underline-offset-2";

// What the browser's password manager should offer in the password field.
const PASSWORD_HINT = { current: "current-password", fresh: "new-password" } as const;

type Mode = "signIn" | "signUp" | "code" | "forgot" | "reset";

const TITLE: Record<Mode, string> = {
  signIn: "Conectează-te",
  signUp: "Fă-ți un cont",
  code: "Confirmă emailul",
  forgot: "Ai uitat parola?",
  reset: "Alege o parolă nouă",
};

/** The message to show for an error from the server: our own messages (a ConvexError with a text) as they are, anything else as `fallback`.
 * Checked by shape, not with instanceof: the sign-in call can come back with an error object from another copy of the Convex library. */
function messageOf(e: unknown, fallback: string): string {
  const data = e instanceof ConvexError || (typeof e === "object" && e !== null && "data" in e) ? (e as { data: unknown }).data : undefined;
  if (typeof data === "string") return data;
  // Through the Next.js sign-in proxy the error arrives as plain text: "... Uncaught ConvexError: <our message>".
  const text = e instanceof Error ? e.message.match(/ConvexError: ([^\n]+)/)?.[1] : undefined;
  return text ?? fallback;
}

/** `idPrefix` keeps the field ids unique when the form is on the page twice (the sign-in page under the account window). */
export function SignInForm({ idPrefix = "", startWith = "signIn" }: { idPrefix?: string; startWith?: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const convex = useConvex();
  const methods = useQuery(api.account.signInMethods);
  const [mode, setMode] = useState<Mode>(startWith);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [age16, setAge16] = useState(false);
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
      setError(messageOf(e, fallback));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = cleanUsername(username);
    if (mode === "signUp") {
      if (!user) return setError("Numele de utilizator trebuie să aibă 3–20 de caractere: litere fără diacritice, cifre, punct sau _.");
      const fullName = cleanName(name);
      if (!fullName) return setError("Scrie numele tău complet (prenume și nume).");
      const mail = cleanEmail(email);
      if (!mail) return setError("Scrie o adresă de email corectă.");
      if (!validPassword(password)) return setError(`Parola trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`);
      if (!age16) return setError("Contul se poate face de la 16 ani. Până atunci poți folosi tot site-ul fără cont.");
      if (!(await convex.mutation(api.account.usernameFree, { username: user }).catch(() => true))) {
        return setError("Acest nume de utilizator este deja folosit. Alege altul.");
      }
      const done = await run({ flow: "signUp", username: user, name: fullName, email: mail, password, age16: "yes" }, "Nu am putut crea contul. Dacă ai deja un cont cu acest email, conectează-te sau folosește „Am uitat parola”.");
      if (done === false) go("code", `Ți-am trimis un cod din 6 cifre la ${mail}. Uită-te și în Spam.`);
      return;
    }
    if (!user) return setError("Scrie numele tău de utilizator.");
    if (mode === "signIn") {
      if (!password) return setError("Scrie parola.");
      const done = await run({ flow: "signIn", username: user, password }, "Numele de utilizator sau parola nu sunt corecte.");
      if (done === true) router.push("/cont");
      if (done === false) go("code", "Emailul contului nu este încă confirmat. Ți-am trimis un cod din 6 cifre pe email.");
      return;
    }
    if (mode === "code") {
      const done = await run({ flow: "email-verification", username: user, code: code.trim() }, "Codul nu este corect sau a expirat.");
      if (done === true) router.push("/cont");
      return;
    }
    if (mode === "forgot") {
      // The same answer whether the username exists or not, so the form does not reveal who has an account.
      await run({ flow: "reset", username: user }, "");
      go("reset", "Dacă acest nume de utilizator există, am trimis un cod din 6 cifre pe emailul contului.");
      return;
    }
    if (!validPassword(password)) return setError(`Parola nouă trebuie să aibă cel puțin ${PASSWORD_MIN} caractere.`);
    const done = await run({ flow: "reset-verification", username: user, code: code.trim(), newPassword: password }, "Codul nu este corect sau a expirat.");
    if (done === true) router.push("/cont");
  }

  const submitLabel: Record<Mode, string> = {
    signIn: "Intră în cont",
    signUp: "Creează contul",
    code: "Confirmă",
    forgot: "Trimite-mi un cod",
    reset: "Salvează parola nouă",
  };

  return (
    <div data-account-form={mode}>
      <h3 className="mt-6 text-xl font-black tracking-tight text-ink">{TITLE[mode]}</h3>
      {info && (
        <p className="mt-2 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="status">
          {info}
        </p>
      )}
      <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor={id("utilizator")} className={label}>Nume de utilizator</label>
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
            placeholder="de exemplu andrei.pop07"
            className={field}
          />
          {mode === "signUp" && <p className="mt-1 text-xs text-ink-soft">3–20 caractere: litere fără diacritice, cifre, punct sau _. Cu el te vei conecta.</p>}
        </div>

        {mode === "signUp" && (
          <>
            <div>
              <label htmlFor={id("nume")} className={label}>Numele tău complet</label>
              <input id={id("nume")} name="name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Prenume și nume" className={field} />
            </div>
            <div>
              <label htmlFor={id("email")} className={label}>Adresa ta de email</label>
              <input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nume@exemplu.ro" className={field} />
              <p className="mt-1 text-xs text-ink-soft">O cerem doar acum, ca să-ți trimitem codul de confirmare și, dacă uiți parola, un cod pentru una nouă.</p>
            </div>
          </>
        )}

        {(mode === "code" || mode === "reset") && (
          <div>
            <label htmlFor={id("cod")} className={label}>Codul din email</label>
            <input
              id={id("cod")}
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6 cifre"
              className={`${field} tracking-[0.4em]`}
            />
          </div>
        )}

        {(mode === "signIn" || mode === "signUp" || mode === "reset") && (
          <div>
            <label htmlFor={id("parola")} className={label}>{mode === "reset" ? "Parola nouă" : "Parola"}</label>
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
            {mode !== "signIn" && <p className="mt-1 text-xs text-ink-soft">Cel puțin {PASSWORD_MIN} caractere.</p>}
          </div>
        )}

        {mode === "signUp" && (
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={age16} onChange={(e) => setAge16(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
            <span>Am cel puțin 16 ani. Dacă ai mai puțin, poți folosi tot site-ul fără cont.</span>
          </label>
        )}

        <button type="submit" disabled={busy || (emailOff && (mode === "signUp" || mode === "forgot"))} className={primary}>
          {busy ? "Așteaptă..." : submitLabel[mode]}
        </button>
        {error && (
          <p className="text-sm font-bold text-primary-dark" role="alert">
            {error}
          </p>
        )}
        {emailOff && (mode === "signUp" || mode === "forgot") && (
          <p className="text-sm text-ink-soft" role="note">Trimiterea codurilor pe email nu este încă pornită. Revino în curând.</p>
        )}
      </form>

      <div className="mt-4 flex flex-col items-start gap-1 text-sm">
        {mode === "signIn" && (
          <>
            <button type="button" onClick={() => go("signUp")} className={textButton}>Nu ai cont? Fă-ți unul</button>
            <button type="button" onClick={() => go("forgot")} className={textButton}>Am uitat parola</button>
          </>
        )}
        {mode === "signUp" && <button type="button" onClick={() => go("signIn")} className={textButton}>Ai deja cont? Conectează-te</button>}
        {mode === "code" && (
          <button
            type="button"
            onClick={() => go("signIn", "Conectează-te cu numele și parola; îți trimitem un cod nou pe email.")}
            className={textButton}
          >
            Nu a venit codul? Cere unul nou
          </button>
        )}
        {(mode === "forgot" || mode === "reset") && <button type="button" onClick={() => go("signIn")} className={textButton}>Înapoi la conectare</button>}
      </div>

      <p className="mt-6 text-sm text-ink-soft" role="note">
        Păstrăm numele de utilizator, numele tău, adresa de email, parola (păstrată doar ca o amprentă din care nu se poate afla, nici de noi) și rezultatul chestionarului, dacă îl salvezi. Îți poți șterge contul oricând, din pagina „Contul meu”.{" "}
        <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2">Află mai multe</Link>
      </p>
    </div>
  );
}
