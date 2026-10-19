# Securitate — ce se verifică singur și ce verificăm de mână

Pe scurt: GitHub verifică automat codul la fiecare schimbare. O dată pe săptămână
(și înainte de lansare) facem în plus o verificare de mână de 30 de minute, după
lista de mai jos. **Totul se face doar pe varianta de lucru (baza de date „dev”,
`adjoining-duck-455`) și pe calculatorul nostru — niciodată pe site-ul public sau
pe baza de date de producție (`impartial-heron-254`).**

## 1. Ce rulează automat (pe GitHub)

| Ce | Unde e scris | Ce face, pe scurt | Când |
| --- | --- | --- | --- |
| CodeQL | `.github/workflows/codeql.yml` | caută greșeli de securitate în codul TypeScript | la fiecare schimbare și săptămânal |
| gitleaks | `.github/workflows/security.yml` | caută parole și chei scăpate în istoria proiectului | la fiecare schimbare |
| npm audit | `.github/workflows/security.yml` | caută pachete folosite de site care au probleme cunoscute | la fiecare schimbare și săptămânal |
| Teste (vitest) | `.github/workflows/security.yml` | testele aplicației, inclusiv regulile de acces (cine vede ce) | la fiecare schimbare |
| ZAP (OWASP) | `.github/workflows/dast.yml`, reguli în `.zap/rules.tsv` | pornește site-ul în interiorul GitHub și îl „vizitează” ca un robot, uitându-se doar (nu atacă) după setări riscante | la fiecare pull request, săptămânal și la cerere |
| Dependabot | `.github/dependabot.yml` | propune actualizări când un pachet primește o reparație | automat |

Raportul ZAP se descarcă din GitHub: tab-ul **Actions** → „ZAP scan (running
site)” → ultima rulare → **Artifacts** → `zap-report`. Deocamdată ZAP doar
raportează (`fail_action: false`); când raportul e curat, îl facem să oprească
schimbările cu probleme. În `.zap/rules.tsv` ignorăm doar alerte care sunt
alarme false, fiecare cu explicația ei.

## 2. Verificarea bazei de date fără cont (Convex)

Întrebarea: „Ce poate citi un străin din baza noastră de date fără să se
conecteze?” Scriptul întreabă, fără cont, fiecare funcție de citire și spune
care răspunde cu date. Nu scrie nimic: funcțiile care scriu (trimite părere,
numără vizite, conectare etc.) sunt doar listate, nu apelate. Afișează doar
numele câmpurilor și numărul de rânduri, nu conținutul. Refuză să ruleze pe
producție.

```
node scripts/convex-probe.mjs
```

Ia adresa bazei „dev” din `apps/web/.env.local`. Cum citești rezultatul:
`denied` = a cerut cont (bine), `empty` = nu a dat nimic, `DATA` = a dat date
(în regulă doar dacă sunt publice: păreri aprobate, catalogul), `LEAK` = o
funcție pentru utilizatori conectați sau administratori a dat date fără cont —
**se oprește lucrul și se repară.**

Rezultat 2026-10-20 (dev): nicio scurgere. Răspund fără cont doar
`account:signInMethods` (un singur da/nu: „se pot face conturi acum?”),
`auth:isAuthenticated` (fals) și funcțiile publice ale catalogului și ale
părerilor aprobate. `results:mine`, `reviews:listByState` și
`analytics:overview` au cerut cont.

## 3. Verificare de mână — 30 de minute

Inspirată din OWASP ASVS nivelul 1 (lista de verificări de bază pentru site-uri)
și ghidul de testare OWASP WSTG — le folosim ca idee, nu le copiem:

- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- OWASP WSTG: https://owasp.org/www-project-web-security-testing-guide/

Înainte de toate: `npm run dev --prefix apps/web` și deschide
http://localhost:3000. Pagina locală folosește baza „dev”. Folosește doar contul
de probă din `.env.example` (sau unul nou, făcut pe dev cu o adresă
`@example.com`). Notează la fiecare punct: TRECUT / PICAT.

1. **Parole greșite (5 min).** La conectare, scrie de 10 ori o parolă greșită la
   contul de probă. Trebuie: mesaj clar, fără să spună dacă numele există sau nu,
   iar după multe încercări site-ul să te oprească o vreme. Același lucru cu un
   nume care nu există — mesajul trebuie să fie la fel. (ASVS: autentificare.)
2. **Coduri greșite (5 min).** „Am uitat parola” pe contul de probă, apoi scrie
   de mai multe ori un cod de 6 cifre greșit. Trebuie să te oprească după câteva
   încercări și codul vechi să nu mai meargă după ce ai cerut unul nou. Pe dev,
   codul adevărat apare în `npx convex logs` (nu se trimite email). Cere coduri
   noi de mai multe ori la rând: după câteva trebuie să spună „prea multe”.
3. **Formular de părere fără verificarea anti-robot (5 min).** Pe
   `/studenti/parere`, deschide instrumentele browserului (F12) → Console și
   șterge căsuța anti-robot (`document.querySelector('[data-turnstile]').remove()`),
   apoi trimite. Trebuie să fie refuzat („Verificarea anti-robot lipsește”) sau
   butonul să rămână blocat.
   Atenție: pe dev, cheia Cloudflare e cea de test care lasă orice să treacă,
   deci aici verificăm doar că un formular **fără** verificare e refuzat.
   Câmpul ascuns `website` completat trebuie să nu salveze nimic.
4. **Pagini de administrare ca utilizator obișnuit (5 min).** Conectat cu contul
   de probă (care nu e administrator), deschide `/admin/pareri` și
   `/admin/statistici`. Trebuie: nicio dată, doar un mesaj. Deconectat, aceleași
   adrese trebuie să te trimită la `/conectare`. Rulează și scriptul de la
   punctul 2. (ASVS: control acces.)
5. **HTML și cod ascuns într-o părere și într-un nume (5 min).** Trimite o
   părere al cărei text conține `<b>gros</b> <img src=x onerror=alert(1)>
   <script>alert(2)</script>`. Ca administrator pe dev, aprob-o și uită-te pe
   `/studenti` și în `/admin/pareri`: textul trebuie să apară **ca text**, fără
   litere îngroșate și fără nicio fereastră `alert`. La fel cu un nume afișat
   (pe „Contul meu”) de felul `<i>Ana</i>`. La final respinge sau șterge părerea
   de probă. (ASVS: validare și codare a ieșirii.)
6. **Ce ajunge în browser (5 min).** `npm run build --prefix apps/web`, apoi
   caută în fișierele trimise browserului:
   `grep -rhoE "NEXT_PUBLIC_[A-Z_]+" apps/web/.next/static | sort -u`.
   Next.js pune de obicei direct valorile în fișiere, deci lista poate fi goală;
   dacă apar nume, au voie doar `NEXT_PUBLIC_CONVEX_URL`,
   `NEXT_PUBLIC_CONVEX_SITE_URL` și `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (toate
   publice). Verifică și în `apps/web/.env.local` că doar acestea au prefixul. Caută și cuvinte care nu
   au voie să fie acolo:
   `grep -rlE "RESEND|TURNSTILE_SECRET|JWT_PRIVATE|re_[A-Za-z0-9]{20}" apps/web/.next/static`
   — nu trebuie să găsească nimic. Nicio variabilă secretă nu primește prefixul
   `NEXT_PUBLIC_`.

Dacă ceva e PICAT: nu încerca „să vezi cât de departe merge” și nu repeta pe
site-ul public. Scrie ce ai făcut și ce ai văzut și spune-i lui Claude.
