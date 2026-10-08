"use client";
// Search over the bachelor programmes of the official list: free text plus study domain and city; the state lives in the URL so links and Back work.
import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { ProgramRow } from "./ProgramRow";
import { SearchBox } from "./SearchBox";

const selectClass = "mt-1 min-h-11 w-full rounded-xl border-2 border-transparent bg-paper px-3 text-ink ring-1 ring-line focus:border-primary focus:outline-none";

export function ProgramSearch({ domains, cities, sheetIds }: { domains: { id: string; name: string }[]; cities: string[]; sheetIds: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const domainId = domains.some((d) => d.id === params.get("domeniu")) ? params.get("domeniu")! : "";
  const city = cities.includes(params.get("oras") ?? "") ? params.get("oras")! : "";

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    router.push(s ? `/programe?${s}` : "/programe", { scroll: false });
  }

  const searching = q.length >= 2;
  const found = useQuery(api.catalog.searchPrograms, searching ? { q, country: "RO", ...(city ? { city } : {}), ...(domainId ? { domainId } : {}) } : "skip");
  const listed = useQuery(api.catalog.programsFor, !searching && domainId ? { domainId, country: "RO", ...(city ? { city } : {}) } : "skip");
  const rows = searching ? found : domainId ? listed : [];
  const idle = !searching && !domainId;

  return (
    <div>
      <SearchBox key={q} initial={q} id="cauta-program" onSearch={(v) => set("q", v)} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="p-domeniu" className="text-sm font-extrabold uppercase tracking-wide text-primary">Domeniu</label>
          <select id="p-domeniu" value={domainId} onChange={(e) => set("domeniu", e.target.value)} className={selectClass}>
            <option value="">Oricare</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-oras" className="text-sm font-extrabold uppercase tracking-wide text-primary">Oraș</label>
          <select id="p-oras" value={city} onChange={(e) => set("oras", e.target.value)} className={selectClass}>
            <option value="">Oricare</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {idle ? (
          <p className="rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">Scrie ce cauți (de exemplu „informatică” sau „asistență medicală”) sau alege un domeniu.</p>
        ) : rows === undefined ? (
          <p className="text-ink-soft">Se caută...</p>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-ink-soft ring-1 ring-line">Nu am găsit programe. Încearcă alt cuvânt, alt oraș sau scoate filtrele.</p>
        ) : (
          <>
            <h2 className="text-2xl font-black tracking-tight text-ink">
              {rows.length}
              {rows.length >= (searching ? 40 : 200) ? " sau mai multe" : ""} {rows.length === 1 ? "program" : "programe"}
              {city ? ` în ${city}` : ""}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 [&>li]:bg-card [&>li]:ring-1 [&>li]:ring-line" data-program-results>
              {rows.map((p) => (
                <ProgramRow key={p.key} p={p} where sheetIds={sheetIds} />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
