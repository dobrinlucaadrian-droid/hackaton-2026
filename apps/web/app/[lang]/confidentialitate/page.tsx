// Privacy page: in plain language (Romanian, with an English translation), who is responsible, what FindMyUni stores, why, on what legal basis, for how long, who processes it, your rights and how to use them. Working draft until a lawyer checks it.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/LocalLink";
import { Shell } from "@/components/Shell";
import { hasLang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialitate">): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "en") {
    return {
      title: "Privacy — FindMyUni",
      description: "What data FindMyUni keeps, why, for how long, who else receives it and what rights you have.",
    };
  }
  return {
    title: "Confidențialitate — FindMyUni",
    description: "Ce date păstrează FindMyUni, de ce, cât timp, cine le mai primește și ce drepturi ai.",
  };
}

// Fill in before launch: who is responsible for the data (the "operator"). Empty values are shown as "[de completat de echipă]".
const OPERATOR = {
  name: "Dobrin Matei", // the person or organisation responsible, e.g. the association or the adult who runs the site
  email: "findmyuni.ro@gmail.com", // the address people write to about their data
  address: "", // postal address; not shown while empty (the team decided 2026-10-23: name and email for now)
};
// True until a lawyer has checked this text.
const DRAFT = true;

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

function Block({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
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

function Purpose({ title, data, why, basis, labels }: { title: React.ReactNode; data: React.ReactNode; why: React.ReactNode; basis: React.ReactNode; labels: [string, string, string] }) {
  return (
    <div className="rounded-2xl bg-paper p-4">
      <h3 className="font-extrabold text-ink">{title}</h3>
      <p className="mt-1"><span className="font-bold text-ink">{labels[0]}: </span>{data}</p>
      <p className="mt-1"><span className="font-bold text-ink">{labels[1]}: </span>{why}</p>
      <p className="mt-1"><span className="font-bold text-ink">{labels[2]}: </span>{basis}</p>
    </div>
  );
}

const link = "font-bold text-primary underline underline-offset-2";

export default async function PrivacyPage({ params }: PageProps<"/[lang]/confidentialitate">) {
  const { lang: rawLang } = await params;
  const lang = hasLang(rawLang) ? rawLang : "ro";
  const en = lang === "en";
  const t = (ro: ReactNode, enText: ReactNode): ReactNode => (en ? enText : ro);
  const LAST_UPDATED = en ? "30 October 2026" : "30 octombrie 2026";

  return (
    <Shell>
      {en && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="note">
          This is an English translation for convenience. The Romanian version is the one that applies.
        </p>
      )}
      <h1 className="mt-4 text-4xl font-black tracking-tighter text-ink">{t("Confidențialitate", "Privacy")}</h1>
      <p className="mt-2 text-ink-soft">
        {t(
          "Pe scurt: păstrăm cât mai puține date, nu le vindem, nu avem reclame și le poți descărca sau șterge oricând.",
          "In short: we keep as little data as possible, we do not sell it, we have no ads, and you can download or delete it at any time.",
        )}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{t("Ultima actualizare", "Last updated")}: {LAST_UPDATED}.</p>
      {DRAFT && (
        <p className="mt-4 rounded-2xl bg-primary-tint p-4 text-sm font-bold text-primary-dark" role="note">
          {t(
            "Versiune de lucru. Un avocat verifică acest text înainte de lansare. Unele lucruri sunt încă de completat sau de verificat și sunt marcate așa.",
            "Working version. A lawyer will check this text before launch. Some things are still to be filled in or checked and are marked as such.",
          )}
        </p>
      )}

      <Block title={t("Cine răspunde de datele tale", "Who is responsible for your data")}>
        <p>
          {t(
            "Legea (Regulamentul european GDPR) numește „operator” pe cel care hotărăște ce date se strâng și de ce. Pentru FindMyUni, operatorul este:",
            "The law (the European GDPR) calls the “controller” the party that decides what data is collected and why. For FindMyUni, the controller is:",
          )}
        </p>
        <List>
          <li>{t("Nume", "Name")}: <Field value={OPERATOR.name} /></li>
          <li>{t("Email pentru orice întrebare despre datele tale", "Email for any question about your data")}: <ContactEmail /></li>
          {OPERATOR.address && <li>{t("Adresă", "Address")}: <Field value={OPERATOR.address} /></li>}
        </List>
      </Block>

      <Block title={t("Dacă nu îți faci cont", "If you do not make an account")}>
        <p>
          {t(
            "Poți folosi tot site-ul fără cont. Cât completezi chestionarul, răspunsurile, activitățile și pozele cu diplome stau doar în fila ta de browser și dispar când o închizi. Pozele și numele activităților nu pleacă niciodată de pe dispozitivul tău.",
            "You can use the whole site without an account. While you fill in the quiz, your answers, activities and photos of diplomas stay only in your browser tab and disappear when you close it. The photos and the names of the activities never leave your device.",
          )}
        </p>
        <p>
          {t(
            "Când termini chestionarul, site-ul ne trimite automat o copie fără nume a rezultatului, pentru statistici (vezi mai jos, la „Statistici”).",
            "When you finish the quiz, the site automatically sends us a copy of the result without your name, for statistics (see “Statistics” below).",
          )}
        </p>
      </Block>

      <Block title={t("Ce date păstrăm, de ce și pe ce temei legal", "What data we keep, why and on what legal basis")}>
        <div className="space-y-3">
          <Purpose
            labels={en ? ["What data", "Why", "Legal basis"] : ["Ce date", "De ce", "Temeiul legal"]}
            title={t("1. Contul tău", "1. Your account")}
            data={t(
              <>numele de utilizator, numele complet, adresa de email (confirmată cu un cod de 6 cifre), parola, dar doar ca o amprentă din care parola nu se poate afla (nici de noi), data la care ai confirmat emailul, datele tehnice ale conectării (când a început și până când e valabilă fiecare sesiune) și rezultatul chestionarului, dacă alegi să-l salvezi (profilul de liceu, răspunsurile, unde și în ce orașe vrei să studiezi și cele trei domenii potrivite) și universitățile pe care le pui la favorite (numele, orașul și țara lor și data).</>,
              <>your username, full name, email address (confirmed with a 6-digit code), your password, but only as a fingerprint from which the password cannot be found out (not even by us), the date you confirmed your email, the technical details of signing in (when each session started and until when it is valid), and the quiz result if you choose to save it (your high-school profile, your answers, where and in which cities you want to study, and the three matching fields) and the universities you add to your favourites (their name, city and country, and the date).</>,
            )}
            why={t(
              "ca să te poți conecta, să-ți păstrăm rezultatul și universitățile favorite, să-ți trimitem codul de confirmare și codul pentru o parolă nouă dacă ți-ai uitat-o și să te anunțăm pe email când parola îți este schimbată sau contul șters.",
              "so that you can sign in, so that we can keep your result and favourite universities, send you the confirmation code and the code for a new password if you forget yours, and tell you by email when your password is changed or your account deleted.",
            )}
            basis={t(
              "executarea contractului dintre noi, adică serviciul pe care îl ceri când îți faci cont (GDPR, art. 6 alin. 1 lit. b).",
              "performance of the contract between us, that is, the service you ask for when you make an account (GDPR, Art. 6(1)(b)).",
            )}
          />
          <Purpose
            labels={en ? ["What data", "Why", "Legal basis"] : ["Ce date", "De ce", "Temeiul legal"]}
            title={t("2. Părerile scrise de studenți", "2. Opinions written by students")}
            data={t(
              "numele, universitatea, facultatea, anul (dacă îl treci), textul părerii, data trimiterii și acordul tău pentru publicare; după verificare, și cine din echipă a aprobat sau a respins părerea și când. Dacă vrei, și o poză cu tine: e opțională, o decupezi tu înainte de trimitere și o păstrăm doar dacă bifezi separat că ești de acord să ți se afișeze fața; altfel poza nu pleacă de pe dispozitivul tău.",
              "your name, university, faculty, year (if you give it), the text of the opinion, the date it was sent and your agreement to publish it; after checking, also which team member approved or rejected the opinion and when. If you wish, also a photo of yourself: it is optional, you crop it yourself before sending and we keep it only if you separately tick that you agree to show your face; otherwise the photo never leaves your device.",
            )}
            why={t(
              "ca să le arătăm elevilor păreri reale despre facultăți. După ce echipa aprobă părerea, numele, facultatea, universitatea, anul, textul și poza (dacă ai trimis una) apar public pe site. Echipa poate șterge poza și păstra doar părerea.",
              "so that we can show students real opinions about faculties. Once the team approves the opinion, the name, faculty, university, year, text and photo (if you sent one) appear publicly on the site. The team may delete the photo and keep only the opinion.",
            )}
            basis={t(
              <>consimțământul tău, pe care îl dai bifând căsuța din formular (GDPR, art. 6 alin. 1 lit. a). Îl poți retrage oricând scriindu-ne la <ContactEmail />, iar părerea este scoasă de pe site.</>,
              <>your consent, which you give by ticking the box in the form (GDPR, Art. 6(1)(a)). You can withdraw it at any time by writing to us at <ContactEmail />, and the opinion is removed from the site.</>,
            )}
          />
          <Purpose
            labels={en ? ["What data", "Why", "Legal basis"] : ["Ce date", "De ce", "Temeiul legal"]}
            title={t("3. Statistici", "3. Statistics")}
            data={t(
              "câte pagini se deschid în fiecare zi și care, iar la prima pagină a unei vizite țara (două litere) și site-ul de pe care ai venit (doar numele lui, de exemplu „google.com”); pentru fiecare chestionar terminat: ziua, profilul de liceu, răspunsurile, unde și în ce orașe vrei să studiezi și cele trei domenii rezultate.",
              "how many pages are opened each day and which ones, and, on the first page of a visit, the country (two letters) and the site you came from (only its name, for example “google.com”); for each finished quiz: the day, the high-school profile, the answers, where and in which cities you want to study, and the three resulting fields.",
            )}
            why={t(
              "ca să știm dacă site-ul e folosit și cum să îmbunătățim chestionarul. Sunt date statistice, fără nume, email, cont, adresă IP sau cod care să-ți recunoască dispozitivul, și nu folosesc cookie-uri.",
              "so that we know whether the site is used and how to improve the quiz. This is statistical data, without a name, email, account, IP address or code that could recognise your device, and it does not use cookies.",
            )}
            basis={t(
              "interesul nostru legitim de a ști cum e folosit site-ul și de a-l face mai bun (GDPR, art. 6 alin. 1 lit. f). Am ales varianta cu cele mai puține date, ca să nu te afecteze.",
              "our legitimate interest in knowing how the site is used and making it better (GDPR, Art. 6(1)(f)). We chose the option with the least data, so that it does not affect you.",
            )}
          />
          <Purpose
            labels={en ? ["What data", "Why", "Legal basis"] : ["Ce date", "De ce", "Temeiul legal"]}
            title={t("4. Siguranță și limite împotriva abuzurilor", "4. Security and limits against abuse")}
            data={t(
              "numărul de încercări recente legate de numele de utilizator sau de adresa de email (la conectare, la crearea contului și la cererea unui cod), iar la formularul de păreri rezultatul verificării anti-robot.",
              "the number of recent attempts linked to a username or an email address (when signing in, making an account and asking for a code), and, for the opinion form, the result of the anti-robot check.",
            )}
            why={t(
              "ca nimeni să nu poată ghici parole, să nu poată trimite mii de emailuri cu coduri și ca roboții să nu umple site-ul cu păreri false.",
              "so that nobody can guess passwords, nobody can send thousands of emails with codes, and robots cannot fill the site with fake opinions.",
            )}
            basis={t(
              "interesul nostru legitim de a ține site-ul și conturile în siguranță (GDPR, art. 6 alin. 1 lit. f).",
              "our legitimate interest in keeping the site and the accounts safe (GDPR, Art. 6(1)(f)).",
            )}
          />
        </div>
        <p>
          {t(
            "Nu îți cerem școala, data nașterii, adresa sau numărul de telefon și nu strângem date despre sănătate, religie sau alte date sensibile.",
            "We do not ask for your school, date of birth, address or phone number, and we do not collect data about health, religion or other sensitive data.",
          )}
        </p>
      </Block>

      <Block title={t("Cât timp păstrăm datele", "How long we keep the data")}>
        <List>
          <li>
            <span className="font-bold text-ink">{t("Contul, rezultatul salvat și favoritele:", "The account, the saved result and the favourites:")}</span>{" "}
            {t(
              "până ștergi contul. Rezultatul și fiecare universitate favorită le poți șterge și separat, oricând. Un cont al cărui email nu a fost confirmat cu codul se șterge automat după 7 zile.",
              "until you delete the account. You can also delete the result and each favourite university separately, at any time. An account whose email was not confirmed with the code is deleted automatically after 7 days.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Sesiunea de conectare:", "The sign-in session:")}</span>{" "}
            {t(
              "nu mai este valabilă după cel mult 30 de zile; datele ei se șterg odată cu contul.",
              "stops being valid after 30 days at most; its data is deleted together with the account.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Codul de 6 cifre din email:", "The 6-digit code from the email:")}</span>{" "}
            {t("poate fi folosit doar 15 minute.", "can be used for 15 minutes only.")}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Părerile:", "The opinions:")}</span>{" "}
            {t(
              "cele aprobate rămân pe site până ne ceri să le scoatem. Cele respinse se șterg automat după 30 de zile de la decizie, iar cele pe care nu le-a citit nimeni, după 90 de zile. Poza se șterge odată cu părerea; ne poți cere oricând să ștergem doar poza.",
              "approved ones stay on the site until you ask us to remove them. Rejected ones are deleted automatically 30 days after the decision, and ones that nobody has read, after 90 days. The photo is deleted together with the opinion; you can ask us at any time to delete only the photo.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Statisticile:", "The statistics:")}</span>{" "}
            {t(
              "rezultatele de chestionar fără nume se șterg după 12 luni, iar numărătorile pe zile (vizite, țări, site-uri de unde vin vizitatorii) după 24 de luni. Rămân doar totalurile generale, care nu au legătură cu nicio persoană.",
              "quiz results without a name are deleted after 12 months, and the daily counts (visits, countries, sites visitors come from) after 24 months. Only the general totals remain, which are not linked to any person.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Numărătorile de încercări:", "The attempt counts:")}</span>{" "}
            {t(
              "le păstrăm sub o amprentă a numelui de utilizator sau a emailului (din care acestea nu se pot citi), iar limita se golește singură în cel mult o oră. Numărătoarea parolelor greșite (care ține emailul contului) se șterge după 2 zile.",
              "we keep them under a fingerprint of the username or the email (from which these cannot be read), and the limit empties itself within an hour at most. The count of wrong passwords (which holds the account's email) is deleted after 2 days.",
            )}
          </li>
        </List>
      </Block>

      <Block title={t("Cine mai primește datele", "Who else receives the data")}>
        <p>
          {t(
            "Nu vindem și nu dăm datele nimănui pentru reclame. Folosim câteva firme care lucrează pentru noi („împuterniciți”), fiecare doar pentru rolul ei:",
            "We do not sell the data or give it to anyone for ads. We use a few companies that work for us (“processors”), each only for its own role:",
          )}
        </p>
        <List>
          <li>
            <span className="font-bold text-ink">Convex</span>{" "}
            {t("(SUA) — baza de date în care stau conturile, rezultatele salvate, părerile și statisticile;", "(USA) — the database that holds the accounts, saved results, opinions and statistics;")}
          </li>
          <li>
            <span className="font-bold text-ink">Resend</span>{" "}
            {t(
              "(SUA) — trimite emailul cu codul de confirmare sau de schimbare a parolei (primește adresa ta de email și codul);",
              "(USA) — sends the email with the confirmation code or the password change code (it receives your email address and the code);",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">Cloudflare</span>{" "}
            {t(
              "(Turnstile) — verifică, doar la formularul de păreri, că nu ești un robot;",
              "(Turnstile) — checks, only on the opinion form, that you are not a robot;",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">Vercel</span> {t("(SUA) — găzduiește site-ul.", "(USA) — hosts the site.")}
          </li>
        </List>
        <p>
          {t(
            "Ca la orice site, serverele Vercel și Convex văd adresa ta IP când deschizi o pagină. Vercel ne spune doar țara (două litere); noi nu salvăm adresa IP. Cât timp o păstrează ele în jurnalele lor tehnice este încă de verificat.",
            "As with any site, the Vercel and Convex servers see your IP address when you open a page. Vercel tells us only the country (two letters); we do not save the IP address. How long they keep it in their technical logs is still to be checked.",
          )}
        </p>
        <p>
          {t(
            "Părerile aprobate le poate citi oricine pe site. Am da date unei autorități doar dacă legea ne obligă.",
            "Approved opinions can be read by anyone on the site. We would give data to an authority only if the law requires us to.",
          )}
        </p>
        <p className="font-bold text-ink">{t("Date trimise în afara Uniunii Europene", "Data sent outside the European Union")}</p>
        <p>
          {t(
            "Aceste firme pot prelucra datele în SUA sau în alte țări din afara UE. Ca datele să fie la fel de protejate, contractele lor de prelucrare a datelor spun că folosesc:",
            "These companies may process the data in the USA or in other countries outside the EU. So that the data is just as protected, their data processing agreements say they use:",
          )}
        </p>
        <List>
          <li>
            {t(
              "Convex — clauzele contractuale standard aprobate de Comisia Europeană (decizia 2021/914);",
              "Convex — the standard contractual clauses approved by the European Commission (decision 2021/914);",
            )}
          </li>
          <li>
            {t(
              "Resend — cadrul UE-SUA privind protecția datelor (EU-U.S. Data Privacy Framework) și clauzele contractuale standard;",
              "Resend — the EU-U.S. Data Privacy Framework and the standard contractual clauses;",
            )}
          </li>
          <li>
            {t(
              "Cloudflare — cadrul UE-SUA privind protecția datelor și clauzele contractuale standard;",
              "Cloudflare — the EU-U.S. Data Privacy Framework and the standard contractual clauses;",
            )}
          </li>
          <li>{t("Vercel — clauzele contractuale standard.", "Vercel — the standard contractual clauses.")}</li>
        </List>
        <p>
          {t(<>Dacă vrei o copie a acestor garanții, scrie-ne la <ContactEmail />.</>, <>If you want a copy of these safeguards, write to us at <ContactEmail />.</>)}
        </p>
      </Block>

      <Block title={t("Drepturile tale", "Your rights")}>
        <p>{t("Ai dreptul:", "You have the right:")}</p>
        <List>
          <li>
            {t(
              <><span className="font-bold text-ink">să afli ce date avem despre tine și să primești o copie</span> — dacă ai cont, deschide pagina <Link href="/cont/datele-mele" className={link}>Datele mele</Link> (din „Contul meu”): vezi tot ce păstrăm despre contul tău și poți descărca o copie;</>,
              <><span className="font-bold text-ink">to find out what data we have about you and to receive a copy</span> — if you have an account, open the <Link href="/cont/datele-mele" className={link}>My data</Link> page (from “My account”): you see everything we keep about your account and can download a copy;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să iei datele cu tine</span> (portabilitate) — fișierul de mai sus poate fi citit și de alte programe;</>,
              <><span className="font-bold text-ink">to take your data with you</span> (portability) — the file above can also be read by other programs;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să corectezi datele</span> — numele îl schimbi singur din „Contul meu”; pentru restul, scrie-ne;</>,
              <><span className="font-bold text-ink">to correct your data</span> — you change your name yourself from “My account”; for the rest, write to us;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să ștergi datele</span> — din „Contul meu” ștergi rezultatul, o universitate favorită sau tot contul (nu se poate anula); pentru o părere, scrie-ne;</>,
              <><span className="font-bold text-ink">to delete your data</span> — from “My account” you delete the result, a favourite university or the whole account (this cannot be undone); for an opinion, write to us;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să ceri să nu mai folosim datele o vreme</span> (restricționare), de exemplu cât verificăm o corectură;</>,
              <><span className="font-bold text-ink">to ask us to stop using the data for a while</span> (restriction), for example while we check a correction;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să te opui</span> folosirii datelor pe baza interesului nostru legitim (statistici, siguranță);</>,
              <><span className="font-bold text-ink">to object</span> to the use of the data based on our legitimate interest (statistics, security);</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să îți retragi consimțământul</span> pentru o părere publicată, oricând; ce am făcut înainte rămâne legal;</>,
              <><span className="font-bold text-ink">to withdraw your consent</span> for a published opinion, at any time; what we did before remains lawful;</>,
            )}
          </li>
          <li>
            {t(
              <><span className="font-bold text-ink">să faci o plângere</span> la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), pe <a href="https://www.dataprotection.ro" className={link} target="_blank" rel="noreferrer">www.dataprotection.ro</a>.</>,
              <><span className="font-bold text-ink">to make a complaint</span> to the National Supervisory Authority for Personal Data Processing (ANSPDCP), at <a href="https://www.dataprotection.ro" className={link} target="_blank" rel="noreferrer">www.dataprotection.ro</a>.</>,
            )}
          </li>
        </List>
        <p>
          {t(
            <>Pentru orice cerere scrie-ne la <ContactEmail />. Îți răspundem în cel mult o lună. Dacă cererea e foarte complicată, termenul se poate prelungi cu încă două luni, dar îți spunem asta în prima lună. Putem să-ți cerem ceva care să arate că ești chiar tu, ca să nu dăm datele altcuiva.</>,
            <>For any request, write to us at <ContactEmail />. We answer within one month at most. If the request is very complicated, the deadline can be extended by two more months, but we tell you this in the first month. We may ask you for something that shows it is really you, so that we do not give the data to someone else.</>,
          )}
        </p>
      </Block>

      <Block title={t("Vârsta", "Age")}>
        <p>{t("Poți folosi tot site-ul, inclusiv chestionarul, la orice vârstă și fără cont.", "You can use the whole site, including the quiz, at any age and without an account.")}</p>
        <List>
          <li>
            <span className="font-bold text-ink">{t("Contul", "An account")}</span>{" "}
            {t(
              "îl pot face doar cei care au cel puțin 16 ani. Dacă ai sub 16 ani, folosește site-ul fără cont.",
              "can only be made by people who are at least 16 years old. If you are under 16, use the site without an account.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Părerile", "Opinions")}</span>{" "}
            {t("le pot scrie doar cei care au cel puțin 18 ani.", "can only be written by people who are at least 18 years old.")}
          </li>
        </List>
        <p>
          {t(
            "Dacă afli că un copil sub 16 ani și-a făcut cont, scrie-ne și îl ștergem.",
            "If you find out that a child under 16 has made an account, write to us and we will delete it.",
          )}
        </p>
      </Block>

      <Block title={t("Chestionarul nu decide în locul tău", "The quiz does not decide for you")}>
        <p>
          {t(
            "Chestionarul compară automat răspunsurile tale cu domeniile de studiu și îți arată cele mai potrivite trei. Este doar o recomandare: nu ia nicio decizie despre tine, nu are efecte juridice și nu te înscrie nicăieri. Tu alegi ce faci mai departe.",
            "The quiz automatically compares your answers with the fields of study and shows you the three that fit best. It is only a recommendation: it makes no decision about you, has no legal effects and does not enrol you anywhere. You choose what to do next.",
          )}
        </p>
      </Block>

      <Block title={t("Cum păstrăm datele în siguranță", "How we keep the data safe")}>
        <List>
          <li>{t("tot ce trimiți circulă criptat (adresa începe cu https);", "everything you send travels encrypted (the address starts with https);")}</li>
          <li>
            {t(
              "parola nu o păstrăm deloc, ci doar o amprentă a ei, făcută cu o metodă greu de spart (scrypt);",
              "we do not keep the password at all, only a fingerprint of it, made with a method that is hard to break (scrypt);",
            )}
          </li>
          <li>{t("emailul se confirmă cu un cod care expiră după 15 minute;", "the email is confirmed with a code that expires after 15 minutes;")}</li>
          <li>
            {t(
              "după prea multe încercări greșite, conectarea și trimiterea de coduri se blochează pentru o vreme;",
              "after too many wrong attempts, signing in and sending codes are blocked for a while;",
            )}
          </li>
          <li>
            {t(
              "fiecare cont își vede doar propriile date; părerile în așteptare și statisticile le văd doar administratorii, iar regula asta e verificată pe server, nu doar în pagină;",
              "each account sees only its own data; pending opinions and statistics are seen only by administrators, and this rule is checked on the server, not only in the page;",
            )}
          </li>
          <li>{t("formularul de păreri are o verificare anti-robot și o limită pe oră;", "the opinion form has an anti-robot check and a limit per hour;")}</li>
          <li>{t("păstrăm cât mai puține date și nu cerem nimic de care nu avem nevoie.", "we keep as little data as possible and ask for nothing we do not need.")}</li>
        </List>
      </Block>

      <Block title={t("Dacă se întâmplă ceva cu datele", "If something happens to the data")}>
        <p>
          {t(
            "Dacă datele ajung la cine nu trebuie (de exemplu după un atac), echipa anunță ANSPDCP în cel mult 72 de ore de când a aflat, atunci când legea o cere. Dacă riscul pentru tine este mare, te anunțăm și pe tine direct, cât mai repede, și îți spunem ce poți face.",
            "If the data reaches someone it should not (for example after an attack), the team notifies ANSPDCP within 72 hours of finding out, when the law requires it. If the risk to you is high, we also tell you directly, as soon as possible, and tell you what you can do.",
          )}
        </p>
      </Block>

      <Block title={t("Cookie-uri și date păstrate în browser", "Cookies and data kept in the browser")}>
        <p>
          {t(
            "Nu folosim cookie-uri de reclame sau de urmărire. Folosim doar ce e strict necesar ca site-ul să funcționeze:",
            "We do not use advertising or tracking cookies. We use only what is strictly necessary for the site to work:",
          )}
        </p>
        <List>
          <li>
            <span className="font-bold text-ink">{t("Două cookie-uri de conectare", "Two sign-in cookies")}</span>
            {t(
              ", doar cât ești conectat, ca site-ul să știe că ești tu. Paginile nu le pot citi (sunt „httpOnly”) și se șterg când te deconectezi sau când închizi browserul. În spațiul de stocare al browserului („localStorage”) stă și o copie a cheii de conectare, care se șterge la deconectare.",
              ", only while you are signed in, so that the site knows it is you. Pages cannot read them (they are “httpOnly”) and they are deleted when you sign out or close the browser. A copy of the sign-in key also sits in the browser's storage (“localStorage”), and it is deleted when you sign out.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Chestionarul în lucru", "The quiz in progress")}</span>{" "}
            {t(
              "(răspunsurile, activitățile, pozele) stă în fila browserului („sessionStorage”) și dispare când o închizi. Tot acolo ținem minte dacă rezultatul a fost deja numărat, ca să nu-l numărăm de două ori.",
              "(the answers, activities, photos) stays in the browser tab (“sessionStorage”) and disappears when you close it. We also remember there whether the result was already counted, so that we do not count it twice.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Rezultatul de salvat:", "The result to be saved:")}</span>{" "}
            {t(
              "dacă apeși „Salvează în contul meu” înainte să te conectezi, rezultatul stă în browser până termini conectarea, apoi e șters de acolo. La fel o universitate pe care o pui la favorite înainte să te conectezi.",
              "if you press “Save to my account” before signing in, the result stays in the browser until you finish signing in, then it is deleted from there. The same goes for a university you add to your favourites before signing in.",
            )}
          </li>
          <li>
            <span className="font-bold text-ink">{t("Verificarea anti-robot", "The anti-robot check")}</span>{" "}
            {t(
              "de la formularul de păreri se încarcă de la Cloudflare doar pe pagina formularului. Cloudflare primește adresa IP și câteva date tehnice despre browser, strict necesare ca să deosebească oamenii de roboți. Dacă pune și cookie-uri tehnice este încă de verificat.",
              "on the opinion form is loaded from Cloudflare only on the form page. Cloudflare receives the IP address and some technical details about the browser, strictly necessary to tell people from robots. Whether it also sets technical cookies is still to be checked.",
            )}
          </li>
        </List>
        <p>{t("Pentru că acestea sunt strict necesare, nu îți cerem acordul pentru ele.", "Because these are strictly necessary, we do not ask for your consent for them.")}</p>
      </Block>

      <Block title={t("Schimbări și contact", "Changes and contact")}>
        <p>
          {t(
            "Dacă schimbăm ceva important în acest text, schimbăm și data de sus și, dacă ai cont, te anunțăm.",
            "If we change something important in this text, we also change the date at the top and, if you have an account, we tell you.",
          )}
        </p>
        <p>{t(<>Pentru orice întrebare despre datele tale: <ContactEmail />.</>, <>For any question about your data: <ContactEmail />.</>)}</p>
      </Block>
    </Shell>
  );
}
