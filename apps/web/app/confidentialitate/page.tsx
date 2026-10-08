// Privacy page: in plain Romanian, what UniPath stores, why, who processes it and how to delete it. Working draft until a legal check.
import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Confidențialitate — UniPath",
  description: "Ce date păstrează UniPath, de ce și cum le poți șterge.",
};

// Set before launch: the address people can write to about their data. Empty = the page says it is coming.
const CONTACT_EMAIL = "";
// True until an adult who knows the legal side has checked this text.
const DRAFT = true;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Confidențialitate</h1>
      <p className="mt-2 text-ink-soft">Pe scurt: păstrăm cât mai puține date, nu le vindem și le poți șterge oricând.</p>
      {DRAFT && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="note">
          Versiune de lucru. Textul urmează să fie verificat din punct de vedere juridic înainte de lansare.
        </p>
      )}

      <Block title="Dacă nu îți faci cont">
        <p>Poți folosi tot site-ul fără cont. Răspunsurile la chestionar și pozele cu diplome pe care le adaugi rămân pe dispozitivul tău și dispar când închizi pagina. Nu ajung la noi.</p>
      </Block>

      <Block title="Dacă îți faci cont">
        <p>Păstrăm doar:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>numele tău complet, așa cum îl scrii la conectare;</li>
          <li>adresa ta de email, ca să te poți conecta;</li>
          <li>rezultatul chestionarului pe care alegi să-l salvezi: profilul de liceu, răspunsurile, unde vrei să studiezi și cele trei domenii potrivite;</li>
          <li>datele tehnice ale conectării (când te-ai conectat și până când e valabilă sesiunea).</li>
        </ul>
        <p>Nu îți cerem școala, vârsta, adresa sau numărul de telefon. Numele îl poți schimba oricând din „Contul meu”. Nu folosim parole: te conectezi cu un link primit pe email sau cu Google, dacă alegi asta.</p>
        <p>Dacă ești minor, vorbește cu un părinte sau cu tutorele tău înainte să îți faci cont.</p>
      </Block>

      <Block title="Dacă scrii o părere ca student">
        <p>Păstrăm ce scrii în formular: numele, universitatea, facultatea, anul (dacă îl treci) și textul. După ce echipa aprobă părerea, acestea apar public pe site. Formularul este pentru persoane de cel puțin 18 ani.</p>
        <p>Dacă vrei ca părerea ta să fie scoasă sau corectată, scrie-ne și o facem.</p>
      </Block>

      <Block title="Cum ștergi datele">
        <p>
          Din pagina <Link href="/cont" className="font-bold text-primary underline underline-offset-2">Contul meu</Link> poți șterge rezultatul salvat sau tot contul. Ștergerea contului scoate numele, adresa de email, rezultatul și datele de conectare și nu se poate anula.
        </p>
      </Block>

      <Block title="Cine ne ajută să ținem site-ul">
        <p>Folosim câteva servicii, fiecare doar pentru rolul lui:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li><span className="font-bold text-ink">Convex</span> — baza de date în care stau conturile, rezultatele salvate și părerile;</li>
          <li><span className="font-bold text-ink">Resend</span> — trimite emailul cu linkul de conectare;</li>
          <li><span className="font-bold text-ink">Cloudflare Turnstile</span> — verifică, la formularul de păreri, că nu e un robot;</li>
          <li><span className="font-bold text-ink">Vercel</span> — găzduiește site-ul;</li>
          <li><span className="font-bold text-ink">Google</span> — doar dacă alegi „Continuă cu Google”.</li>
        </ul>
        <p>Nu avem reclame și nu folosim unelte care te urmăresc de pe un site pe altul.</p>
      </Block>

      <Block title="Statistici anonime">
        <p>Ca să știm dacă site-ul e folosit și ce să îmbunătățim, numărăm:</p>
        <ul className="list-disc space-y-1 pl-5 marker:text-primary">
          <li>câte pagini sunt deschise în fiecare zi, din ce țară și de pe ce site a venit vizita (de exemplu „google.com”);</li>
          <li>fiecare chestionar terminat: profilul de liceu, răspunsurile, unde vrei să studiezi și cele trei domenii rezultate.</li>
        </ul>
        <p>Aceste numărători nu conțin numele tău, adresa de email, adresa IP sau vreun cod care să te recunoască și nu folosesc cookie-uri. Nu pot fi legate de tine sau de contul tău. Pozele și numele activităților din chestionar nu pleacă de pe dispozitivul tău.</p>
      </Block>

      <Block title="Cookie-uri și date păstrate în browser">
        <p>Când ești conectat, site-ul păstrează în browser un cookie de sesiune, ca să te recunoască. Fără el nu ai putea rămâne conectat. Verificarea anti-robot de la formularul de păreri poate folosi propriile cookie-uri tehnice.</p>
        <p>Dacă apeși „Salvează în contul meu” înainte să te conectezi, rezultatul stă pe dispozitivul tău până termini conectarea, apoi e șters de acolo.</p>
      </Block>

      <Block title="Contact">
        {CONTACT_EMAIL ? (
          <p>
            Pentru orice întrebare despre datele tale, scrie-ne la <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold text-primary underline underline-offset-2">{CONTACT_EMAIL}</a>.
          </p>
        ) : (
          <p>Adresa de contact pentru întrebări despre datele tale va fi adăugată aici înainte de lansare.</p>
        )}
      </Block>
    </Shell>
  );
}
