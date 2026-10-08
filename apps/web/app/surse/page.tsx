// Data sources page: where the catalogue of universities and programmes comes from, how it was built and what its limits are.
import type { Metadata } from "next";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Surse de date — UniPath",
  description: "De unde vin datele despre universități și programe de studii din UniPath.",
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
      <p className="mt-2 text-ink-soft">Spunem de unde vine fiecare fel de informație, ca să o poți verifica singur.</p>

      <Block title="Programele de licență din România">
        <p>
          Lista facultăților și a programelor de licență vine din Hotărârea Guvernului nr. 606/2026, publicată în Monitorul Oficial nr. 679 bis din 17 august 2026, care stabilește programele acreditate sau autorizate provizoriu și numărul maxim de studenți pentru anul universitar 2026–2027.
        </p>
        <p>
          <a href="https://edu.ro/sites/default/files/fisiere%20articole/HG_606_2026.pdf" target="_blank" rel="noopener noreferrer" className={link}>
            Vezi documentul oficial pe edu.ro ↗
          </a>
        </p>
        <p>Din document am luat, pentru fiecare program: universitatea, facultatea, domeniul, numele, limba de predare, forma de învățământ, numărul de credite, dacă este acreditat sau autorizat provizoriu și numărul maxim de studenți.</p>
      </Block>

      <Block title="Ce am adăugat noi">
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>Legătura dintre fiecare program și unul dintre cele 40 de domenii ale chestionarului este alegerea noastră, nu a documentului.</li>
          <li>Orașul în care se țin cursurile este cel scris în document lângă program sau în numele facultății; altfel, orașul universității. La câteva facultăți care țin de un centru din alt oraș l-am completat noi.</li>
          <li>Durata în ani este numărul de credite împărțit la 60.</li>
        </ul>
      </Block>

      <Block title="Limite">
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>Documentul a fost citit automat și verificat prin numărători și prin sondaj, nu rând cu rând de un om. Pot exista greșeli de transcriere.</li>
          <li>„Locuri” înseamnă numărul maxim de studenți care pot fi înscriși, nu locurile scoase efectiv la admitere și nici cele de la buget.</li>
          <li>Nu sunt incluse programele de master și programele care intră în lichidare.</li>
          <li>Pentru admitere, taxe și termene, verifică întotdeauna site-ul facultății.</li>
        </ul>
      </Block>

      <Block title="Alte informații din aplicație">
        <p>Fișele universităților (descriere, admitere, costuri, plusuri și minusuri) sunt scrise de echipa UniPath și sunt orientative. Materiile pe ani sunt luate din câte un plan de învățământ oficial, cu link la fiecare. Părerile sunt ale studenților care le-au scris.</p>
      </Block>
    </Shell>
  );
}
