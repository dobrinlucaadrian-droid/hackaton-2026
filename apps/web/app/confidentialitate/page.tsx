// Privacy page: in plain Romanian, who is responsible, what FindMyUni stores, why, on what legal basis, for how long, who processes it, your rights and how to use them. Working draft until a lawyer checks it.
import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Confidențialitate — FindMyUni",
  description: "Ce date păstrează FindMyUni, de ce, cât timp, cine le mai primește și ce drepturi ai.",
};

// Fill in before launch: who is responsible for the data (the "operator"). Empty values are shown as "[de completat de echipă]".
const OPERATOR = {
  name: "", // the person or organisation responsible, e.g. the association or the adult who runs the site
  email: "", // the address people write to about their data
  address: "", // postal address
};
// True until a lawyer has checked this text.
const DRAFT = true;
const LAST_UPDATED = "20 octombrie 2026";

const MISSING = "[de completat de echipă]";

function Field({ value }: { value: string }) {
  return value ? <span className="font-bold text-ink">{value}</span> : <span className="font-bold text-primary-dark">{MISSING}</span>;
}

function ContactEmail() {
  return OPERATOR.email ? (
    <a href={`mailto:${OPERATOR.email}`} className="font-bold text-primary underline underline-offset-2">{OPERATOR.email}</a>
  ) : (
    <span className="font-bold text-primary-dark">{MISSING}</span>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-line">
      <h2 className="text-2xl font-black tracking-tight text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-soft">{children}</div>
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-1 pl-5 marker:text-primary">{children}</ul>;
}

function Purpose({ title, data, why, basis }: { title: string; data: React.ReactNode; why: React.ReactNode; basis: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper p-4">
      <h3 className="font-extrabold text-ink">{title}</h3>
      <p className="mt-1"><span className="font-bold text-ink">Ce date: </span>{data}</p>
      <p className="mt-1"><span className="font-bold text-ink">De ce: </span>{why}</p>
      <p className="mt-1"><span className="font-bold text-ink">Temeiul legal: </span>{basis}</p>
    </div>
  );
}

const link = "font-bold text-primary underline underline-offset-2";

export default function PrivacyPage() {
  return (
    <Shell>
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">Confidențialitate</h1>
      <p className="mt-2 text-ink-soft">Pe scurt: păstrăm cât mai puține date, nu le vindem, nu avem reclame și le poți descărca sau șterge oricând.</p>
      <p className="mt-1 text-sm text-ink-soft">Ultima actualizare: {LAST_UPDATED}.</p>
      {DRAFT && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="note">
          Versiune de lucru. Un avocat verifică acest text înainte de lansare. Unele lucruri sunt încă de completat sau de verificat și sunt marcate așa.
        </p>
      )}

      <Block title="Cine răspunde de datele tale">
        <p>Legea (Regulamentul european GDPR) numește „operator” pe cel care hotărăște ce date se strâng și de ce. Pentru FindMyUni, operatorul este:</p>
        <List>
          <li>Nume: <Field value={OPERATOR.name} /></li>
          <li>Email pentru orice întrebare despre datele tale: <ContactEmail /></li>
          <li>Adresă: <Field value={OPERATOR.address} /></li>
        </List>
      </Block>

      <Block title="Dacă nu îți faci cont">
        <p>Poți folosi tot site-ul fără cont. Cât completezi chestionarul, răspunsurile, activitățile și pozele cu diplome stau doar în fila ta de browser și dispar când o închizi. Pozele și numele activităților nu pleacă niciodată de pe dispozitivul tău.</p>
        <p>Când termini chestionarul, site-ul ne trimite automat o copie fără nume a rezultatului, pentru statistici (vezi mai jos, la „Statistici”).</p>
      </Block>

      <Block title="Ce date păstrăm, de ce și pe ce temei legal">
        <div className="space-y-3">
          <Purpose
            title="1. Contul tău"
            data={<>numele de utilizator, numele complet, adresa de email (confirmată cu un cod de 6 cifre), parola, dar doar ca o amprentă din care parola nu se poate afla (nici de noi), data la care ai confirmat emailul, datele tehnice ale conectării (când a început și până când e valabilă fiecare sesiune) și rezultatul chestionarului, dacă alegi să-l salvezi (profilul de liceu, răspunsurile, unde și în ce orașe vrei să studiezi și cele trei domenii potrivite).</>}
            why="ca să te poți conecta, să-ți păstrăm rezultatul, să-ți trimitem codul de confirmare și codul pentru o parolă nouă dacă ți-ai uitat-o."
            basis="executarea contractului dintre noi, adică serviciul pe care îl ceri când îți faci cont (GDPR, art. 6 alin. 1 lit. b)."
          />
          <Purpose
            title="2. Părerile scrise de studenți"
            data="numele, universitatea, facultatea, anul (dacă îl treci), textul părerii, data trimiterii și acordul tău pentru publicare; după verificare, și cine din echipă a aprobat sau a respins părerea și când."
            why="ca să le arătăm elevilor păreri reale despre facultăți. După ce echipa aprobă părerea, numele, facultatea, universitatea, anul și textul apar public pe site."
            basis={<>consimțământul tău, pe care îl dai bifând căsuța din formular (GDPR, art. 6 alin. 1 lit. a). Îl poți retrage oricând scriindu-ne la <ContactEmail />, iar părerea este scoasă de pe site.</>}
          />
          <Purpose
            title="3. Statistici"
            data="câte pagini se deschid în fiecare zi și care, iar la prima pagină a unei vizite țara (două litere) și site-ul de pe care ai venit (doar numele lui, de exemplu „google.com”); pentru fiecare chestionar terminat: ziua, profilul de liceu, răspunsurile, unde și în ce orașe vrei să studiezi și cele trei domenii rezultate."
            why="ca să știm dacă site-ul e folosit și cum să îmbunătățim chestionarul. Sunt date statistice, fără nume, email, cont, adresă IP sau cod care să-ți recunoască dispozitivul, și nu folosesc cookie-uri."
            basis="interesul nostru legitim de a ști cum e folosit site-ul și de a-l face mai bun (GDPR, art. 6 alin. 1 lit. f). Am ales varianta cu cele mai puține date, ca să nu te afecteze."
          />
          <Purpose
            title="4. Siguranță și limite împotriva abuzurilor"
            data="numărul de încercări recente legate de numele de utilizator sau de adresa de email (la conectare, la crearea contului și la cererea unui cod), iar la formularul de păreri rezultatul verificării anti-robot."
            why="ca nimeni să nu poată ghici parole, să nu poată trimite mii de emailuri cu coduri și ca roboții să nu umple site-ul cu păreri false."
            basis="interesul nostru legitim de a ține site-ul și conturile în siguranță (GDPR, art. 6 alin. 1 lit. f)."
          />
        </div>
        <p>Nu îți cerem școala, data nașterii, adresa sau numărul de telefon și nu strângem date despre sănătate, religie sau alte date sensibile.</p>
      </Block>

      <Block title="Cât timp păstrăm datele">
        <List>
          <li><span className="font-bold text-ink">Contul și rezultatul salvat:</span> până ștergi contul. Rezultatul îl poți șterge și separat, oricând.</li>
          <li><span className="font-bold text-ink">Sesiunea de conectare:</span> nu mai este valabilă după cel mult 30 de zile; datele ei se șterg odată cu contul.</li>
          <li><span className="font-bold text-ink">Codul de 6 cifre din email:</span> poate fi folosit doar 15 minute.</li>
          <li><span className="font-bold text-ink">Părerile:</span> cele aprobate rămân pe site până ne ceri să le scoatem. Pentru cele respinse sau neaprobate, echipa va stabili cât timp le păstrează.</li>
          <li><span className="font-bold text-ink">Statisticile:</span> acum nu se șterg automat. Echipa va stabili o perioadă după care le șterge.</li>
          <li><span className="font-bold text-ink">Numărătorile de încercări:</span> limita se golește singură în cel mult o oră, dar rândurile nu se șterg încă automat (și nici la ștergerea contului). Echipa va stabili o perioadă după care le șterge.</li>
        </List>
      </Block>

      <Block title="Cine mai primește datele">
        <p>Nu vindem și nu dăm datele nimănui pentru reclame. Folosim câteva firme care lucrează pentru noi („împuterniciți”), fiecare doar pentru rolul ei:</p>
        <List>
          <li><span className="font-bold text-ink">Convex</span> (SUA) — baza de date în care stau conturile, rezultatele salvate, părerile și statisticile;</li>
          <li><span className="font-bold text-ink">Resend</span> (SUA) — trimite emailul cu codul de confirmare sau de schimbare a parolei (primește adresa ta de email și codul);</li>
          <li><span className="font-bold text-ink">Cloudflare</span> (Turnstile) — verifică, doar la formularul de păreri, că nu ești un robot;</li>
          <li><span className="font-bold text-ink">Vercel</span> (SUA) — găzduiește site-ul.</li>
        </List>
        <p>Ca la orice site, serverele Vercel și Convex văd adresa ta IP când deschizi o pagină. Vercel ne spune doar țara (două litere); noi nu salvăm adresa IP. Cât timp o păstrează ele în jurnalele lor tehnice este încă de verificat.</p>
        <p>Părerile aprobate le poate citi oricine pe site. Am da date unei autorități doar dacă legea ne obligă.</p>
        <p className="font-bold text-ink">Date trimise în afara Uniunii Europene</p>
        <p>Aceste firme pot prelucra datele în SUA sau în alte țări din afara UE. Ca datele să fie la fel de protejate, contractele lor de prelucrare a datelor spun că folosesc:</p>
        <List>
          <li>Convex — clauzele contractuale standard aprobate de Comisia Europeană (decizia 2021/914);</li>
          <li>Resend — cadrul UE-SUA privind protecția datelor (EU-U.S. Data Privacy Framework) și clauzele contractuale standard;</li>
          <li>Cloudflare — cadrul UE-SUA privind protecția datelor și clauzele contractuale standard;</li>
          <li>Vercel — clauzele contractuale standard.</li>
        </List>
        <p>Dacă vrei o copie a acestor garanții, scrie-ne la <ContactEmail />.</p>
      </Block>

      <Block title="Drepturile tale">
        <p>Ai dreptul:</p>
        <List>
          <li><span className="font-bold text-ink">să afli ce date avem despre tine și să primești o copie</span> — dacă ai cont, deschide pagina <Link href="/cont/datele-mele" className={link}>Datele mele</Link> (din „Contul meu”): vezi tot ce păstrăm despre contul tău și poți descărca o copie;</li>
          <li><span className="font-bold text-ink">să iei datele cu tine</span> (portabilitate) — fișierul de mai sus poate fi citit și de alte programe;</li>
          <li><span className="font-bold text-ink">să corectezi datele</span> — numele îl schimbi singur din „Contul meu”; pentru restul, scrie-ne;</li>
          <li><span className="font-bold text-ink">să ștergi datele</span> — din „Contul meu” ștergi rezultatul sau tot contul (nu se poate anula); pentru o părere, scrie-ne;</li>
          <li><span className="font-bold text-ink">să ceri să nu mai folosim datele o vreme</span> (restricționare), de exemplu cât verificăm o corectură;</li>
          <li><span className="font-bold text-ink">să te opui</span> folosirii datelor pe baza interesului nostru legitim (statistici, siguranță);</li>
          <li><span className="font-bold text-ink">să îți retragi consimțământul</span> pentru o părere publicată, oricând; ce am făcut înainte rămâne legal;</li>
          <li><span className="font-bold text-ink">să faci o plângere</span> la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), pe <a href="https://www.dataprotection.ro" className={link} target="_blank" rel="noreferrer">www.dataprotection.ro</a>.</li>
        </List>
        <p>Pentru orice cerere scrie-ne la <ContactEmail />. Îți răspundem în cel mult o lună. Dacă cererea e foarte complicată, termenul se poate prelungi cu încă două luni, dar îți spunem asta în prima lună. Putem să-ți cerem ceva care să arate că ești chiar tu, ca să nu dăm datele altcuiva.</p>
      </Block>

      <Block title="Vârsta">
        <p>Poți folosi tot site-ul, inclusiv chestionarul, la orice vârstă și fără cont.</p>
        <List>
          <li><span className="font-bold text-ink">Contul</span> îl pot face doar cei care au cel puțin 16 ani. Dacă ai sub 16 ani, folosește site-ul fără cont.</li>
          <li><span className="font-bold text-ink">Părerile</span> le pot scrie doar cei care au cel puțin 18 ani.</li>
        </List>
        <p>Dacă afli că un copil sub 16 ani și-a făcut cont, scrie-ne și îl ștergem.</p>
      </Block>

      <Block title="Chestionarul nu decide în locul tău">
        <p>Chestionarul compară automat răspunsurile tale cu domeniile de studiu și îți arată cele mai potrivite trei. Este doar o recomandare: nu ia nicio decizie despre tine, nu are efecte juridice și nu te înscrie nicăieri. Tu alegi ce faci mai departe.</p>
      </Block>

      <Block title="Cum păstrăm datele în siguranță">
        <List>
          <li>tot ce trimiți circulă criptat (adresa începe cu https);</li>
          <li>parola nu o păstrăm deloc, ci doar o amprentă a ei, făcută cu o metodă greu de spart (scrypt);</li>
          <li>emailul se confirmă cu un cod care expiră după 15 minute;</li>
          <li>după prea multe încercări greșite, conectarea și trimiterea de coduri se blochează pentru o vreme;</li>
          <li>fiecare cont își vede doar propriile date; părerile în așteptare și statisticile le văd doar administratorii, iar regula asta e verificată pe server, nu doar în pagină;</li>
          <li>formularul de păreri are o verificare anti-robot și o limită pe oră;</li>
          <li>păstrăm cât mai puține date și nu cerem nimic de care nu avem nevoie.</li>
        </List>
      </Block>

      <Block title="Dacă se întâmplă ceva cu datele">
        <p>Dacă datele ajung la cine nu trebuie (de exemplu după un atac), echipa anunță ANSPDCP în cel mult 72 de ore de când a aflat, atunci când legea o cere. Dacă riscul pentru tine este mare, te anunțăm și pe tine direct, cât mai repede, și îți spunem ce poți face.</p>
      </Block>

      <Block title="Cookie-uri și date păstrate în browser">
        <p>Nu folosim cookie-uri de reclame sau de urmărire. Folosim doar ce e strict necesar ca site-ul să funcționeze:</p>
        <List>
          <li><span className="font-bold text-ink">Două cookie-uri de conectare</span>, doar cât ești conectat, ca site-ul să știe că ești tu. Paginile nu le pot citi (sunt „httpOnly”) și se șterg când te deconectezi sau când închizi browserul. În spațiul de stocare al browserului („localStorage”) stă și o copie a cheii de conectare, care se șterge la deconectare.</li>
          <li><span className="font-bold text-ink">Chestionarul în lucru</span> (răspunsurile, activitățile, pozele) stă în fila browserului („sessionStorage”) și dispare când o închizi. Tot acolo ținem minte dacă rezultatul a fost deja numărat, ca să nu-l numărăm de două ori.</li>
          <li><span className="font-bold text-ink">Rezultatul de salvat:</span> dacă apeși „Salvează în contul meu” înainte să te conectezi, rezultatul stă în browser până termini conectarea, apoi e șters de acolo.</li>
          <li><span className="font-bold text-ink">Verificarea anti-robot</span> de la formularul de păreri se încarcă de la Cloudflare doar pe pagina formularului. Cloudflare primește adresa IP și câteva date tehnice despre browser, strict necesare ca să deosebească oamenii de roboți. Dacă pune și cookie-uri tehnice este încă de verificat.</li>
        </List>
        <p>Pentru că acestea sunt strict necesare, nu îți cerem acordul pentru ele.</p>
      </Block>

      <Block title="Schimbări și contact">
        <p>Dacă schimbăm ceva important în acest text, schimbăm și data de sus și, dacă ai cont, te anunțăm.</p>
        <p>Pentru orice întrebare despre datele tale: <ContactEmail />.</p>
      </Block>
    </Shell>
  );
}
