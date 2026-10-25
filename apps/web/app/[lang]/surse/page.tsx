// Data sources page: where the catalogue of universities and programmes comes from, country by country, how it was built and what its limits are, in the page language.
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { hasLang, tr } from "@/lib/i18n";
import { countryName } from "@/lib/i18n-data";
import { catalogCountries } from "@/lib/catalog";

export async function generateMetadata({ params }: PageProps<"/[lang]/surse">): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "en") {
    return {
      title: "Data sources — FindMyUni",
      description: "Where the data about universities and study programmes in FindMyUni comes from.",
    };
  }
  return {
    title: "Surse de date — FindMyUni",
    description: "De unde vin datele despre universități și programe de studii din FindMyUni.",
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

const link = "font-bold text-primary underline decoration-primary/40 underline-offset-2 hover:text-primary-dark";

export default async function SourcesPage({ params }: PageProps<"/[lang]/surse">) {
  const { lang: rawLang } = await params;
  const lang = hasLang(rawLang) ? rawLang : "ro";
  const t = tr(lang);
  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Surse de date", "Data sources")}</h1>
      <p className="mt-2 text-ink-soft">
        {t("Spunem de unde vine fiecare fel de informație, ca să o poți verifica singur.", "We say where each kind of information comes from, so you can check it yourself.")}
      </p>

      <Block title={t("Programele de licență, pe țări", "Bachelor's programmes, by country")}>
        <p>
          {t(
            "Folosim doar date oficiale sau publicate cu licență deschisă. Nu inventăm programe: unde o țară nu are astfel de date, nu apare aici.",
            "We only use official data or data published under an open licence. We do not invent programmes: a country without such data does not appear here.",
          )}
        </p>
        <ul className="mt-3 space-y-4" data-sources>
          {catalogCountries.map((c) => (
            <li key={c.cc} className="rounded-2xl bg-paper p-4 ring-1 ring-line">
              <p className="font-extrabold text-ink">
                {countryName(c.name, lang)} <span className="font-semibold text-ink-soft">· {c.source.year}</span>
              </p>
              <p className="mt-1 text-sm">
                <a href={c.source.url} target="_blank" rel="noopener noreferrer" className={link}>
                  {c.source.name} ↗
                </a>
              </p>
              <p className="mt-1 text-sm">
                {t("Licență", "Licence")}: {c.source.licence}. {t("Sursa", "Source")}: {c.source.attribution}.
              </p>
              {c.source.note && <p className="mt-1 text-sm">{c.source.note}</p>}
              {c.withDomain < c.programs && (
                <p className="mt-1 text-sm">
                  {t(
                    "Unele programe nu au putut fi legate sigur de unul din domeniile chestionarului; apar în căutare, dar nu în recomandări.",
                    "Some programmes could not be matched with certainty to one of the quiz fields; they appear in search, but not in recommendations.",
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Block>

      <Block title={t("Ce am adăugat noi", "What we added")}>
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>
            {t(
              "Legătura dintre fiecare program și unul dintre domeniile chestionarului este alegerea noastră, nu a surselor.",
              "The link between each programme and one of the quiz fields is our choice, not the sources'.",
            )}
          </li>
          <li>
            {t(
              "În România, orașul în care se țin cursurile este cel scris în document lângă program sau în numele facultății; altfel, orașul universității. La câteva facultăți care țin de un centru din alt oraș l-am completat noi.",
              "In Romania, the city where classes are held is the one written in the document next to the programme or in the faculty's name; otherwise, the university's city. For a few faculties that belong to a centre in another city, we filled it in ourselves.",
            )}
          </li>
          <li>
            {t(
              "Unde sursa dă numărul de credite, durata în ani este numărul de credite împărțit la 60.",
              "Where the source gives the number of credits, the duration in years is the number of credits divided by 60.",
            )}
          </li>
        </ul>
      </Block>

      <Block title={t("Limite", "Limits")}>
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>
            {t(
              "Datele au fost citite automat și verificate prin numărători și prin sondaj, nu rând cu rând de un om. Pot exista greșeli.",
              "The data was read automatically and checked by counts and spot checks, not line by line by a person. There may be mistakes.",
            )}
          </li>
          <li>
            {t(
              "În România, „locuri” înseamnă numărul maxim de studenți care pot fi înscriși, nu locurile scoase efectiv la admitere și nici cele de la buget.",
              "In Romania, “places” means the maximum number of students who can be enrolled, not the places actually offered at admission and not the state-funded (tuition-free) ones.",
            )}
          </li>
          <li>{t("Numele programelor din alte țări sunt în limba sursei.", "Programme names are in the language of the source.")}</li>
          <li>{t("Nu sunt incluse programele de master.", "Master's programmes are not included.")}</li>
          <li>
            {t(
              "Pentru admitere, taxe și termene, verifică întotdeauna site-ul facultății.",
              "For admission, fees and deadlines, always check the faculty's website.",
            )}
          </li>
        </ul>
      </Block>

      <Block title={t("Alte informații din aplicație", "Other information in the app")}>
        <p>
          {t(
            "Fișele universităților (descriere, admitere, costuri, plusuri și minusuri) sunt scrise de echipa FindMyUni și sunt orientative. Materiile pe ani sunt luate din câte un plan de învățământ oficial, cu link la fiecare. Părerile sunt ale studenților care le-au scris.",
            "The university sheets (description, admission, costs, pros and cons) are written by the FindMyUni team and are for guidance only. The subjects per year come from one official curriculum each, with a link to it. The opinions belong to the students who wrote them.",
          )}
        </p>
      </Block>

      <Block title={t("Fotografii", "Photos")}>
        <p>
          {t(
            "Fotografiile universităților sunt de pe Wikimedia Commons și au licențe libere (de exemplu Creative Commons sau domeniu public). Le-am ales pe cele mai potrivite (late, clare, cu clădirile universității), le-am micșorat și le-am decupat; sub fiecare fotografie scrie autorul, licența și linkul către original. Fișele facultăților folosesc fotografia universității lor.",
            "The university photos come from Wikimedia Commons and have free licences (for example Creative Commons or public domain). We picked the most suitable ones (wide, clear, showing the university's buildings), made them smaller and cropped them; under each photo you can see the author, the licence and the link to the original. Faculty sheets use the photo of their university.",
          )}
        </p>
      </Block>
    </Shell>
  );
}
