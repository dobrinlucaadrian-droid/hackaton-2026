// Data sources page: where the catalogue of universities and programmes comes from, country by country, how it was built and what its limits are.
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { catalogCountries } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Surse de date — FindMyUni",
  description: "De unde vin datele despre universități și programe de studii din FindMyUni.",
};

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

const link = "font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

export default function SourcesPage() {
  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Surse de date</h1>
      <p className="mt-2 text-ink-soft">
        Spunem de unde vine fiecare fel de informație, ca să o poți verifica singur.
      </p>

      <Block title="Programele de licență, pe țări">
        <p>Folosim doar date oficiale sau publicate cu licență deschisă. Nu inventăm programe: unde o țară nu are astfel de date, nu apare aici.</p>
        <ul className="mt-3 space-y-4" data-sources>
          {catalogCountries.map((c) => (
            <li key={c.cc} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
              <p className="font-extrabold text-ink">
                {c.name} <span className="font-semibold text-ink-soft">· {c.source.year}</span>
              </p>
              <p className="mt-1 text-sm">
                <a href={c.source.url} target="_blank" rel="noopener noreferrer" className={link}>
                  {c.source.name} ↗
                </a>
              </p>
              <p className="mt-1 text-sm">Licență: {c.source.licence}. Sursa: {c.source.attribution}.</p>
              {c.source.note && <p className="mt-1 text-sm">{c.source.note}</p>}
              {c.withDomain < c.programs && (
                <p className="mt-1 text-sm">Unele programe nu au putut fi legate sigur de unul din domeniile chestionarului; apar în căutare, dar nu în recomandări.</p>
              )}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Ce am adăugat noi">
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>Legătura dintre fiecare program și unul dintre domeniile chestionarului este alegerea noastră, nu a surselor.</li>
          <li>În România, orașul în care se țin cursurile este cel scris în document lângă program sau în numele facultății; altfel, orașul universității. La câteva facultăți care țin de un centru din alt oraș l-am completat noi.</li>
          <li>Unde sursa dă numărul de credite, durata în ani este numărul de credite împărțit la 60.</li>
        </ul>
      </Block>

      <Block title="Limite">
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>Datele au fost citite automat și verificate prin numărători și prin sondaj, nu rând cu rând de un om. Pot exista greșeli.</li>
          <li>În România, „locuri” înseamnă numărul maxim de studenți care pot fi înscriși, nu locurile scoase efectiv la admitere și nici cele de la buget.</li>
          <li>Numele programelor din alte țări sunt în limba sursei.</li>
          <li>Nu sunt incluse programele de master.</li>
          <li>Pentru admitere, taxe și termene, verifică întotdeauna site-ul facultății.</li>
        </ul>
      </Block>

      <Block title="Alte informații din aplicație">
        <p>Fișele universităților (descriere, admitere, costuri, plusuri și minusuri) sunt scrise de echipa FindMyUni și sunt orientative. Materiile pe ani sunt luate din câte un plan de învățământ oficial, cu link la fiecare. Părerile sunt ale studenților care le-au scris.</p>
      </Block>

      <Block title="Fotografii">
        <p>Fotografiile universităților sunt de pe Wikimedia Commons și au licențe libere (de exemplu Creative Commons sau domeniu public). Le-am ales pe cele mai potrivite (late, clare, cu clădirile universității), le-am micșorat și le-am decupat; sub fiecare fotografie scrie autorul, licența și linkul către original. Fișele facultăților folosesc fotografia universității lor.</p>
      </Block>
    </Shell>
  );
}
