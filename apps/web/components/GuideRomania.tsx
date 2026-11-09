// The English guide "How to apply to a university in Romania": title, intro, sections, official source links and the date it was checked, read from data/en/guide-romania.json.
import guide from "@/data/en/guide-romania.json";

type Section = { id: string; heading: string; paragraphs: string[]; bullets?: string[] };
type Guide = { title: string; intro: string; sections: Section[]; links: { label: string; url: string }[]; checked: string };

export const romaniaGuide: Guide = guide as Guide;

const linkClass = "inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

export function GuideRomania() {
  const g = romaniaGuide;
  return (
    <div className="mx-auto max-w-3xl">
      <header className="rise mt-2">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight text-ink sm:text-5xl">{g.title}</h1>
        <svg aria-hidden viewBox="0 0 300 16" className="mt-2 block h-4 w-56 sm:w-72"><path d="M3 10c36-9 62 7 98-2s62 7 98-2 62 7 98-4" fill="none" stroke="#c8962e" strokeWidth="5" strokeLinecap="round" /></svg>
        <p className="mt-4 text-lg text-ink">{g.intro}</p>
      </header>

      {g.sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-4 rounded-3xl bg-card p-5 drawn sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{s.heading}</h2>
          <div className="mt-2 space-y-2 text-ink-soft">
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.bullets && s.bullets.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 marker:text-primary">
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {g.links.length > 0 && (
        <section className="mt-4 rounded-3xl bg-card p-5 drawn sm:p-6">
          <h2 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">Official sources</h2>
          <ul className="mt-2 flex flex-col">
            {g.links.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">
        Last checked: {g.checked}
      </p>
    </div>
  );
}
