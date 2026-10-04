"use client";
// Search and filters for universities; all state lives in the URL query so links and the Back button work.
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, domains } from "@/lib/data";
import type { AdmissionType, Budget, CertificateId, Filters, Prestige, WorldUniversity } from "@/lib/types";
import { ADMISSION_LABEL, BUDGET_LABEL, CERTIFICATE_LABEL, PRESTIGE_LABEL, countries, filterUniversities, searchUniversities, searchWorld } from "@/lib/universities";
import { SearchBox } from "./SearchBox";
import { UniversityCard } from "./UniversityCard";

const NOTE = "Informațiile sunt orientative. Verifică mereu site-ul universității.";
const PRESTIGE_CHOICES: Prestige[] = ["ivy", "top", "international"];
const PRESTIGE_CHIP: Record<string, string> = { ivy: "Ivy League", top: "De top mondial", international: "Cunoscută internațional" };

let worldCache: WorldUniversity[] | null = null;
/** Loads the world list once; resolves to null when it cannot be loaded (the next search retries). */
async function loadWorld(): Promise<WorldUniversity[] | null> {
  if (worldCache) return worldCache;
  try {
    const res = await fetch("/world-universities.json");
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return null;
    worldCache = data as WorldUniversity[];
    return worldCache;
  } catch {
    return null;
  }
}

function pick<T extends string>(value: string | null, allowed: Record<string, unknown>): T | undefined {
  return value && value in allowed ? (value as T) : undefined;
}

function readFilters(p: URLSearchParams): Filters {
  const f: Filters = {};
  const tara = p.get("tara");
  if (tara) f.country = tara;
  const regiune = p.get("regiune");
  if (regiune === "ro" || regiune === "abroad") f.region = regiune;
  const domeniu = p.get("domeniu");
  if (domeniu) f.domainId = domeniu;
  const buget = pick<Budget>(p.get("buget"), BUDGET_LABEL);
  if (buget) f.budget = buget;
  const prestigiu = pick<Prestige>(p.get("prestigiu"), PRESTIGE_LABEL);
  if (prestigiu && prestigiu !== "national") f.prestige = prestigiu;
  const admitere = pick<AdmissionType>(p.get("admitere"), ADMISSION_LABEL);
  if (admitere) f.admissionType = admitere;
  if (p.get("burse") === "1") f.scholarships = true;
  if (p.get("camin") === "1") f.dorms = true;
  const fara = pick<CertificateId>(p.get("fara"), CERTIFICATE_LABEL);
  if (fara) f.withoutCertificate = fara;
  return f;
}

const PARAM_OF: Record<keyof Filters, string> = {
  country: "tara",
  region: "regiune",
  domainId: "domeniu",
  budget: "buget",
  prestige: "prestigiu",
  admissionType: "admitere",
  scholarships: "burse",
  dorms: "camin",
  withoutCertificate: "fara",
};

const selectClass = "mt-1 min-h-11 w-full rounded-xl border-2 border-transparent bg-paper px-3 text-ink ring-1 ring-line focus:border-primary focus:outline-none";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm font-bold transition ${
        on ? "bg-primary text-white" : "bg-paper text-ink-soft ring-1 ring-line hover:ring-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-extrabold uppercase tracking-wide text-primary">{title}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function UniversitySearch() {
  const router = useRouter();
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const filters = useMemo(() => readFilters(params), [params]);
  const activeCount = Object.keys(filters).length;
  const [panel, setPanel] = useState(false);
  const [world, setWorld] = useState<{ q: string; items: WorldUniversity[]; failed: boolean } | null>(null);

  function go(next: URLSearchParams) {
    const s = next.toString();
    router.push(s ? `/universitati?${s}` : "/universitati", { scroll: false });
  }
  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    go(next);
  }
  function toggle<K extends keyof Filters>(key: K, value: string, current: unknown) {
    setParam(PARAM_OF[key], current === value ? undefined : value);
  }
  function clearFilters() {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    go(next);
  }

  const results = useMemo(() => {
    if (q) {
      const found = searchUniversities(q, 100);
      if (activeCount === 0) return found;
      const ok = new Set(filterUniversities(filters, 10000).map((u) => u.id));
      return found.filter((u) => ok.has(u.id));
    }
    return filterUniversities(filters, 10);
  }, [q, filters, activeCount]);

  const wantWorld = q !== "" && activeCount === 0;
  useEffect(() => {
    if (!wantWorld) return;
    let cancelled = false;
    loadWorld().then((list) => {
      if (!cancelled) setWorld({ q, items: list ? searchWorld(list, q, 20) : [], failed: list === null });
    });
    return () => {
      cancelled = true;
    };
  }, [wantWorld, q]);
  const worldReady = wantWorld && world?.q === q;
  const worldFailed = worldReady && world?.failed === true;
  const worldItems = worldReady && world ? world.items : [];
  const known = new Set(results.map((u) => u.name.toLowerCase()));
  // The world list is third-party data: only plain web links are shown.
  const worldShown = worldItems.filter((w) => /^https?:\/\//i.test(w.w) && !known.has(w.n.toLowerCase()));

  const grouped = categories
    .map((c) => ({ c, ds: c.domainIds.map((id) => domains.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d) }))
    .filter((g) => g.ds.length > 0);
  const inCat = new Set(grouped.flatMap((g) => g.ds.map((d) => d.id)));
  const rest = domains.filter((d) => !inCat.has(d.id));

  const countryList = countries();
  const hiddenCount = (["budget", "prestige", "admissionType", "scholarships", "dorms", "withoutCertificate"] as const).filter((k) => filters[k] !== undefined).length;
  const chips: { key: keyof Filters; label: string }[] = [];
  if (filters.region) chips.push({ key: "region", label: filters.region === "ro" ? "În România" : "În străinătate" });
  if (filters.country) chips.push({ key: "country", label: filters.country });
  if (filters.domainId) chips.push({ key: "domainId", label: domains.find((d) => d.id === filters.domainId)?.name ?? filters.domainId });
  if (filters.budget) chips.push({ key: "budget", label: BUDGET_LABEL[filters.budget] });
  if (filters.prestige) chips.push({ key: "prestige", label: PRESTIGE_CHIP[filters.prestige] });
  if (filters.admissionType) chips.push({ key: "admissionType", label: ADMISSION_LABEL[filters.admissionType] });
  if (filters.scholarships) chips.push({ key: "scholarships", label: "Are burse" });
  if (filters.dorms) chips.push({ key: "dorms", label: "Are cămin" });
  if (filters.withoutCertificate) chips.push({ key: "withoutCertificate", label: `Fără: ${CERTIFICATE_LABEL[filters.withoutCertificate]}` });

  return (
    <div>
      <SearchBox key={q} initial={q} id="cauta-uni" onSearch={(v) => setParam("q", v || undefined)} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="f-tara" className="text-sm font-extrabold uppercase tracking-wide text-primary">Țara</label>
          <select id="f-tara" value={filters.country ?? ""} onChange={(e) => setParam("tara", e.target.value || undefined)} className={selectClass}>
            <option value="">Oricare</option>
            {countryList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip on={filters.region === "ro"} onClick={() => toggle("region", "ro", filters.region)}>În România</Chip>
            <Chip on={filters.region === "abroad"} onClick={() => toggle("region", "abroad", filters.region)}>În străinătate</Chip>
          </div>
        </div>
        <div>
          <label htmlFor="f-domeniu" className="text-sm font-extrabold uppercase tracking-wide text-primary">Domeniu</label>
          <select id="f-domeniu" value={filters.domainId ?? ""} onChange={(e) => setParam("domeniu", e.target.value || undefined)} className={selectClass}>
            <option value="">Oricare</option>
            {grouped.map(({ c, ds }) => (
              <optgroup key={c.id} label={c.name}>
                {ds.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </optgroup>
            ))}
            {rest.length > 0 && (
              <optgroup label="Alte domenii">
                {rest.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-expanded={panel}
          aria-controls="panou-filtre"
          onClick={() => setPanel(!panel)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-primary px-5 font-bold text-primary transition hover:bg-primary-tint"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Mai multe filtre
          {hiddenCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{hiddenCount}</span>}
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={clearFilters} className="min-h-11 rounded-full px-3 font-bold text-ink-soft underline underline-offset-2 hover:text-primary">
            Șterge filtrele
          </button>
        )}
      </div>

      {panel && <div aria-hidden onClick={() => setPanel(false)} className="fixed inset-0 z-30 bg-ink/40 sm:hidden" />}
      {panel && (
        <section
          id="panou-filtre"
          aria-label="Filtre"
          className="slide-in z-40 mt-3 space-y-5 bg-card p-5 shadow-sm ring-1 ring-line max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:mt-0 max-sm:max-h-[88vh] max-sm:overflow-y-auto max-sm:rounded-t-3xl sm:rounded-3xl"
        >
          <div className="flex items-center justify-between sm:hidden">
            <h2 className="text-xl font-black text-ink">Mai multe filtre</h2>
            <button type="button" onClick={() => setPanel(false)} className="min-h-11 rounded-full bg-primary px-5 font-bold text-white">
              Gata
            </button>
          </div>

          <Group title="Buget (cel mult)">
            {(Object.keys(BUDGET_LABEL) as Budget[]).map((b) => (
              <Chip key={b} on={filters.budget === b} onClick={() => toggle("budget", b, filters.budget)}>
                {BUDGET_LABEL[b]}
              </Chip>
            ))}
          </Group>

          <Group title="Prestigiu">
            <Chip on={!filters.prestige} onClick={() => setParam("prestigiu", undefined)}>Oricare</Chip>
            {PRESTIGE_CHOICES.map((p) => (
              <Chip key={p} on={filters.prestige === p} onClick={() => toggle("prestige", p, filters.prestige)}>
                {PRESTIGE_CHIP[p]}
              </Chip>
            ))}
          </Group>

          <Group title="Modalitate de admitere">
            {(Object.keys(ADMISSION_LABEL) as AdmissionType[]).map((a) => (
              <Chip key={a} on={filters.admissionType === a} onClick={() => toggle("admissionType", a, filters.admissionType)}>
                {ADMISSION_LABEL[a]}
              </Chip>
            ))}
          </Group>

          <div className="flex flex-wrap gap-2">
            <Chip on={!!filters.scholarships} onClick={() => setParam("burse", filters.scholarships ? undefined : "1")}>Are burse</Chip>
            <Chip on={!!filters.dorms} onClick={() => setParam("camin", filters.dorms ? undefined : "1")}>Are cămin</Chip>
          </div>

          <div>
            <label htmlFor="f-fara" className="text-sm font-extrabold uppercase tracking-wide text-primary">Fără acest certificat</label>
            <select id="f-fara" value={filters.withoutCertificate ?? ""} onChange={(e) => setParam("fara", e.target.value || undefined)} className={selectClass}>
              <option value="">Oricare</option>
              {(Object.keys(CERTIFICATE_LABEL) as CertificateId[]).map((c) => (
                <option key={c} value={c}>{CERTIFICATE_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <button type="button" onClick={clearFilters} disabled={activeCount === 0} className="min-h-11 rounded-full border-2 border-primary px-5 font-bold text-primary hover:bg-primary-tint disabled:cursor-not-allowed disabled:opacity-40">
            Șterge filtrele
          </button>
        </section>
      )}

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filtre active">
          {chips.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => setParam(PARAM_OF[c.key], undefined)}
                aria-label={`Scoate filtrul ${c.label}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-tint px-4 text-sm font-bold text-primary-dark transition hover:bg-primary hover:text-white"
              >
                {c.label}
                <span aria-hidden>✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 rounded-2xl bg-primary-tint p-3 text-sm text-primary-dark" role="note">{NOTE}</p>

      <h2 className="mt-6 text-2xl font-black tracking-tight text-ink" aria-live="polite">
        {q ? `Rezultate pentru „${q}”` : "Top 10 universități pentru tine"}
      </h2>

      {results.length === 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-line" role="status">
          <p className="text-4xl" aria-hidden>🔎</p>
          <p className="mt-2 text-lg font-black text-ink">Nu am găsit nicio universitate.</p>
          <p className="mt-1 text-ink-soft">
            {activeCount > 0 ? "Încearcă să scoți unele filtre sau schimbă ce cauți." : "Încearcă alt cuvânt, de exemplu un oraș sau o țară."}
          </p>
          {activeCount > 0 && (
            <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-2xl bg-primary px-6 font-bold text-white hover:bg-primary-dark">
              Șterge filtrele
            </button>
          )}
        </div>
      ) : (
        <ol className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map((u, i) => (
            <li key={u.id}>
              <UniversityCard u={u} rank={q ? undefined : i + 1} domainId={filters.domainId} />
            </li>
          ))}
        </ol>
      )}

      {q && (
        <details className="group mt-10 rounded-3xl bg-card shadow-sm ring-1 ring-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
            <h2 id="alte-uni" className="text-xl font-black tracking-tight text-ink">
              Alte universități din lume
              {activeCount === 0 && worldReady && !worldFailed ? ` (${worldShown.length})` : ""}
            </h2>
            <span aria-hidden className="text-primary transition-transform group-open:rotate-180">▾</span>
          </summary>
          <div className="px-5 pb-5">
          {activeCount > 0 ? (
            <p className="text-ink-soft">Lista de mai jos nu poate fi filtrată. Șterge filtrele ca să o vezi.</p>
          ) : !worldReady ? (
            <p className="mt-2 text-ink-soft">Se caută în lista universităților din lume…</p>
          ) : worldFailed ? (
            <p className="mt-2 text-ink-soft">Lista completă a universităților din lume nu s-a putut încărca. Încearcă din nou peste puțin timp.</p>
          ) : worldShown.length === 0 ? (
            <p className="mt-2 text-ink-soft">Nu am găsit alte universități pentru această căutare.</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-soft">Pentru acestea nu avem încă o fișă completă. Verifică direct pe site-ul lor.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {worldShown.map((w) => (
                  <li key={`${w.n}-${w.w}`} className="rounded-xl bg-card px-4 py-3 ring-1 ring-line">
                    <p className="font-bold text-ink">{w.n}</p>
                    <p className="text-sm text-ink-soft">{w.c}</p>
                    <a href={w.w} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-bold text-primary underline decoration-primary/40 underline-offset-2">
                      Site-ul universității ↗
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          </div>
        </details>
      )}
    </div>
  );
}
