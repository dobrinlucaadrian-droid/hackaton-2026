"use client";
// Public form where a student writes an opinion about their faculty. No account needed; the opinion appears only after the team approves it.
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Shell } from "@/components/Shell";
import { Turnstile } from "@/components/Turnstile";
import { api } from "@/convex/_generated/api";
import { universities } from "@/lib/data";

const LIMITS = { name: 60, faculty: 120, university: 120, status: 40, textMin: 40, textMax: 3000 };
const OTHER = "__alta__";
const sorted = [...universities].sort((a, b) => (a.region === b.region ? a.name.localeCompare(b.name, "ro") : a.region === "ro" ? -1 : 1));

const field = "mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const label = "text-sm font-extrabold uppercase tracking-wide text-primary";

export default function ReviewFormPage() {
  const submit = useAction(api.reviews.submit);
  const [name, setName] = useState("");
  const [uni, setUni] = useState("");
  const [otherUni, setOtherUni] = useState("");
  const [faculty, setFaculty] = useState("");
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const onToken = useCallback((t: string) => setToken(t), []);

  const chosen = universities.find((u) => u.id === uni);
  const textLen = text.trim().length;
  const canSend = name.trim().length >= 2 && faculty.trim().length >= 2 && uni !== "" && (uni !== OTHER || otherUni.trim().length >= 2) && textLen >= LIMITS.textMin && consent && token !== "" && state === "idle";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setState("sending");
    setError(null);
    try {
      await submit({
        name,
        faculty,
        university: chosen ? chosen.name : otherUni,
        ...(chosen ? { universityId: chosen.id } : {}),
        ...(status.trim() ? { status } : {}),
        text,
        consent,
        token,
        ...(website ? { website } : {}),
      });
      setState("sent");
    } catch (err) {
      setError(err instanceof ConvexError && typeof err.data === "string" ? err.data : "Nu am putut trimite părerea. Încearcă din nou peste un minut.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <Shell>
        <div className="rise mt-10 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line" role="status">
          <h1 className="text-3xl font-black tracking-tight text-ink">Mulțumim!</h1>
          <p className="mt-3 text-ink-soft">Am primit părerea ta. O citește cineva din echipă și, după aprobare, apare pe pagina „Studenți”.</p>
          <Link href="/studenti" className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark">
            Înapoi la păreri
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link href="/studenti" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint">
        ← Înapoi
      </Link>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Scrie părerea ta</h1>
      <p className="mt-2 text-ink-soft">
        Ești student sau ai terminat o facultate? Spune-le liceenilor cum e, cu vorbele tale. Părerea apare pe site doar după ce o citește și o aprobă echipa UniPath.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line sm:p-8" noValidate>
        <div>
          <label htmlFor="p-nume" className={label}>Numele tău</label>
          <input id="p-nume" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} autoComplete="name" required className={field} />
          <p className="mt-1 text-xs text-ink-soft">Apare lângă părere, așa cum îl scrii.</p>
        </div>
        <div>
          <label htmlFor="p-uni" className={label}>Universitatea</label>
          <select id="p-uni" value={uni} onChange={(e) => setUni(e.target.value)} required className={field}>
            <option value="">Alege universitatea</option>
            {sorted.map((u) => (
              <option key={u.id} value={u.id}>{u.name}{u.region === "abroad" ? ` (${u.country})` : ""}</option>
            ))}
            <option value={OTHER}>Altă universitate</option>
          </select>
          {uni === OTHER && (
            <input aria-label="Numele universității" value={otherUni} onChange={(e) => setOtherUni(e.target.value)} maxLength={LIMITS.university} placeholder="Numele universității și țara" className={field} />
          )}
        </div>
        <div>
          <label htmlFor="p-fac" className={label}>Facultatea sau specializarea</label>
          <input id="p-fac" value={faculty} onChange={(e) => setFaculty(e.target.value)} maxLength={LIMITS.faculty} placeholder="de exemplu: Drept" required className={field} />
        </div>
        <div>
          <label htmlFor="p-an" className={label}>Anul sau „absolvent” (opțional)</label>
          <input id="p-an" value={status} onChange={(e) => setStatus(e.target.value)} maxLength={LIMITS.status} placeholder="de exemplu: anul 2" className={field} />
        </div>
        <div>
          <label htmlFor="p-text" className={label}>Părerea ta</label>
          <textarea id="p-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.textMax} rows={7} required className={`${field} py-3`} placeholder="De ce ai ales facultatea? Cum a fost admiterea? Ce îți place și ce e greu?" />
          <p className="mt-1 text-xs text-ink-soft" aria-live="polite">
            {textLen < LIMITS.textMin ? `Mai scrie cel puțin ${LIMITS.textMin - textLen} caractere.` : `${textLen} din ${LIMITS.textMax} caractere.`}
          </p>
        </div>
        {/* Hidden from people; bots fill it in and are ignored. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="p-website">Website</label>
          <input id="p-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
          <span className="text-sm text-ink">Sunt de acord ca numele meu și părerea mea să fie publicate pe UniPath. Am cel puțin 18 ani.</span>
        </label>
        <Turnstile onToken={onToken} />
        {error && <p className="text-sm font-bold text-primary-dark" role="alert">{error}</p>}
        <button type="submit" disabled={!canSend} className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
          {state === "sending" ? "Se trimite..." : "Trimite părerea"}
        </button>
      </form>
    </Shell>
  );
}
