"use client";
// Public form (in the page language) where a student writes an opinion about their faculty. No account needed; the opinion appears only after the team approves it.
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useCallback, useState } from "react";
import { useLang, useT } from "@/components/LangProvider";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { PhotoPicker, type Photo } from "@/components/PhotoPicker";
import { Turnstile } from "@/components/Turnstile";
import { OTHER, UniversityPicker } from "@/components/UniversityPicker";
import { api } from "@/convex/_generated/api";
import { serverMessage } from "@/lib/serverMessages";
import { universities } from "@/lib/universities";

const LIMITS = { name: 60, faculty: 120, university: 120, status: 40, textMin: 40, textMax: 3000 };

const field = "mt-1 min-h-12 w-full rounded-xl border-2 border-transparent bg-paper px-4 text-ink ring-1 ring-line focus:border-primary focus:outline-none";
const label = "text-sm font-extrabold uppercase tracking-wide text-primary";

export default function ReviewFormPage() {
  const lang = useLang();
  const t = useT();
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
  const [robotKey, setRobotKey] = useState(0); // a token works once, so the box is reset after a failed send
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [askFace, setAskFace] = useState(false); // the last window: may we show your face?
  const [faceOk, setFaceOk] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const onToken = useCallback((tok: string) => setToken(tok), []);

  const chosen = universities.find((u) => u.id === uni);
  const textLen = text.trim().length;
  const canSend = name.trim().length >= 2 && faculty.trim().length >= 2 && uni !== "" && (uni !== OTHER || otherUni.trim().length >= 2) && textLen >= LIMITS.textMin && consent && token !== "" && state === "idle";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    if (photo) {
      setFaceOk(false);
      setAskFace(true);
      return;
    }
    await send(false);
  }

  // Without the "show my face" tick the photo never leaves the device.
  async function send(withPhoto: boolean) {
    setAskFace(false);
    setState("sending");
    setError(null);
    try {
      const picture = withPhoto && photo ? { photo: await photo.blob.arrayBuffer(), photoConsent: true } : {};
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
        ...picture,
      });
      setState("sent");
    } catch (err) {
      setError(err instanceof ConvexError && typeof err.data === "string" ? serverMessage(err.data, lang) : t("Nu am putut trimite părerea. Încearcă din nou peste un minut.", "We could not send your opinion. Try again in a minute."));
      setToken("");
      setRobotKey((k) => k + 1);
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <Shell>
        <div className="rise mt-10 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line" role="status">
          <h1 className="text-3xl font-black tracking-tight text-ink">{t("Mulțumim!", "Thank you!")}</h1>
          <p className="mt-3 text-ink-soft">{t("Am primit părerea ta. O citește cineva din echipă și, după aprobare, apare pe pagina „Studenți”.", "We received your opinion. Someone from the team reads it and, once approved, it appears on the “Students” page.")}</p>
          <Link href="/studenti" className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark">
            {t("Înapoi la păreri", "Back to opinions")}
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link href="/studenti" className="inline-flex min-h-11 items-center rounded-full border-2 border-primary px-5 py-2 font-bold text-primary hover:bg-primary-tint">
        {t("← Înapoi", "← Back")}
      </Link>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Scrie părerea ta", "Write your opinion")}</h1>
      <p className="mt-2 text-ink-soft">
        {t("Ești student sau ai terminat o facultate? Spune-le liceenilor cum e, cu vorbele tale. Părerea apare pe site doar după ce o citește și o aprobă echipa FindMyUni.", "Are you a student or a graduate? Tell future students what it is really like, in your own words. Your opinion appears on the site only after the FindMyUni team reads and approves it.")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line sm:p-8" noValidate>
        <div>
          <label htmlFor="p-nume" className={label}>{t("Numele tău", "Your name")}</label>
          <input id="p-nume" value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} autoComplete="name" required className={field} />
          <p className="mt-1 text-xs text-ink-soft">{t("Apare lângă părere, așa cum îl scrii.", "It appears next to your opinion, exactly as you write it.")}</p>
        </div>
        <div>
          <label htmlFor="p-uni" className={label}>{t("Universitatea", "University")}</label>
          <UniversityPicker value={uni} onChange={setUni} className={field} />
          {uni === OTHER && (
            <input aria-label={t("Numele universității", "Name of the university")} value={otherUni} onChange={(e) => setOtherUni(e.target.value)} maxLength={LIMITS.university} placeholder={t("Numele universității și țara", "Name of the university and the country")} className={field} />
          )}
        </div>
        <div>
          <label htmlFor="p-fac" className={label}>{t("Facultatea sau specializarea", "Faculty or programme")}</label>
          <input id="p-fac" value={faculty} onChange={(e) => setFaculty(e.target.value)} maxLength={LIMITS.faculty} placeholder={t("de exemplu: Drept", "for example: Law")} required className={field} />
        </div>
        <div>
          <label htmlFor="p-an" className={label}>{t("Anul sau „absolvent” (opțional)", "Year of study or “graduate” (optional)")}</label>
          <input id="p-an" value={status} onChange={(e) => setStatus(e.target.value)} maxLength={LIMITS.status} placeholder={t("de exemplu: anul 2", "for example: year 2")} className={field} />
        </div>
        <div>
          <label htmlFor="p-text" className={label}>{t("Părerea ta", "Your opinion")}</label>
          <textarea id="p-text" value={text} onChange={(e) => setText(e.target.value)} maxLength={LIMITS.textMax} rows={7} required className={`${field} py-3`} placeholder={t("De ce ai ales facultatea? Cum a fost admiterea? Ce îți place și ce e greu?", "Why did you choose this faculty? How was the admission? What do you like and what is hard?")} />
          <p className="mt-1 text-xs text-ink-soft" aria-live="polite">
            {textLen < LIMITS.textMin ? t(`Mai scrie cel puțin ${LIMITS.textMin - textLen} caractere.`, `Write at least ${LIMITS.textMin - textLen} more characters.`) : t(`${textLen} din ${LIMITS.textMax} caractere.`, `${textLen} of ${LIMITS.textMax} characters.`)}
          </p>
        </div>
        <PhotoPicker photo={photo} onChange={setPhoto} />
        {/* Hidden from people; bots fill it in and are ignored. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="p-website">Website</label>
          <input id="p-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
          <span className="text-sm text-ink">{t("Sunt de acord ca numele meu și părerea mea să fie publicate pe FindMyUni. Am cel puțin 18 ani.", "I agree that my name and my opinion are published on FindMyUni. I am at least 18 years old.")}{" "}
            <Link href="/confidentialitate" className="font-bold text-primary underline underline-offset-2" target="_blank">{t("Ce date păstrăm", "What data we keep")}</Link>
          </span>
        </label>
        <Turnstile key={robotKey} onToken={onToken} />
        {error && <p className="text-sm font-bold text-primary-dark" role="alert">{error}</p>}
        <button type="submit" disabled={!canSend} className="min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-lg font-black text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
          {state === "sending" ? t("Se trimite...", "Sending...") : t("Trimite părerea", "Send your opinion")}
        </button>
      </form>
      {askFace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setAskFace(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="p-face-title" className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 id="p-face-title" className="text-2xl font-black tracking-tight text-ink">{t("Îți arătăm și fața?", "Shall we show your face too?")}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element -- a local preview of the cropped photo */}
            {photo && <img src={photo.url} alt="" className="mx-auto mt-4 h-24 w-24 rounded-full object-cover ring-2 ring-teal" />}
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-line">
              <input type="checkbox" checked={faceOk} onChange={(e) => setFaceOk(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-primary" />
              <span className="text-sm text-ink">{t("Sunt de acord ca poza mea, în care mi se vede fața, să fie afișată pe FindMyUni lângă părerea mea. Pot cere oricând să fie ștearsă.", "I agree that my photo, which shows my face, is shown on FindMyUni next to my opinion. I can ask for it to be deleted at any time.")}</span>
            </label>
            <p className="mt-2 text-xs text-ink-soft">{faceOk ? t("Poza apare doar după ce echipa aprobă părerea.", "The photo appears only after the team approves the opinion.") : t("Dacă nu bifezi, părerea se trimite fără poză.", "If you do not tick it, your opinion is sent without the photo.")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" autoFocus onClick={() => void send(faceOk)} className="min-h-12 flex-1 rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-primary/30 hover:bg-primary-dark">
                {faceOk ? t("Trimite cu poză", "Send with photo") : t("Trimite fără poză", "Send without photo")}
              </button>
              <button type="button" onClick={() => setAskFace(false)} className="min-h-12 rounded-2xl px-4 font-bold text-ink-soft underline underline-offset-2">{t("Înapoi", "Back")}</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
