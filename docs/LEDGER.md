# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** UniPath — ghid între liceu și facultate. Hackathonul s-a încheiat (prezentare pe 2026-10-05); acum se construiește versiunea de producție: conturi, bază de date Convex, păreri moderate, securitate
- **Unde:** versiunea de producție e pe ramura `production` (nepublicată; rulează local cu `npm run dev --prefix apps/web` și folosește baza Convex de dezvoltare, proiectul „unipath”). Versiunea prezentată e pe `main`, publică la https://findmyuni.ro (și https://unipath-taupe-mu.vercel.app), și nu se atinge până nu cere echipa. Planul: `docs/production-plan.md`
- **Urmează:** ordinea hotărâtă de echipă (vezi `docs/ultimii-pasi.md`): (1) baza de date completă — FĂCUT și verificat pentru 11 țări (100.186 programe; Germania și Austria parțiale; starea pe țări în `docs/catalog-status.md`); rămân: Marea Britanie și alte țări fără date deschise, universitățile lumii din ROR, fișe pentru cele 10 instituții românești noi; (2) calitate tehnică (viteza paginilor, acum generate la fiecare vizită); (3) ultimii pași: chei reale, domeniu, administratori, baza de producție, lansare
- **De știut:** Vercel CLI și Convex CLI sunt logate doar din aplicația Claude (Vercel: cont `dobrinlucaadrian-7970`; Convex: echipa `dobrinlucaadrian`, proiect `unipath`, bază de dezvoltare `adjoining-duck-455`). `apps/web/.env.local` NU e în Git: dacă lipsește, `npx convex dev --once` în `apps/web` îl reface, iar `NEXT_PUBLIC_TURNSTILE_SITE_KEY` de probă este `1x00000000000000000000AA`. Catalogul se reîncarcă în Convex cu `node scripts/data/import.mjs`. Pe baza de dezvoltare sunt puse `AUTH_DEV_LOG_LINKS=1` (linkul de conectare apare în `npx convex logs`), cheile de probă Turnstile și `ADMIN_EMAILS=admin.test@example.com`. Echipa vrea să lucrez cât mai mult local înainte să-i cer conturi sau chei

## Jurnal

<!-- Cea mai nouă intrare sus. Format:
### AAAA-LL-ZZ HH:MM — titlul sarcinii
- Cerut: ce a vrut echipa
- Făcut: ce s-a schimbat, pe scurt
- Fișiere: căile atinse
- Poartă: TRECUT / PICAT / NEVERIFICAT (și ce anume)
- Urmează: pasul următor
-->

### 2026-10-25 13:00 — explicații pentru toate combinațiile de filtre fără rezultate
- Cerut: verificarea tuturor combinațiilor de filtre care nu se potrivesc și o explicație pentru fiecare
- Făcut: am verificat fiecare țară (plus România și străinătate) cu fiecare filtru, apoi perechile de filtre fără loc. Explicațiile se calculează acum din date pentru locul ales: taxa cea mai mică (din sumele confirmate, altfel „peste” pragul nivelului), modalitățile de admitere care există acolo, câte au cel puțin o licență în engleză, prestigiu, burse, cămin, certificate cerute de toate, domenii lipsă, plus „Fără bacalaureat” (doar câteva academii de artă). Cele trei texte speciale pentru România rămân. Se arată cel mult două explicații, apoi butoanele „Scoate …”
- Fișiere: `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser 12 combinații: Marea Britanie + 3.000 €, Franța + media de la bac, Danemarca + toate în engleză, Germania + top, România + fără bac, Malta + burse, Australia + fără taxă, Olanda + 1.000 €, Marea Britanie + fără engleză etc. — fiecare cu explicația corectă)
- Urmează: salvare cu /git-workflow

### 2026-10-25 12:00 — când nu sunt rezultate: de ce și ce filtru să scoți
- Cerut: dacă elevul alege România și „Test standardizat (SAT …)”, sub lupă să apară un mesaj că filtrul nu se potrivește, fiindcă în România nu se cere așa ceva
- Făcut: la zero rezultate apar (1) explicația pentru cazurile din România care nu pot avea rezultate: test standardizat, toate licențele în engleză (cu numărul calculat din date al celor cu cel puțin una), De top mondial; (2) până la 3 butoane „Scoate «filtru» → N universități”, cu filtrele care aduc cele mai multe rezultate înapoi; plus „Șterge filtrele”. Numerele se scriu corect în română („83 de universități”), și la textul citit pentru orașe
- Fișiere: `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser: România + test standardizat, România + toate licențele în engleză, București + De top mondial — fiecare cu explicația și butoanele potrivite)
- Urmează: salvare cu /git-workflow

### 2026-10-25 11:00 — mai multe alegeri în același filtru
- Cerut: să poți bifa mai multe variante deodată, ca să nu cauți de două ori; ales: Domeniu, Prestigiu și Modalitate de admitere, iar o universitate apare dacă se potrivește cu oricare dintre alegeri
- Făcut: câmpurile `domainIds`, `prestiges`, `admissionTypes` (mai multe valori în adresă, de ex. `?domeniu=medicina&domeniu=farmacie`); la Domeniu fiecare alegere se adaugă ca etichetă cu ✕ sub listă; la Prestigiu și Admitere butoanele se bifează pe rând; „De top mondial” include și Ivy League. Linkurile vechi cu o singură valoare merg în continuare
- Fișiere: `apps/web/lib/types.ts`, `apps/web/lib/universities.ts`, `apps/web/lib/universities.test.ts`, `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser: Medicină + Farmacie, De top mondial + Cunoscută internațional, Media + Dosar → toate cele 6 active deodată, rezultatele încep cu Karolinska, Imperial)
- Urmează: salvare cu /git-workflow (împreună cu filtrul „Predare în engleză”)
- Apoi, la cererea echipei: scos butonul „Ivy League” din filtrul Prestigiu (încurca elevii); Ivy League apare la „De top mondial”, iar linkurile vechi cu `prestigiu=ivy` deschid „De top mondial”. Observat: doar 25 de universități sunt „De top mondial” (plus 8 Ivy), de ex. nicio universitate germană — de corectat dacă echipa vrea

### 2026-10-25 10:00 — filtrul „Predare în engleză”
- Cerut: filtru pentru universitățile unde se poate studia în engleză; ales: două variante („cel puțin o licență” și „toate licențele”), în „Mai multe filtre”
- Făcut: `data/english.json` dă fiecărei fișe o categorie (toate / unele / niciuna dintre licențe în engleză). România din lista oficială a programelor (41 de universități cu cel puțin o licență în engleză); străinătatea din textul despre limba de predare, clasificat de un agent și comparat cu o clasificare automată, iar cele 92 de diferențe sau cazuri neclare citite una câte una (la neclar, varianta prudentă: cursurile sau semestrele în engleză nu contează). Total: 258 toate, 356 unele, 284 niciuna. Indexul primește câmpul `english`; filtrul `?engleza=unele|toate`
- Fișiere: `apps/web/data/english.json`, `apps/web/data/universities-index.json`, `scripts/data/sheets-index.mjs`, `apps/web/lib/types.ts`, `apps/web/lib/universities.ts`, `apps/web/lib/universities.data.test.ts`, `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser: Germania + „Cel puțin o licență în engleză” → Freiburg, FAU, TUM, UdK, Frankfurt School …; butoanele apar în panou)
- Urmează: salvare cu /git-workflow

### 2026-10-24 13:30 — desene noi pe pagini
- Cerut: mai multe elemente vizuale; ales: Universități, Ghiduri pe țări, Specializări și ecranul „nu am găsit nimic”, în stilul de acum
- Făcut: patru desene SVG noi în culorile site-ului, cu aceeași mișcare ușoară: clădire de universitate cu lupă (Universități), glob cu avion de hârtie (Ghiduri), eprubetă–laptop–balanță–pensulă (Specializări, în locul cărților), lupă cu semn de întrebare și căciulă (fără rezultate, în locul emoji-ului). Pe telefon, desenele de la Universități și Ghiduri se ascund ca să nu înghesuie titlul
- Fișiere: `apps/web/components/Illustrations.tsx`, `apps/web/app/universitati/page.tsx`, `apps/web/app/ghiduri/page.tsx`, `apps/web/app/specializari/page.tsx`, `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser: cele 4 desene văzute pe paginile lor și mărite)
- Urmează: salvare cu /git-workflow

### 2026-10-24 12:30 — primele 10 universități din România, în ordinea echipei
- Cerut: lista din România să înceapă cu ASE, apoi Politehnica; echipa a ales ordinea primelor 10
- Făcut: `RO_FIRST` în `lib/universities.ts`: ASE, Politehnica București, UMF „Carol Davila”, Universitatea din București, Babeș-Bolyai, UAIC, UTCN, UVT, Politehnica Timișoara, UMF Cluj. Se aplică doar când lista are numai universități din România (filtrul „În România”, țara România sau orașe românești); lista mixtă rămâne ca înainte
- Fișiere: `apps/web/lib/universities.ts`, `apps/web/lib/universities.data.test.ts`
- Poartă: TRECUT (gate.mjs; în browser: „În România” începe cu cele 10, în ordinea aleasă)
- Urmează: salvare cu /git-workflow

### 2026-10-24 12:00 — ordonarea „Cele mai ieftine” încercată și scoasă; taxa Artifex corectată
- Cerut: rezultatele ordonate după taxă; după ce a văzut-o, echipa a cerut s-o scoatem (universitățile renumite ajungeau prea jos; filtrul „Cât poți plăti pe an?” ajunge)
- Făcut: ordonarea a fost scoasă complet (codul revine la cel salvat). Rămâne doar corectura de date: Artifex 7.200 lei/an, anul 1 gratuit doar cu condiția terminării celor 3 ani (în notă)
- Fișiere: `apps/web/data/fees.json`, `apps/web/data/universities-index.json`
- Poartă: TRECUT (gate.mjs; în browser: butoanele de ordine nu mai apar, România începe iar cu ASE, UAIC, UBB)
- Urmează: salvare cu /git-workflow

### 2026-10-24 11:00 — numărul de universități la fiecare oraș
- Cerut: la orașele din filtrul de pe „Universități” să scrie câte instituții are fiecare; ales: numărul în buton, după nume, și toate universitățile orașului (nu doar cele din filtre)
- Făcut: `cityCounts()` numără universitățile pe oraș pentru țara sau regiunea aleasă; butonul arată „București 29”, iar cititorul de ecran aude „București, 29 universități”
- Fișiere: `apps/web/lib/universities.ts`, `apps/web/lib/universities.test.ts`, `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs; în browser: București 29, Cluj-Napoca 9, Iași 7, Timișoara 6 …)
- Urmează: salvare cu /git-workflow

### 2026-10-24 10:00 — filtrul „Cât poți plăti pe an?” cu sume
- Cerut: filtru după taxa exactă (ideea 4); recomandările alese: butoane cu sume, la statul român contează taxa de la locurile cu taxă, fără sumă exactă se folosește nivelul
- Făcut: butoanele Oricât / Fără taxă / Până la 1.000, 3.000, 6.000, 10.000, 20.000 €; fiecare universitate are în index taxa cea mai mică în euro (`feeFromEur`, din `fees.json` și cursurile din `data/eur-rates.json`), iar fără sumă exactă contează începutul nivelului; linkurile vechi cu `buget=` merg în continuare. Ideea 2 (facultățile în căutare) rămâne cum e, la cererea echipei
- Fișiere: `apps/web/components/UniversitySearch.tsx`, `apps/web/lib/universities.ts`, `apps/web/lib/types.ts`, `apps/web/lib/labels.ts`, `apps/web/lib/fees.ts`, `apps/web/data/eur-rates.json`, `apps/web/data/universities-index.json`, `scripts/data/sheets-index.mjs`, `apps/web/lib/universities.data.test.ts`
- Poartă: TRECUT (gate.mjs; în browser: „Până la 3.000 €” și „Fără taxă” filtrează și schimbă adresa, linkul vechi `buget=mic` devine „până la 2.000 €/an”)
- Urmează: salvare cu /git-workflow

### 2026-10-23 19:00 — taxa exactă pe an pe fiecare fișă
- Cerut: sumele exacte ale taxelor pe toate fișele; echipa a ales: la statul român „0 lei la buget” + taxa la locurile cu taxă, moneda locală + aprox. în euro, interval min–max, iar fără sumă oficială rămâne doar nivelul
- Făcut: locul de pe fișă („Cât costă” → „Taxa de școlarizare pe an (an universitar)”, cu linkul oficial), datele separat în `data/fees.json`, cursurile orientative în `lib/fees.ts`, teste; 20 de agenți au căutat sumele pe paginile oficiale și 20 de agenți le-au reverificat. Rezultat: 772 din 898 de fișe au suma exactă cu anul și linkul oficial; 126 rămân doar cu nivelul (site blocat, sumă neclară, fără an sau neconfirmată la a doua verificare). Anul poate fi și calendaristic (Australia, Asia). Nepotriviri sumă–nivel lăsate echipei: unisob, hotelschool-the-hague, vut-brno, sse-riga
- Fișiere: `apps/web/lib/fees.ts`, `apps/web/lib/fees.test.ts`, `apps/web/data/fees.json`, `apps/web/app/universitati/[id]/page.tsx`
- Poartă: TRECUT (gate.mjs cu 772 de sume; în browser: unibuc buget + taxă în lei, Oxford în lire pe telefon, TUM 0 €, UNSW an calendaristic, ANI doar buget, Sciences Po după venit)
- Urmează: echipa decide cele 4 nepotriviri; sumele trebuie reverificate anual (la fiecare an universitar nou)

### 2026-10-23 13:00 — universități noi cu fișă completă
- Cerut: cât mai multe universități renumite, doar din țările pe care le avem, cu fișă completă din surse oficiale (altfel sărite) și cu poză
- Făcut: în trei runde, 147 de fișe noi (SUA 24, Germania 18, Spania 13, Franța 12, Marea Britanie 10, Australia 6, Polonia 6, Austria 6, Irlanda 6, Suedia 6, Canada 6, Belgia 5, Italia 4, Portugalia 4, Finlanda 4, Cehia 3, Norvegia 3, Letonia 2, Hong Kong 2 și câte una în Bulgaria, Elveția, Lituania, Coreea de Sud, Estonia, Grecia, Singapore); fiecare scrisă de un agent din paginile oficiale și reverificată de un al doilea agent (greșelile corectate, nesigurul scos); sursele în `university-sources.json`; instituțiile din catalog legate de fișa nouă (`hasSheet`); indexul refăcut. Poze de pe Wikimedia Commons pentru 82 dintre ele, fiecare văzută de mine; 13 poze proaste respinse (`photo-rejects.json`); celelalte nu au o poză bună liberă de drepturi. Universitățile fără date oficiale complete au fost sărite (lista cu motive în notele agenților)
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/university-sources.json`, `apps/web/data/catalog/*-institutions.json`, `apps/web/data/catalog/index.json`, `apps/web/data/photos.json`, `apps/web/data/photo-rejects.json`, `apps/web/public/photos/*.webp`
- Poartă: TRECUT (gate.mjs după 147 de fișe; în browser: Karolinska cu poză și programe, căutarea „swarthmore”, UC Davis fără poză)
- Urmează: salvare cu /git-workflow; la lansare, reîncărcarea catalogului în baza de date, ca să se vadă legătura fișă–programe și acolo

### 2026-10-23 07:30 — inimioara de favorite pe cardurile din căutare
- Cerut: inimioara și pe cardurile din căutare, nu doar pe fișă
- Făcut: varianta mică a butonului de favorite (`compact`) în colțul fiecărui card din „Universități”, deasupra linkului care acoperă cardul, cu numele universității citit de cititoarele de ecran; fără cont deschide fereastra de cont (rămâi pe căutare), cu cont pune și scoate de la favorite pe loc
- Fișiere: `apps/web/components/FavoriteButton.tsx`, `apps/web/components/UniversityCard.tsx`
- Poartă: TRECUT (gate.mjs); local: fără cont → fereastra de cont, rămâne pe căutare; cu contul de probă → adaugă și scoate; pe telefon nu acoperă numele
- Urmează: lansarea, când hotărăște echipa

### 2026-10-23 07:00 — sugestii în căutare, verificarea pe telefon și accesibilitate
- Cerut: (5) sugestii în timp ce scrii; (3) verificare pe telefon; (6) accesibilitate; reparat direct ce e mic
- Făcut: (Sugestii) sub căsuța de căutare a universităților apar, de la 2 litere și fără diacritice, cel mult 2 locuri (oraș sau țară; clic caută acolo) și 6 universități (românești întâi; clic deschide fișa); merge cu săgețile, Enter și Escape și e anunțată corect de cititoarele de ecran (combobox). (Verificare) toate paginile la 375 px, cu un control automat (ieșire în lateral, butoane mici, text mic, imagini fără descriere, câmpuri fără etichetă, contrast, titluri) plus privit cu ochiul; build-ul real verificat separat (dublurile de pagină din dezvoltare nu există acolo). Reparat: meniul de sus se rupe pe două rânduri pe telefon (înainte „Chestionar”, „Studenți” și „Contul meu” erau ascunse în dreapta); auriul mare „Uni” mai închis (contrast 3,5:1); linkurile „Site ↗” de 44 px; titlul formularului de cont e nivel 2 (nu mai sare de la 1 la 3); titluri proprii în tab pentru chestionar, rezultat, conectare, formularul de păreri, cont și administrare (cont, conectare și administrare marcate „nu indexa”); textul din căsuța de căutare scurtat ca să încapă pe telefon
- Fișiere: `apps/web/components/SearchBox.tsx`, `apps/web/components/UniversitySearch.tsx`, `apps/web/lib/universities.ts`, `apps/web/lib/suggest.test.ts`, `apps/web/components/NavLinks.tsx`, `apps/web/app/page.tsx`, `apps/web/components/UniversityList.tsx`, `apps/web/components/SignInForm.tsx`, `apps/web/app/conectare/page.tsx`, `apps/web/app/test/layout.tsx`, `apps/web/app/quiz/layout.tsx`, `apps/web/app/rezultat/layout.tsx`, `apps/web/app/studenti/parere/layout.tsx`, `apps/web/app/cont/layout.tsx`, `apps/web/app/admin/layout.tsx`
- Poartă: TRECUT (gate.mjs); local: „poli” → Politehnicile românești, săgeată jos + Enter → fișa UPB; meniul pe telefon pe două rânduri, fără ieșire în lateral
- Urmează: lansarea, când hotărăște echipa

### 2026-10-23 06:00 — căutarea de universități rămâne la întoarcere
- Cerut: după ce intri pe o universitate și te întorci, căutarea să nu se mai șteargă
- Făcut: butonul „← Înapoi la universități” de pe fișă ducea la căutarea goală; acum duce la ultima căutare din fila browserului (`components/BackToSearch.tsx`, `lib/lastSearch.ts`). Și numărul de rezultate deschise cu „Arată încă 10” se păstrează în adresă (`?arata=20`), așa că și butonul „înapoi” al browserului readuce aceeași listă; o căutare sau un filtru nou pornește iar de la 10
- Fișiere: `apps/web/components/BackToSearch.tsx`, `apps/web/lib/lastSearch.ts`, `apps/web/components/UniversitySearch.tsx`, `apps/web/app/universitati/[id]/page.tsx`
- Poartă: TRECUT (gate.mjs); local: „universitatea” + „Arată încă 10” → fișa UAIC → „Înapoi la universități” și butonul „înapoi” al browserului readuc „universitatea” cu 20 de rezultate
- Urmează: lansarea, când hotărăște echipa

### 2026-10-23 04:00 — poze pe fișe și a treia verificare a taxelor
- Cerut: poze la universități și facultăți; continuarea verificării taxelor rămase
- Făcut: (Poze) `scripts/data/photos.mjs` alege pentru fiecare fișă poza instituției din Wikidata (site oficial identic cu al nostru): poza principală dacă e lată și mare, altfel cea mai bună din categoria Commons cu numele clădirii (mărime, potrivire 16:9, insigne de calitate, vechime, lumină, contrast, claritate); doar licențe libere (fără NC/ND), fără logouri, hărți, interioare, evenimente; salvată 1280×720 WebP în `public/photos`, cu autorul, licența și linkul în `data/photos.json`. Toate pozele au fost apoi văzute de Claude una câte una; cele nepotrivite (oameni, interioare, semne, peisaje fără clădire) sunt în `data/photo-rejects.json` și nu se mai aleg. Rezultat: 438 din 751 de universități cu poză (30 din 83 în România), 53 MB. Poza apare sus (16:9) pe fișa universității și pe fișele facultăților ei, cu „Foto: autor · licență · Wikimedia Commons”; pagina „Surse de date” explică. (Taxe) a treia rundă, cu regulamente PDF și copii arhivate ale paginilor oficiale: 746 din 751 confirmate; schimbate cu aprobarea echipei Florența și Toruń (mică → medie); 5 rămase în `docs/taxe.md`
- Fișiere: `scripts/data/photos.mjs`, `apps/web/data/photos.json`, `apps/web/public/photos/`, `apps/web/lib/photos.ts`, `apps/web/lib/photos.test.ts`, `apps/web/components/UniversityPhoto.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/app/universitati/[id]/[facultate]/page.tsx`, `apps/web/app/surse/page.tsx`, `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `docs/taxe.md`
- Poartă: TRECUT (gate.mjs); local: poza și creditul apar pe fișa UBB și pe o fișă de facultate a ei
- Urmează: lansarea, când hotărăște echipa

### 2026-10-23 02:20 — „Surse de date” scos din josul paginilor
- Cerut: linkul „Surse de date” să nu mai fie în josul fiecărei pagini; rămâne doar „Confidențialitate”
- Făcut: scos din subsolul comun (`components/Shell.tsx`). Pagina /surse rămâne (licențele datelor cer atribuirea), accesibilă din „De unde sunt datele” pe pagina „Programe de licență” și din linkurile mici de sub listele de programe de pe fișe
- Fișiere: `apps/web/components/Shell.tsx`
- Poartă: TRECUT (gate.mjs); subsolul arată doar „Confidențialitate”
- Urmează: lansarea

### 2026-10-23 02:00 — datele operatorului pe pagina de confidențialitate
- Cerut: operatorul este Dobrin Matei, emailul de contact findmyuni.ro@gmail.com, fără adresă deocamdată
- Făcut: completate în `OPERATOR`; rândul „Adresă” nu se mai afișează cât e gol; emailul apare peste tot unde pagina spune „scrie-ne la …” (retragerea acordului, drepturi, garanții, final)
- Fișiere: `apps/web/app/confidentialitate/page.tsx`
- Poartă: TRECUT (gate.mjs); văzut local: „Nume: Dobrin Matei”, emailul, niciun „[de completat de echipă]” rămas
- Urmează: lansarea; banda „Versiune de lucru” rămâne până citește un jurist textul

### 2026-10-23 01:30 — 2FA pentru administrator și emailuri de siguranță
- Cerut: mai multă siguranță: al doilea pas pentru administrator și emailuri la schimbări importante ale contului
- Făcut: (2FA) funcțiile de administrator (păreri, statistici) cer acum, pe lângă rolul din bază, deblocarea sesiunii cu un cod de 6 cifre trimis pe emailul administratorului (`convex/adminUnlock.ts`): codul ține 10 minute, cel mult 5 încercări, se păstrează doar amprenta lui (SHA-256), cel mult 5 coduri pe oră; deblocarea ține 8 ore, doar pe acel dispozitiv (sesiune); ecranul „Confirmă că ești tu” (`components/AdminGate.tsx`) pe ambele pagini de administrare. (Emailuri) „Parola contului tău a fost schimbată” după „Am uitat parola” și „Contul tău a fost șters” la ștergerea contului (`convex/email.ts`), cu îndemnul de a scrie dacă nu a fost elevul; pagina de confidențialitate le pomenește. Curățenia zilnică și ștergerea contului șterg și codurile/deblocările
- Fișiere: `apps/web/convex/adminUnlock.ts`, `apps/web/convex/adminUnlock.test.ts`, `apps/web/convex/email.ts`, `apps/web/convex/access.ts`, `apps/web/convex/schema.ts`, `apps/web/convex/authLimits.ts`, `apps/web/convex/retention.ts`, `apps/web/convex/account.ts`, `apps/web/convex/auth.ts`, `apps/web/convex/account.test.ts`, `apps/web/convex/access.test.ts`, `apps/web/convex/analytics.test.ts`, `apps/web/convex/retention.test.ts`, `apps/web/components/AdminGate.tsx`, `apps/web/app/admin/pareri/page.tsx`, `apps/web/app/admin/statistici/page.tsx`, `apps/web/app/confidentialitate/page.tsx`
- Poartă: TRECUT (gate.mjs); parcurs local pe baza de dezvoltare: „Am uitat parola” → emailul „parola schimbată” apare în jurnal; administrare fără cod → „Confirmă că ești tu”; cod greșit → „Codul nu este corect”; codul bun → păreri și statistici deschise
- Urmează: funcțiile noi ajung în producție la lansare (`npx convex deploy`, cu aprobarea echipei). De știut: rolul de administrator se recalculează doar la crearea sau actualizarea contului (de ex. parolă nouă), nu la simpla conectare; contul de probă test.elev01 a rămas administrator pe baza de dezvoltare

### 2026-10-22 23:30 — baza de producție pregătită
- Cerut: pregătirea bazei de producție (pașii 1–4), cu aprobarea explicită a echipei pentru publicarea în producție
- Făcut: `npx convex deploy` (funcțiile și tabelele în Production, indexurile noi pentru favorite și utilizatori); `node scripts/data/import.mjs --prod` (4.334 instituții, 107.155 programe); în Vercel, setările de producție `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` (baza de producție) și `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (cheia publică reală). Site-ul public neschimbat
- Fișiere: `docs/LEDGER.md`
- Poartă: NEVERIFICAT (fără cod); verificat direct pe baza de producție: lista de programe a unei instituții (52) și căutarea „informatica” în România (40)
- Urmează: datele operatorului, apoi lansarea (`production` → `main`, publicare pe findmyuni.ro, verificarea pe site); după lansare, catalogul scos din baza de dezvoltare

### 2026-10-22 23:00 — pregătirea lansării, pasul 1 (conturi și chei)
- Cerut: pașii de dinaintea lansării, ghidat pas cu pas
- Făcut: echipa a cumpărat Convex Professional (un membru) cu alertă la 10 $ peste abonament (fără oprire); widgetul Turnstile „FindMyUni” exista deja în Cloudflare (adresa findmyuni.ro, mod Managed; www trimite oricum spre findmyuni.ro); cheia secretă pusă de echipă în Convex Production (`TURNSTILE_SECRET_KEY`), verificată la Cloudflare fără a fi afișată; în Production `ADMIN_EMAILS` = findmyuni.ro@gmail.com (în locul adresei vechi) și `SITE_URL` = https://findmyuni.ro (era o adresă veche de probă)
- Fișiere: `docs/LEDGER.md`
- Poartă: NEVERIFICAT (doar setări, niciun cod)
- Urmează: grupa 4 (datele operatorului pe pagina de confidențialitate) de la echipă; apoi lansarea: funcțiile și catalogul în producție, setările Vercel de producție (cheia publică Turnstile), `main`, publicare și verificarea pe site

### 2026-10-22 21:30 — a doua verificare a taxelor
- Cerut: reluarea verificării pentru fișele rămase neverificate, imediat
- Făcut: șase agenți au reluat 333 de fișe (315 neverificate + 18 nesigure) deschizând direct paginile oficiale de taxe: acum 706 din 751 confirmate, 45 neverificate (site-uri blocate sau taxe nepublicate). 11 niveluri schimbate cu aprobarea echipei (Pisa, Humanitas, San Raffaele, LUM → medie; Gdańsk, Jagiellonă, Łódź, UEK, Wrocław → medie, programele în engleză; SSE Riga → medie; ISM Vilnius → mare), cu textele de cost potrivite; Hotelschool rămâne „mare” (decizia echipei); fișa Bournemouth corectată (reducerea pentru UE începe în 2027). Detalii în `docs/taxe.md`
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `docs/taxe.md`
- Poartă: TRECUT (gate.mjs)
- Urmează: cele 45 rămase, de verificat de un om sau mai târziu

### 2026-10-22 19:30 — intervale de taxă în euro, verificate pe surse oficiale
- Cerut: intervale de sume în euro pentru fiecare nivel de taxă
- Făcut: pragurile echipei (taxa de școlarizare pe an, fără cazare și masă): fără taxă 0 €, mică până la 2.000 €, medie 2.000–6.000 €, mare peste 6.000 €; scrise sub butoanele filtrului. Șase agenți au căutat taxele pe pagini oficiale: 436 din 751 fișe confirmate, 315 neverificate (porția de căutări terminată, site-uri care refuză), lăsate cum erau. 12 niveluri schimbate cu aprobarea echipei (ETH, EPFL, UZH → medie; St. Gallen, Lugano → mare; LUMSA → medie; AGH → medie; EAMT → mică; Titu Maiorescu, Vasile Goldiș, Dimitrie Cantemir → mică; Petre Andrei → medie), cu textele de cost de pe fișe potrivite noului nivel; 18 propuneri nesigure nefăcute. Metoda, schimbările și lista pentru a doua rundă: `docs/taxe.md`
- Fișiere: `apps/web/data/universities-ro.json`, `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/lib/labels.ts`, `apps/web/components/UniversitySearch.tsx`, `docs/taxe.md`
- Poartă: TRECUT (gate.mjs); local: intervalele apar în filtru, fișa Titu Maiorescu arată „Taxă mică” și noul text
- Urmează: a doua rundă pentru cele 315 fișe neverificate, când se reface porția de căutări

### 2026-10-22 17:40 — explicația nivelurilor de taxă
- Cerut: să scrie cam în ce buget se încadrează fiecare nivel; „Nimic (doar fără taxă)” → „Fără taxă”
- Făcut: nivelurile din date au fost puse comparând universitățile, nu după sume (unele fișe notează că nivelul nu a fost comparat în bani), așa că echipa a ales explicația în cuvinte, fără sume: sub butoane, câte un rând pe nivel cu țările unde cele mai multe fișe au acel nivel (fără taxă: stat România pe buget, Germania, Danemarca; mică: Franța, Italia, Spania; medie: Olanda, Irlanda, Lituania; mare: Marea Britanie, SUA, Canada) și „Nivelurile sunt orientative; ce plătești la o universitate anume scrie pe fișa ei” (toate fișele au nota de cost)
- Fișiere: `apps/web/lib/labels.ts`, `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (gate.mjs); văzut local în panoul „Mai multe filtre”
- Urmează: dacă vreți sume în euro, praguri stabilite de echipă și verificarea tuturor fișelor față de ele

### 2026-10-22 17:10 — filtrul de taxă mai clar și „Arată încă 10”
- Cerut: cine alege „taxă mare” să vadă și universitățile cu taxă medie, mică sau fără taxă; deci mai mult de 10 rezultate
- Făcut: filtrul păstra deja tot ce e mai ieftin, dar butoanele („Taxă mare”) și limita de 10 (sortate după prestigiu, primele erau scumpe) ascundeau asta. Grupul se numește acum „Cât poți plăti pe an?”, cu „Nimic (doar fără taxă)”, „Până la o taxă mică”, „Până la o taxă medie”, „Oricât”; eticheta filtrului activ: „Buget: …”; sub listă, „Arată încă 10” (revine la 10 când se schimbă căutarea sau filtrele), fără număr total afișat; titlul „Universități pentru tine”. Ordinea a rămas: prestigiu, apoi taxa mai mică
- Fișiere: `apps/web/components/UniversitySearch.tsx`, `apps/web/lib/labels.ts`, `apps/web/app/universitati/page.tsx`, `apps/web/lib/types.ts`
- Poartă: TRECUT (gate.mjs); local: „Oricât” → primele 10 (8 mari, 2 mici), după 6 apăsări 70 (21 mari, 2 mici, 47 fără taxă); „Până la o taxă mică” → doar mici și fără taxă, câte 10
- Urmează: echipa încearcă pe linkul de probă

### 2026-10-22 16:40 — pagini de eroare prietenoase
- Cerut: când se strică ceva, elevul să vadă un mesaj simplu, nu un ecran alb; machetele arătate înainte, echipa a ales a doua idee fără scurtăturile de jos
- Făcut: `app/error.tsx`: antetul site-ului, desenul cu tocul și drumul întrerupt, „Ups, drumul s-a întrerupt aici”, „nu e vina ta” și butonul „Încearcă din nou”; nimic tehnic pe ecran. `app/global-error.tsx` pentru cazul rar în care nu pornește tot site-ul: pagină simplă cu culorile ei. Pagina „Nu am găsit pagina” a rămas cum era
- Fișiere: `apps/web/app/error.tsx`, `apps/web/app/global-error.tsx`, `apps/web/components/Illustrations.tsx`
- Poartă: TRECUT (gate.mjs); verificat local cu o pagină de probă stricată intenționat (ștearsă după)
- Urmează: echipa vede pe linkul de probă

### 2026-10-22 16:10 — pregătire pentru Google
- Cerut: ca paginile cu universități, facultăți și ghiduri să fie găsite mai ușor în Google
- Făcut: `/sitemap.xml` cu toate paginile publice (1.277: paginile principale, categoriile, ghidurile, fișele de universități și de facultăți), generat din date; `/robots.txt`: pe site-ul public totul în afară de cont, administrare, conectare, rezultat și chestionar, iar pe linkurile de probă nimic; o singură adresă: pe site-ul public, www și vercel.app trimit (308) spre findmyuni.ro (`proxy.ts`, doar când `VERCEL_ENV=production`); titluri și descrieri pentru fișe (universitate: „admitere, costuri, programe”, cu orașul și descrierea), facultăți, categorii și paginile principale; titlul general „FindMyUni — alege facultatea potrivită”. Search Console rămâne pentru lansare (echipa face contul Google, Claude pune rândul de verificare în Cloudflare)
- Fișiere: `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts`, `apps/web/lib/seo.ts`, `apps/web/lib/seo.test.ts`, `apps/web/proxy.ts`, `apps/web/app/layout.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/app/universitati/[id]/[facultate]/page.tsx`, `apps/web/app/specializari/page.tsx`, `apps/web/app/specializari/[categorie]/page.tsx`, `apps/web/app/universitati/page.tsx`, `apps/web/app/studenti/page.tsx`
- Poartă: TRECUT (gate.mjs); local: sitemap cu 1.277 adrese (una din 30 verificată, toate 200), robots blochează tot în afara site-ului public, titlurile și descrierile apar pe fișe
- Urmează: la lansare, Google Search Console; redirecționarea se vede abia pe site-ul public

### 2026-10-21 03:40 — prima pagină: salut în locul butoanelor când ești conectat
- Cerut: conectat, cele două butoane de pe prima pagină dispar; deconectarea din cont le aduce înapoi
- Făcut: conectat, sub urare apare „👋 Bine ai revenit, <nume>!” în locul butonului mare „Contul meu” (contul rămâne în meniul de sus); „Deconectare” și ștergerea contului duc acum pe prima pagină (înainte ajungeai pe pagina de conectare, pentru că pagina contului trimitea acolo pe oricine nu mai e conectat)
- Fișiere: `apps/web/components/WelcomeActions.tsx`, `apps/web/app/cont/page.tsx`
- Poartă: TRECUT (gate.mjs); parcurs local: conectat → salut fără butoane; „Deconectare” → prima pagină cu „Intră în cont” și „Continui fără cont”
- Urmează: echipa încearcă pe linkul de probă

### 2026-10-21 03:15 — universități favorite și adresa findmyuni.ro în linkuri
- Cerut: (1) adresa nouă peste tot; (5) universități favorite, cu inimioară pe fișa universității, afișate în „Contul meu”
- Făcut: (1) `metadataBase` = https://findmyuni.ro (previzualizările pe WhatsApp/Facebook arată adresa nouă) și textul imaginii de previzualizare „Logoul FindMyUni” (era „UniPath”). (5) tabel nou `favorites` (cel mult 30 pe elev, doar ale lui, fără dubluri) în `convex/favorites.ts`; butonul „♡ Adaugă la favorite” / „♥ La favorite” pe fișa universității; fără cont deschide fereastra de cont pe „cont nou”, iar universitatea se adaugă singură după conectare; în „Contul meu”, secțiunea „Universități favorite” (nume, oraș, țară, link, „Scoate”); favoritele apar în „Datele mele” și în copia descărcată, se șterg odată cu contul; pagina de confidențialitate le pomenește
- Fișiere: `apps/web/convex/favorites.ts`, `apps/web/convex/favorites.test.ts`, `apps/web/convex/schema.ts`, `apps/web/convex/retention.ts`, `apps/web/convex/account.ts`, `apps/web/components/FavoriteButton.tsx`, `apps/web/components/WelcomeDialog.tsx`, `apps/web/lib/pendingSave.ts`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/app/cont/datele-mele/page.tsx`, `apps/web/app/confidentialitate/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/opengraph-image.alt.txt`
- Poartă: TRECUT (gate.mjs); parcurs local: inimioară fără cont → fereastra „Fă-ți un cont” → conectare cu contul de probă → „Am adăugat … la favorite” și lista în cont; inimioara cu cont pune și scoate; „Datele mele” arată favoritele
- Urmează: echipa încearcă pe linkul de probă; funcțiile Convex noi sunt doar pe baza de dezvoltare

### 2026-10-21 03:20 — cardul de cont primul pe pagina de rezultat
- Cerut: recomandarea de cont să fie la începutul paginii, imediat după terminarea chestionarului
- Făcut: cardul „Nu-ți pierde rezultatul” (și butonul de salvare pentru cine e conectat) mutat chiar sub titlul „Domeniile tale potrivite”, înaintea panoului „Ce-ar fi dacă?” și a celor 3 domenii
- Fișiere: `apps/web/app/rezultat/page.tsx`
- Poartă: TRECUT (gate.mjs); verificat local, fără cont: ordinea e titlu → card → „Ce-ar fi dacă?” → domenii
- Urmează: echipa vede pe linkul de probă

### 2026-10-21 03:00 — la final de chestionar, recomandarea de a-ți face cont
- Cerut: cine face chestionarul fără cont să vadă la final de ce merită un cont
- Făcut: sub cele 3 domenii, pentru cine nu e conectat, un card „Nu-ți pierde rezultatul” cu 3 beneficii adevărate (îți păstrezi rezultatul; îl vezi de pe orice dispozitiv; gratuit și rapid) și butonul „Fă-mi cont și salvează”, care deschide fereastra de cont direct pe „cont nou” (plus „Ai deja cont? Intră și salvează”); rezultatul așteaptă pe dispozitiv și se salvează singur în cont după conectare. Scos textul vechi „fără parolă”. Reparat: fereastra de cont, mai înaltă decât ecranul, avea partea de sus (titlul, ×) tăiată și imposibil de derulat
- Fișiere: `apps/web/components/SaveResult.tsx`, `apps/web/components/WelcomeDialog.tsx`
- Poartă: TRECUT (gate.mjs); parcurs local: cardul apare, butonul deschide „Fă-ți un cont”, pe telefon fără derulare laterală, conectarea cu contul de probă duce în „Contul meu” cu „Am salvat rezultatul tău în cont”
- Urmează: echipa vede cardul pe linkul de probă

### 2026-10-21 02:30 — spațiu Convex sub limita gratuită
- Cerut: Convex avertiza „peste limitele planului gratuit”
- Făcut: consum: stocare 620 MB din 512 (tabelul `programs`, 98,6%, din care ~80% indexuri), Database I/O 1,33 GB din 1 GB pe lună (din încărcările catalogului), trafic 764 MB din 1 GB. Catalogul era încărcat de două ori (dezvoltare + o copie veche din 11 octombrie în producție, nefolosită). Golit tabelul `programs` din producție (`npx convex import --replace` cu fișier gol); producția nu avea conturi, păreri sau rezultate, deci nu s-a pierdut nimic. `institutions` din producție (8 MB) a rămas; dezvoltarea și linkul de probă neatinse
- Fișiere: `docs/LEDGER.md`
- Poartă: NEVERIFICAT (nu e cod; verificat cu `npx convex data`)
- Urmează: la lansare, catalogul se încarcă în producție și se scoate din dezvoltare (altfel iar depășim); fără reîncărcări mari ale catalogului până la 1 noiembrie (Database I/O)

### 2026-10-21 02:00 — cheia Resend pusă în producție
- Cerut: legarea emailurilor de Resend; echipa face cheia, Claude face restul
- Făcut: în Convex Production: `AUTH_EMAIL_FROM` = „Echipa FindMyUni <echipa@findmyuni.ro>” (pus de Claude) și `AUTH_RESEND_KEY` (cheia făcută și lipită de echipă; ajunsese în Development și a fost mutată în Production cu `npx convex env`, fără să fie afișată, apoi ștearsă din Development, unde conturile de probă au adrese inventate). Verificat doar că valoarea are forma unei chei Resend
- Fișiere: `docs/LEDGER.md`
- Poartă: NEVERIFICAT (niciun email trimis încă; Resend încă verifică domeniul)
- Urmează: primul email de probă când baza de producție e pregătită; de văzut avertismentul Convex „peste limitele planului gratuit”

### 2026-10-21 01:10 — paginile apar mai repede după clic
- Cerut: diferența de viteză nu se simțea destul
- Făcut: măsurat de la clic până la pagina așezată: ~0,3 s până la titlu, apoi încă ~0,7–1 s de animație de intrare („rise”, 0,6 s plus întârzieri), deci butoanele „se mișcau greu”. Animația scurtată la 0,25 s și întârzierile la 30%; linkurile din antet și norișorii aduc pagina dinainte (`prefetch`), ca un clic să nu mai aștepte serverul
- Fișiere: `apps/web/app/globals.css`, `apps/web/components/NavLinks.tsx`, `apps/web/components/NavBubbles.tsx`
- Poartă: TRECUT (gate.mjs) și măsurat pe linkul de probă
- Urmează: echipa încearcă linkul de probă nou

### 2026-10-21 00:45 — site mai rapid la clic
- Cerut: butoanele reacționau greu și paginile se deschideau încet
- Făcut: măsurat: în browser nicio încetinire; fiecare pagină se construia pe un server din SUA (Washington), ~0,3 s pe clic fără niciun semn pe ecran. Serverul mutat la Frankfurt (`apps/web/vercel.json`, `regions: fra1`) și `app/loading.tsx`: la clic apare pe loc antetul cu „Se încarcă…”, până vine pagina. Securitatea neschimbată
- Fișiere: `apps/web/vercel.json`, `apps/web/app/loading.tsx`
- Poartă: TRECUT (gate.mjs) și măsurat pe linkul de probă
- Urmează: echipa încearcă linkul de probă nou; dacă tot e lent, pagini gata făcute (cer slăbirea regulii de scripturi)

### 2026-10-21 00:20 — domeniul findmyuni.ro legat de Resend și de site
- Cerut: legarea domeniului cumpărat de Resend (emailurile cu cod) și de Vercel (site-ul); pe domeniu, versiunea de acum
- Făcut: în Cloudflare, cele 4 înregistrări Resend (DKIM, `send`, `rsend`, `_dmarc`), verificarea Resend pornită (în așteptare), urmărirea clicurilor oprită; în Vercel, `findmyuni.ro` și `www.findmyuni.ro` adăugate la proiectul `unipath`, cu două CNAME în Cloudflare (fără proxy); Vercel le-a confirmat, ambele răspund cu 200 pe HTTPS și arată versiunea de pe `main`
- Fișiere: `docs/productie.md`, `CLAUDE.md`
- Poartă: NEVERIFICAT (doar documente schimbate; site-ul verificat direct pe ambele adrese)
- Apoi: versiunea nouă (ramura `production`) publicată ca link de probă Vercel https://unipath-r4e1h2toc-william-b4f6.vercel.app (refăcut după a doua verificare a taxelor), cu baza de dezvoltare (setările de probă ale Vercel arată spre baza de producție, goală, așa că am dat adresa bazei de dezvoltare doar la această publicare); se vede doar cu contul Vercel; poarta TRECUT înainte; căutarea de programe merge
- Urmează: Resend să treacă pe Verified; echipa pune cheia Resend și `AUTH_EMAIL_FROM` în Convex

### 2026-10-20 02:10 — pregătire pentru producție: anti-robot la cont, ștergere automată, copii de rezervă, ghid
- Cerut: produs sigur pentru elevi și pentru echipă (acces la tot, să nu fiți blocați de un atacator), site care nu cade dacă e bombardat, GDPR bun; firma la final; lucru autonom pe pachete
- Făcut: (atacuri) toate funcțiile publice citesc un număr limitat de rânduri; căsuța „Nu sunt robot” (Cloudflare) și la crearea contului și la „Am uitat parola”, verificată pe server prin `convex/turnstile.ts` (folosit și de formularul de păreri), ca un robot să nu poată consuma limitele generale; (teste) fără HTML brut în pagini, antetele de securitate prezente, administrarea trimite la conectare, sonda Convex fără cont: nimic scăpat; (GDPR) ștergere zilnică automată `convex/retention.ts` + `convex/crons.ts`: cont neconfirmat 7 zile, păreri respinse 30, necitite 90, chestionare fără nume 12 luni, statistici pe zile 24 de luni, parole greșite 2 zile; contoarele de încercări păstrate sub amprentă SHA-256; ștergerea contului folosește aceeași funcție; termenele scrise pe pagina de confidențialitate și în `docs/gdpr.md`; (administrare) buton „Șterge definitiv” pentru păreri; (copii de rezervă) `scripts/backup.mjs`: copie criptată (AES-256-GCM, parolă aleasă de voi) într-un dosar din afara proiectului, probată pe dezvoltare (făcută și deschisă la loc); (ghid) `docs/productie.md`: 2FA și al doilea om pe fiecare cont, copii de rezervă, ce faceți la un atac (Attack Challenge Mode în Vercel), limite de cheltuieli, procedura pentru scurgeri de date, lista de dinainte de lansare
- Fișiere: `apps/web/convex/turnstile.ts`, `apps/web/convex/retention.ts`, `apps/web/convex/crons.ts`, `apps/web/convex/retention.test.ts`, `apps/web/convex/auth.ts`, `apps/web/convex/authLimits.ts`, `apps/web/convex/account.ts`, `apps/web/convex/reviews.ts`, `apps/web/convex/schema.ts`, `apps/web/components/SignInForm.tsx`, `apps/web/app/admin/pareri/page.tsx`, `apps/web/app/confidentialitate/page.tsx`, `scripts/backup.mjs`, `docs/productie.md`, `docs/gdpr.md`, `.env.example`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire; 35 de teste pentru baza de date); în browser: căsuța „Nu sunt robot” la „Am uitat parola”, verificată pe server, apoi cod trimis; copie de rezervă făcută și deschisă la loc pe baza de dezvoltare
- Neverificat: scanarea ZAP (lipsește Docker pe calculator; rulează pe GitHub după ce versiunea ajunge pe `main`); copia de rezervă a producției (nu am rulat-o: producția nu are încă versiunea nouă); butonul „Șterge definitiv” nu a fost apăsat în browser (testat automat); ce face Convex pe planul gratuit la depășirea cotei
- Urmează: echipa face pașii marcați „(voi)” din `docs/productie.md`; la final operatorul și juristul

### 2026-10-20 01:49 — pagina de confidențialitate completă, „Datele mele”, scanare de securitate
- Cerut: confidențialitate conformă cu legea (GDPR), teste de securitate; butonul de descărcare scos din „Contul meu” și înlocuit cu o pagină separată, deschisă doar dacă elevul vrea
- Făcut: pagina de confidențialitate rescrisă: operatorul (de completat de echipă), date, scop și temei legal pentru fiecare prelucrare, cât păstrăm (unde nu ștergem automat, scrie așa), firmele care prelucrează date și transferul în SUA cu garanțiile din paginile lor oficiale, toate drepturile, plângere la ANSPDCP, cont de la 16 ani și păreri de la 18, recomandarea fără efect juridic, securitate, ce facem la o scurgere de date; corectat: rezultatele chestionarului ajung la noi ca statistici fără nume. Pagină nouă `/cont/datele-mele` (doar conectat, link mic din „Contul meu” și din pagina de confidențialitate): tot ce păstrăm despre cont, cu nume citibile, și „Descarcă o copie”. `docs/gdpr.md`: lista GDPR, registrul prelucrărilor, contractele cu firmele, puncte pentru jurist. Securitate: `.github/workflows/dast.yml` (scanare ZAP pasivă a site-ului pornit în GitHub, fără secrete), `.zap/rules.tsv`, `scripts/convex-probe.mjs` (verifică fără cont doar interogările bazei de dezvoltare; refuză producția), `docs/securitate.md` (ce rulează automat și o listă de 30 de minute de încercări manuale)
- Fișiere: `apps/web/app/confidentialitate/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/app/cont/datele-mele/page.tsx`, `docs/gdpr.md`, `docs/securitate.md`, `.github/workflows/dast.yml`, `.zap/rules.tsv`, `scripts/convex-probe.mjs`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); în browser: „Datele mele” fără cont trimite la conectare, conectat arată datele cu nume citibile; pagina de confidențialitate se deschide; sonda Convex pe baza de dezvoltare nu a găsit date scăpate
- Neverificat: scanarea ZAP nu a rulat încă (pe calculator nu e Docker; rulează pe GitHub după salvare); încercările manuale din `docs/securitate.md` nu au fost făcute; numele, emailul și adresa operatorului lipsesc; textul trebuie citit de un jurist
- Urmează: echipa completează datele operatorului; un jurist citește pagina și `docs/gdpr.md`; contractele de prelucrare cu Convex, Resend, Cloudflare, Vercel

### 2026-10-20 01:44 — limite la conturi, cont de la 16 ani, copia datelor mele
- Cerut: pregătire pentru lansare (rate limiting, GDPR); echipa a ales limitarea încercărilor, cont doar de la 16 ani (până confirmă un jurist vârsta din România) și pagina de confidențialitate completată
- Făcut: `convex/authLimits.ts` (limitatorul deja instalat): conturi noi 3/oră pe email și 60/oră pe site; coduri pentru parolă uitată 5/oră pe email și 200/oră pe site; pași de conectare 30/oră pe nume de utilizator (și pentru nume inexistente); verificarea „nume liber” devine o mutație numărată (120/minut pe site). Crearea contului cere bifa „Am cel puțin 16 ani”, verificată și pe server. `account.exportMine`: copia datelor contului (fără parolă), pentru butonul „Descarcă datele mele”. Teste noi în `convex/account.test.ts`
- Fișiere: `apps/web/convex/authLimits.ts`, `apps/web/convex/auth.ts`, `apps/web/convex/account.ts`, `apps/web/convex/account.test.ts`, `apps/web/components/SignInForm.tsx`, `.env.example`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire) după o reparație: testul nou nu trecea verificarea de tipuri; în browser: fără bifa de 16 ani contul e refuzat, cu ea se trimite codul
- Neverificat: Convex nu vede adresa IP, deci limitele sunt pe email, nume și pe tot site-ul; vârsta de 16 ani trebuie confirmată de un jurist
- Urmează: scanarea de securitate pe GitHub, pagina de confidențialitate și lista GDPR (în lucru)

### 2026-10-19 23:19 — Politehnica din Atena revine în catalogul Greciei
- Cerut: universitățile grecești scoase să revină doar dacă sursa e 100% sigură
- Făcut: regulă nouă: o universitate fără sediu confirmat dintr-o lege revine doar dacă toate facultățile ei din listele oficiale ale ministerului sunt în același oraș, iar orașul ei este acela (scris așa în README, nu „sediu legal”). A revenit Politehnica din Atena (ΕΜΠ, 9 programe, toate la Atena). Rămân scoase Universitatea din Atena (Atena și Psachna), Creta (Heraklion și Rethymno) și Macedonia de Vest (cinci orașe). Grecia: 21 de instituții, 335 de programe; catalogul: 4.334 de instituții, 107.155 de programe; încărcat în baza de dezvoltare
- Fișiere: `scripts/data/gr/build.mjs`, `scripts/data/gr/README.md`, `apps/web/data/catalog/gr-*.json`, `apps/web/data/catalog/index.json`, `docs/catalog-status.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); Grecia VALID; în browser, fișa Politehnicii din Atena arată programele ei oficiale
- Neverificat: —
- Urmează: echipa decide dacă încărcăm catalogul în baza de producție

### 2026-10-19 17:37 — catalogul de programe: 7 țări noi (18 în total)
- Cerut: cât mai multe informații, din țările UE fără catalog; întâi cercetare, apoi doar surse oficiale cu voie de refolosire; „ce e neclar sau nesigur nu intră”
- Făcut: cercetare pentru 13 țări (Europass/DEQAR și surse naționale); echipa a ales cele 7 cu licență clară. Construite, fiecare cu scriptul și README-ul ei: Suedia 1.725 de programe (CC0), Bulgaria 2.402 (Europass + DEQAR), Finlanda 1.118 (Europass), Lituania 694 (data.gov.lt), Slovenia 333 (eVŠ + apelul de înscriere 2026/2027), Grecia 326 (data.gov.gr), Estonia 361 (EHIS, CC BY-SA). Rândurile și câmpurile nesigure au fost scoase (de exemplu: orașe neclare, titluri de anunț în loc de nume de program, dubluri; în Grecia 4 universități fără sediu confirmat dintr-un text oficial). Catalogul: 4.333 de instituții, 107.146 de programe în 18 țări; încărcat în baza de dezvoltare. Sursele și licențele sunt în `scripts/data/sources.json` (apar pe pagina „Surse de date”)
- Fișiere: `scripts/data/{se,bg,fi,lt,si,gr,ee}/build.mjs` și `README.md`, `apps/web/data/catalog/{se,bg,fi,lt,si,gr,ee}-*.json`, `apps/web/data/catalog/index.json`, `scripts/data/sources.json`, `docs/catalog-status.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); toate cele 7 țări VALID; în browser: căutarea de programe în Finlanda și lista oficială pe fișa Lund
- Neverificat: baza de producție nu are încă datele noi; Portugalia și Danemarca așteaptă confirmarea licenței; Letonia, Cehia, Cipru și Malta nu au o sursă care să se poată folosi acum
- Urmează: echipa decide dacă încărcăm în producție și dacă cere confirmarea licenței pentru Portugalia și Danemarca

### 2026-10-19 03:52 — conturi cu nume de utilizator, parolă și cod pe email
- Cerut: la crearea contului nume, parolă și email; emailul cerut doar atunci și confirmat cu un cod primit pe email; apoi conectare doar cu nume și parolă; emailul să vină de la echipa FindMyUni. Echipa a ales: nume de utilizator unic (plus numele complet), fără Google, parolă de minimum 8 caractere, totul construit local până la domeniul propriu
- Făcut: conectarea prin link și Google înlocuită cu parolă (Convex Auth Password). Contul nou: nume de utilizator, nume complet, email, parolă, apoi codul din 6 cifre trimis pe email. Conectarea: nume de utilizator + parolă; serverul găsește singur emailul contului, care nu ajunge niciodată în browser. „Am uitat parola”: cod pe emailul contului și parolă nouă (același răspuns dacă numele nu există). Parola se păstrează doar ca amprentă (scrypt); încercările greșite sunt limitate. Rolul de administrator se dă doar după ce emailul e confirmat. Emailurile au expeditorul „Echipa FindMyUni” (pe adresa de probă Resend până la domeniul propriu). Pagina „Contul meu” arată numele de utilizator; textele ferestrei de cont, paginii de conectare și paginii de confidențialitate actualizate; notițele proiectului (CLAUDE.md, production-plan) spun noua hotărâre
- Fișiere: `apps/web/convex/auth.ts`, `apps/web/convex/users.ts`, `apps/web/convex/account.ts`, `apps/web/convex/schema.ts`, `apps/web/lib/username.ts`, `apps/web/lib/username.test.ts`, `apps/web/components/SignInForm.tsx`, `apps/web/components/WelcomeDialog.tsx`, `apps/web/app/conectare/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/app/confidentialitate/page.tsx`, `apps/web/lib/pendingSave.ts`, `.env.example`, `CLAUDE.md`, `docs/production-plan.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); în browser, pe baza de dezvoltare, cu contul de probă: cont nou → cod din jurnal → „Contul meu”; deconectare; parolă greșită refuzată; conectare cu nume și parolă; nume deja folosit refuzat cu mesaj clar; „Am uitat parola” → cod → parolă nouă → conectat. Verificarea de secrete a semnalat greșit textul „new-password” (indiciu pentru browser, nu o parolă); rândul a fost rescris, regula porții nu a fost atinsă
- Neverificat: trimiterea unui email adevărat (pe dezvoltare codul apare în `npx convex logs`); funcționarea pe baza de producție; expeditorul „Echipa FindMyUni” cu adresa proprie are nevoie de un domeniu verificat în Resend
- Urmează: la final, echipa cumpără un domeniu, îl verifică în Resend și pune AUTH_RESEND_KEY și AUTH_EMAIL_FROM în setările Convex

### 2026-10-19 03:18 — lupă de căutare pe pagina de ghiduri
- Cerut: pe pagina cu ghidurile pe țări, o lupă ca să cauți direct țara
- Făcut: câmp de căutare cu lupă deasupra ghidurilor; lista se filtrează pe măsură ce scrii, fără să conteze diacriticele („elvetia” găsește Elveția); dacă nu există ghid, un mesaj scurt
- Fișiere: `apps/web/components/GuideFinder.tsx`, `apps/web/app/ghiduri/page.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); în browser: „elvetia” → doar Elveția, „Japonia” → mesajul că nu există ghid
- Neverificat: —
- Urmează: salvarea în Git

### 2026-10-19 02:59 — ghiduri pentru toate țările cu fișe (26 noi) și 15 fișe corectate
- Cerut: ghiduri „cum aplici” pentru toate țările în care avem fișe
- Făcut: 9 ajutoare au scris câte 2–3 ghiduri doar din paginile oficiale (pentru țările din afara UE și viza de student); 9 verificatori independenți le-au recitit (108 corecturi confirmate, 10 reformulări prudente). Acum 32 de ghiduri, câte unul pentru fiecare țară cu fișe. Verificatorii au găsit 15 fișe contrazise de paginile oficiale, corectate: 9 în Polonia (bursa socială nu e pentru orice cetățean UE), Lund, NTNU, RISEBA, SSE Riga, Turība, EAMT. Testul ghidurilor cere acum câte un ghid pentru fiecare țară cu fișe. Textul paginii de ghiduri spune „pentru un elev din România” (nu doar „cetățean UE”)
- Fișiere: `apps/web/data/guides.json`, `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/lib/guides.test.ts`, `apps/web/app/ghiduri/page.tsx`, `docs/de-verificat.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); pagina de ghiduri cu toate cele 32 de linkuri și ghidurile SUA, Moldova, Coreea, Elveția, Olanda deschise; fișa UW trimite la ghidul Poloniei
- Neverificat: verificarea a fost făcută de ajutoare automate, nu de un om; câteva site-uri oficiale de imigrare au refuzat accesul automat (ce nu s-a confirmat a fost scos); lista de lucruri de văzut de un om e la sfârșitul `docs/de-verificat.md`
- Urmează: echipa citește `docs/de-verificat.md`

### 2026-10-19 02:29 — norișor „Ghiduri pe țări” pe pagina principală
- Cerut: în loc de butonul mic cu ghidurile pe țări, încă un norișor
- Făcut: al cincilea nor, „Ghiduri pe țări” 🌍, pe pagina principală (pe calculator 3 + 2 nori, pe telefon câte 2 pe rând); linkurile mici spre ghiduri scoase din subsolul paginilor și de pe pagina Universități (rămâne linkul din fișa unei universități spre ghidul țării ei)
- Fișiere: `apps/web/components/NavBubbles.tsx`, `apps/web/components/Shell.tsx`, `apps/web/app/universitati/page.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); norii văzuți în browser pe calculator și pe telefon
- Neverificat: —
- Urmează: ghiduri pentru toate cele 26 de țări care au fișe și nu au ghid

### 2026-10-19 02:23 — pe pagina principală rămân norii
- Cerut: echipa a ales butoanele în formă de nori
- Făcut: varianta cu cercuri și adresa de comparație `/?forma=cerc` scoase; cele patru butoane sunt doar nori
- Fișiere: `apps/web/components/NavBubbles.tsx`, `apps/web/app/page.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); pagina principală are cei patru nori
- Neverificat: —
- Urmează: ideile în plus pentru pagina principală, dacă echipa le vrea (nori care plutesc, drum între ei, urare după ora din zi)

### 2026-10-19 02:18 — numerele site-ului scoase de peste tot
- Cerut: niciun număr care arată cât de mari sunt datele noastre (echipa le păstrează confidențiale)
- Făcut: scoase totalurile de programe, instituții și țări (Programe, Surse, căutarea de programe și listele ei), numărul de universități din ghiduri, câte facultăți și programe are o universitate, câte specializări are o categorie sau un domeniu, câte păreri avem (pagina Studenți, cardurile și fișele universităților), câte rezultate are o căutare, câte orașe sunt în listă, câte programe are un domeniu pe pagina de rezultat și câți elevi au făcut chestionarul; contorul public al chestionarelor a fost scos și din baza de date (funcția publică `quizCount` și testul ei), cifrele rămân doar în pagina de statistici a administratorilor. Au rămas, pentru că nu spun nimic despre date: „Întrebarea 3 din 18”, „Ai ales 2 din 3”, „Top 10”
- Fișiere: `apps/web/app/{ghiduri,programe,surse,test,universitati/[id]}/…`, `apps/web/components/{CategoryTiles,DomainDetails,DomainPrograms,FacultyPrograms,OfficialPrograms,ProgramGroups,ProgramSearch,StudentVoices,UniversityCard,UniversityList,UniversityOpinions,UniversitySearch}.tsx`, `apps/web/convex/analytics.ts`, `apps/web/convex/analytics.test.ts`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); 13 pagini scanate fără numere de date, Programe, o fișă de universitate și Studenți citite în browser
- Neverificat: baza de producție are încă vechea funcție publică până la următoarea publicare a funcțiilor Convex în producție
- Urmează: alegerea nori / cercuri pentru pagina principală

### 2026-10-19 02:10 — orașele din căutare se pot strânge la loc
- Cerut: după „Vezi toate orașele”, să poți restrânge din nou lista
- Făcut: butonul „Arată mai puține” apare sub lista completă de orașe și o readuce la primele orașe (orașele alese rămân vizibile)
- Fișiere: `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); în browser: 12 orașe → toate 22 → înapoi la 12
- Neverificat: —
- Urmează: alegerea nori / cercuri pentru pagina principală

### 2026-10-19 02:04 — scoase cifrele de pe pagina principală
- Cerut: „FindMyUni în cifre” să dispară; echipa vrea ca aceste date să rămână confidențiale
- Făcut: secțiunea cu cele patru cifre (fișe, specializări, păreri, instituții) scoasă de pe pagina principală
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); pagina principală citită în browser, fără cifre
- Neverificat: alte pagini încă arată numere (de exemplu pagina de programe și pagina de surse, cu totalul catalogului); echipa hotărăște dacă le scoatem și de acolo
- Urmează: alegerea nori / cercuri și ideile în plus pentru pagina principală

### 2026-10-19 02:02 — pagina principală nouă: bun venit, desen și butoane-nor
- Cerut: când intri pe site, o pagină cu desen, urarea de bun venit și alegerea „cont / fără cont”; mai jos butoanele Specializări, Universități, Chestionar, Studenți în nori sau cercuri; fără butonul „Conectare” sus
- Făcut: pagina principală începe cu „Bine ai venit pe FindMyUni!”, desenul de acum și butoanele „Intră în cont” (deschide fereastra de cont) și „Continui fără cont” (coboară la butoane); dedesubt „De unde vrei să începi?” cu cele patru butoane ca nori (implicit) sau cercuri (`/?forma=cerc`, ca echipa să compare), apoi cifrele; fereastra de bun venit nu mai apare singură; „Conectare” scos din bara de sus, „Contul meu” apare doar celor conectați
- Fișiere: `apps/web/app/page.tsx`, `apps/web/components/NavBubbles.tsx`, `apps/web/components/WelcomeActions.tsx`, `apps/web/components/WelcomeDialog.tsx`, `apps/web/components/NavLinks.tsx`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); pagina văzută în browser pe calculator și pe telefon, fereastra de cont se deschide și se închide
- Neverificat: varianta pentru cineva deja conectat („Contul meu” pe pagina principală și în bară) nu a fost văzută în browser
- Urmează: echipa alege nori sau cercuri și ideile în plus (nori care plutesc, drum între ei, urare după ora din zi)

### 2026-10-19 01:52 — numele site-ului devine FindMyUni
- Cerut: noul nume ales de echipă, FindMyUni (scris legat), doar în versiunea nouă; logo-ul și imaginile rămân până la un logo nou
- Făcut: „UniPath” înlocuit cu „FindMyUni” în antet (FindMy + Uni colorat), titlurile din tab, textele paginilor, fereastra de bun venit, paginile de administrare, emailul de conectare și mențiunile din sursele de date
- Fișiere: `apps/web/components/Shell.tsx`, `apps/web/components/WelcomeDialog.tsx`, `apps/web/app/**/page.tsx`, `apps/web/app/layout.tsx`, `apps/web/convex/auth.ts`, `apps/web/data/catalog/index.json`, `scripts/data/sources.json`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire); antetul și titlul văzute în browser
- Neverificat: logo-ul, iconița și imaginea de distribuire încă au scris „UniPath” (de schimbat când există un logo nou); adresa publică și numele proiectului Vercel au rămas „unipath”; emailul de conectare nu a fost trimis de probă
- Urmează: logo nou FindMyUni, când îl are echipa

### 2026-10-15 02:16 — patru universități noi cu fișă în Australia
- Cerut: continuarea rundei „minimum 10 universități în fiecare țară”, pentru Australia
- Făcut: un ajutor a căutat universitățile australiene care publică cerințele pentru bacalaureatul românesc și a scris 4 fișe (Macquarie, Newcastle, Australian Catholic University, Edith Cowan); un verificator independent le-a recitit și a corectat 9 lucruri (de exemplu: la ACU, cine a terminat liceul în afara Australiei aplică prin UAC pentru Sydney și Canberra). Australia are acum 8 fișe; aproape 20 de alte universități australiene nu scriu ce cer de la diploma românească. Acum 668 de universități în străinătate
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/university-sources.json`, `docs/de-verificat.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire)
- Neverificat: verificarea a fost făcută de ajutoare automate, nu de un om
- Urmează: echipa citește hotărârile din `docs/de-verificat.md`; legarea fișelor noi de catalogul de programe

### 2026-10-15 02:04 — minimum 10 universități cu fișă în fiecare țară (108 fișe noi)
- Cerut: în fiecare țară din aplicație cel puțin 10 universități cu fișă, alese dintre cele mai bune; fără fișă acolo unde site-ul oficial nu dă date complete și clare
- Făcut: ajutoare au ales universitățile (mai întâi cele mari de stat) și au scris fișele doar din paginile oficiale; alte ajutoare, independente, le-au recitit; 9 fișe au fost scoase (date neclare sau bacalaureatul românesc evaluat doar „caz cu caz”). Rezultat: 108 fișe noi, acum 664 de universități în străinătate; au ajuns la 10 Irlanda, Belgia, Elveția, Suedia, Canada, Finlanda, Norvegia, Cehia, Lituania, Grecia, Coreea de Sud. Sub 10, pentru că nu mai există universități cu date clare: Bulgaria 9, Letonia 8, Cipru 8, Portugalia 8, Moldova 7, Estonia 6, Hong Kong 6, Slovenia 4, Singapore 3, Malta 1. Fișa Porto corectată: bursa de stat portugheză e doar pentru cetățenii UE cu drept de ședere permanentă (regula DGES)
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/university-sources.json`, `docs/de-verificat.md`
- Poartă: TRECUT (secrete, fișiere, registru, build, teste, pornire)
- Neverificat: Australia încă în lucru (4 fișe; un ajutor caută universități care publică cerințele pentru bacalaureatul românesc); verificarea a fost făcută de ajutoare automate, nu de un om; fișele noi nu au încă lista oficială de programe pe pagina lor
- Urmează: Australia, apoi echipa citește hotărârile din `docs/de-verificat.md`

### 2026-10-14 10:16 — 236 de universități noi cu fișă în Marea Britanie, Germania, Franța, Italia, Danemarca și Olanda
- Cerut: câte 50 de universități noi cu fișă completă în fiecare dintre cele șase țări ale ghidurilor, cele mai mari și mai accesibile românilor (în Danemarca și Olanda toate câte există)
- Făcut: șase ajutoare au ales universitățile după datele oficiale de mărime (OfS în Anglia, Hochschulkompass în Germania, ministerul francez, USTAT în Italia, cu numărul de studenți cu bacalaureat românesc, registrele daneze și olandeze); 15 ajutoare au scris fișele doar din paginile oficiale; alte 15, independente, le-au recitit. Rezultat: 236 de fișe noi (50 Marea Britanie, 50 Germania, 49 Franța, 47 Italia, 22 Danemarca, 18 Olanda), acum 639 de universități cu fișă; la a doua citire 75 confirmate integral, 153 corectate (299 de corecturi confirmate, 23 reformulări prudente), 8 cu o parte neverificată. Patru universități alese au rămas fără fișă, pentru că site-ul lor nu se poate citi (Foggia, Insubria, Reggio Calabria, Grenoble Alpes). Corectate și patru fișe franceze mai vechi (cămin la Lyon 1, Lyon 3, Côte d'Azur; bursa de stat la Sciences Po). Ce nu s-a putut confirma și hotărârile luate sunt la sfârșitul `docs/de-verificat.md`
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/university-sources.json`, `docs/de-verificat.md`
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 134 de teste, aplicația pornește)
- Neverificat: fișele noi nu au încă lista oficială de programe pe pagina lor (legătura cu catalogul fiecărei țări nu e făcută); verificarea a fost făcută de ajutoare automate, nu de un om; un ajutor a citit zece site-uri italiene printr-o filă din Chrome-ul utilizatorului, ceea ce nu era permis (doar pagini publice, fila închisă; interdicție dată tuturor ajutoarelor după aceea)
- Urmează: legarea fișelor noi de catalogul de programe (Italia, Germania, Olanda, Franța); echipa citește hotărârile din `docs/de-verificat.md`

### 2026-10-14 03:21 — ghiduri pe țări: cum aplici în Olanda, Marea Britanie, Germania, Danemarca, Italia și Franța
- Cerut: ghiduri pentru cele șase țări unde merg cei mai mulți români; în aceeași cerere, câte 50 de universități noi cu fișă din fiecare țară (în lucru, vezi „Urmează”)
- Făcut: șase ghiduri scrise din paginile oficiale (platformele naționale de înscriere, ministerele și agențiile fiecărei țări) și recitite fiecare de un al doilea verificator independent: 41 de corecturi confirmate și 6 reformulări prudente. Fiecare ghid are pașii în ordine, actele, limba de predare, costul în cuvinte, bursele și împrumuturile, cazarea, „bine de știut” și linkurile oficiale; fără sume și fără date calendaristice. Pagini noi: `/ghiduri` și `/ghiduri/[tara]`. Se ajunge la ele din josul fiecărei pagini, dintr-un rând nou pe pagina „Universități” și de pe fișa fiecărei universități din cele șase țări; meniul de sus a rămas neschimbat. Găsit la verificare: regula oficială daneză pentru bacalaureatul românesc (liceu teoretic față de tehnologic sau vocațional); bursa de stat franceză pentru cetățenii UE are mai multe căi decât arăta o pagină oficială, iar fișele existente erau corecte
- Fișiere: `apps/web/data/guides.json` (nou), `apps/web/lib/guides.ts` (nou), `apps/web/lib/guides.test.ts` (nou), `apps/web/app/ghiduri/page.tsx` (nou), `apps/web/app/ghiduri/[tara]/page.tsx` (nou), `apps/web/lib/types.ts`, `apps/web/components/Shell.tsx`, `apps/web/app/universitati/page.tsx`, `apps/web/app/universitati/[id]/page.tsx`
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 134 de teste, aplicația pornește)
- Neverificat: aspectul ghidurilor pe telefon; câteva afirmații din ghidul Italiei vin din paginile unor universități, nu dintr-o sursă națională (scutirea de taxă pentru venituri mici, calculul venitului unei familii din străinătate); camerele din colegiile de la Oxford; verificarea a fost făcută de ajutoare automate, nu de un om
- Urmează: 240 de fișe noi de universități în cele șase țări (50 în Marea Britanie, Germania, Italia și Franța, 22 în Danemarca, 18 în Olanda — atâtea mai există în ultimele două), în scriere, apoi verificare dublă; de corectat nota de cămin la Lyon 1, Lyon 3 și Côte d'Azur și nota de bursă la Sciences Po

### 2026-10-14 00:14 — programele din România vin odată cu pagina
- Cerut: partea tehnică să răspundă cât mai repede; din măsurători, echipa a ales ca lista de programe din România să fie pusă direct în pagină
- Făcut: pe fișele universităților și facultăților din România, lista de programe de licență este scrisă de server în pagină, din fișierul catalogului (lista oficială HG 606/2026), în loc să fie cerută bazei de date după încărcare. Dispare „Se încarcă lista de programe...”; lista apare și dacă baza de date nu răspunde. Aspectul și conținutul sunt aceleași. Fișele din străinătate citesc în continuare lista din baza de date, pentru că acolo listele sunt prea mari. Lista grupată a devenit o componentă comună (`ProgramGroups`), folosită în ambele cazuri. Măsurători înainte de schimbare, pe versiunea de producție pornită local: server 13–18 ms pe pagină, lista de programe apărea după încă ~0,7 s
- Fișiere: `apps/web/lib/roPrograms.ts` (nou), `apps/web/lib/roPrograms.test.ts` (nou), `apps/web/components/ProgramGroups.tsx` (nou), `apps/web/components/OfficialPrograms.tsx`, `apps/web/components/FacultyPrograms.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/app/universitati/[id]/[facultate]/page.tsx`, `.claude/launch.json` (pornirea versiunii de producție pe portul 3100, pentru măsurători), `docs/ultimii-pasi.md`
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 131 de teste, aplicația pornește)
- Neverificat: viteza pe internet (măsurat doar pe calculator); paginile universităților mari sunt acum mai grele ca text (vezi cifrele din raport)
- Urmează: echipa hotărăște despre facultățile în căutare, codul mai puțin pe pagini și paginile gata făcute

### 2026-10-13 16:16 — a doua încercare pe punctele neconfirmate și verificarea completă a site-ului
- Cerut: verificarea de către asistent a listelor „de verificat”, apoi o verificare în amănunt a întregului site, ca să nu rămână erori
- Făcut: (1) Cinci ajutoare au reluat cele 99 de puncte pe care prima verificare nu le putuse confirma: 71 confirmate, 19 infirmate și corectate, 19 rămase necunoscute; aplicate 71 de schimbări în fișe (de exemplu: HU Berlin, care acum s-a deschis, are toate licențele în germană și înscriere prin uni-assist; Academia Forțelor Aeriene nu are locuri cu taxă și cere certificat de engleză; „atelierul de machete” de la Arhitectură Cluj și „cea mai mare universitate din țară” la UBB au fost confirmate și puse înapoi). (2) Hotărâri luate cu o regulă unică: „dosar” doar unde ceva din dosar se notează (25 de fișe), „Cămin: nu” la KTH și Copenhaga, autorizarea provizorie spusă la două facultăți ale Universității Româno-Americane. (3) Verificarea site-ului: toate cele 905 pagini se deschid fără erori și fără texte stricate; 4.248 de linkuri verificate (2 surse moarte reparate; restul sunt blocaje pentru roboți sau site-uri căzute: Galați, Apărare, fspac.ubbcluj.ro, agronomie.ucv.ro); chestionarul parcurs până la rezultat; căutarea cu orașe, căutarea de programe, formularul de păreri, fereastra de bun venit, redirecționarea paginilor cu cont și de administrare, antetele de securitate; aspectul la lățime de telefon pe șase pagini; verificarea de contradicții din date. Găsit și reparat: „4.117 de instituții” (corect „4.117 instituții”) pe două pagini, cu o regulă comună pentru numere și un test. Lista scurtă cu ce a rămas este în `docs/de-verificat.md`
- Fișiere: `apps/web/data/universities-ro.json`, `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/faculties-ro.json`, `apps/web/data/university-sources.json`, `apps/web/lib/labels.ts`, `apps/web/lib/universities.test.ts`, `apps/web/app/programe/page.tsx`, `apps/web/app/surse/page.tsx`, `apps/web/components/DomainPrograms.tsx`, `apps/web/components/FacultyPrograms.tsx`, `docs/de-verificat.md` (nou)
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 129 de teste, aplicația pornește)
- Neverificat: conectarea cu link pe email, salvarea rezultatului în cont, trimiterea reală a unei păreri și paginile de administrare cu un cont de administrator nu au fost parcurse în această rundă (doar că se deschid sau redirecționează corect); adresa de probă de pe Vercel; baza de producție; faptele din fișe nu au fost citite a treia oară; o eroare 500 văzută de câteva ori în consola browserului nu s-a mai reprodus și nu i s-a găsit sursa
- Urmează: echipa citește `docs/de-verificat.md`; reîncercat Galați și Apărare când site-urile răspund

### 2026-10-13 15:49 — orașe la căutarea de universități și o singură cifră „cu fișă completă”
- Cerut: la căutarea de universități, utilizatorul să poată alege și orașele, nu doar România; cele două cifre „cu fișă completă” de pe pagina principală să fie una singură
- Făcut: sub „Țara” apare acum un rând de orașe din care se pot alege mai multe: fără nicio țară aleasă sunt orașele din România, iar după alegerea unei țări sunt orașele ei (primele 12, cu „Vezi toate orașele”). La „În străinătate” fără țară apare îndemnul de a alege o țară. Orașele alese stau în adresa paginii (`oras=` repetat), apar ca filtre active și se șterg când se schimbă țara. Linkurile de pe cardurile de rezultat duc acum toate orașele alese în chestionar, nu doar unul. Pe pagina principală sunt din nou patru cifre: prima adună universitățile și facultățile cu fișă (877 acum)
- Fișiere: `apps/web/components/UniversitySearch.tsx`, `apps/web/lib/universities.ts`, `apps/web/lib/universities.test.ts`, `apps/web/lib/types.ts`, `apps/web/components/MatchCard.tsx`, `apps/web/app/page.tsx`
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 128 de teste, aplicația pornește)
- Neverificat: aspectul pe telefon; o eroare 500 apărută în consola browserului, a cărei sursă nu am găsit-o (jurnalul serverului local nu arată nicio eroare)
- Urmează: un om parcurge `docs/de-verificat-facultati.md`; echipa hotărăște dacă facultățile intră în căutare

### 2026-10-13 15:44 — a cincea cifră pe pagina principală: facultățile din România cu fișă
- Cerut: adăugarea cifrei cu facultățile din România care au fișă în „UniPath în cifre”
- Făcut: pagina principală arată acum cinci cifre; cea nouă, „facultăți din România cu fișă proprie”, se calculează din date (474 acum) și duce la universitățile din România. Pe ecran lat cifrele stau pe un rând de cinci; pe telefon, pe două coloane, cu ultima pe toată lățimea
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 127 de teste, aplicația pornește)
- Neverificat: aspectul pe telefon (văzut doar la lățimea panoului de browser)
- Urmează: un om parcurge `docs/de-verificat-facultati.md`; echipa hotărăște dacă facultățile intră în căutare

### 2026-10-13 15:38 — fișe pentru încă 367 de facultăți din România, fiecare citită de două ori
- Cerut: cât mai multe facultăți din România cu fișă integrală; echipa a ales toate cele 385 rămase, cu verificare dublă
- Făcut: șaptesprezece ajutoare au scris fișele doar din paginile și regulamentele oficiale deschise, apoi alți șaptesprezece, independenți, le-au recitit pe site-urile oficiale. Rezultat: 367 de fișe noi (acum 474 de facultăți cu fișă din 492 din lista oficială); la a doua citire 222 confirmate integral, 141 corectate (185 de corecturi confirmate, 11 reformulări prudente), 4 cu un detaliu neconfirmat. Fără fișă au rămas 18 facultăți al căror site nu se deschide: 15 la „Dunărea de Jos” Galați, 2 la Universitatea Națională de Apărare, 1 la Tomis (nu mai are site). Patru site-uri de facultăți au linkuri ascunse către pariuri sau conținut pentru adulți (SNSPA Management, Științe Sociale Craiova, Teologie Sibiu, Agricultură USAMV Cluj): fișele nu trimit la ele. Opt fișe de universități au fost aliniate cu regulamentele citite acum (UMFST, Spiru Haret, Universitatea Ecologică, Danubius, „Ioan Slavici”, Târgu Jiu, Sapientia, „Ion Mincu”). În catalog, Facultatea de Drept din Cluj-Napoca a Universității „Dimitrie Cantemir” are acum orașul Cluj-Napoca (lista oficială scrie numele cu un spațiu în plus și orașul nu era recunoscut); catalogul a fost reîncărcat în baza de dezvoltare. Ce nu s-a putut confirma și hotărârile rămase sunt în `docs/de-verificat-facultati.md`
- Fișiere: `apps/web/data/faculties-ro.json`, `apps/web/data/universities-ro.json`, `apps/web/data/universities-index.json`, `apps/web/data/catalog/ro-programs.json`, `scripts/data/ro/build.mjs`, `docs/de-verificat-facultati.md` (nou)
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 127 de teste, aplicația pornește)
- Neverificat: baza de producție nu a fost reîncărcată (orașul corectat al celor două programe de Drept din Cluj apare doar în baza de dezvoltare); cele 18 facultăți fără fișă; verificarea a fost făcută de ajutoare automate, nu de un om; facultățile nu apar încă în căutare, doar pe fișa universității
- Urmează: un om parcurge `docs/de-verificat-facultati.md`; echipa hotărăște dacă facultățile intră în căutare și în „UniPath în cifre”; reîncercat Galați și Apărare când site-urile răspund

### 2026-10-13 12:32 — verificarea informațiilor de pe site, pasul 3: fișele din străinătate recitite pe site-urile oficiale
- Cerut: continuarea verificării cu pasul 3: cele 320 de fișe de universități din străinătate; ce nu se poate confirma se reformulează prudent și se trece pe o listă
- Făcut: nouăsprezece verificatori independenți au deschis site-urile oficiale, pe grupuri de țări. Rezultat: 153 de fișe confirmate integral, 163 corectate, 4 verificate doar parțial (HU Berlin și Tilburg nu s-au deschis; Würzburg și Hannover au mici detalii neconfirmate). Aplicate 389 de corecturi confirmate pe pagini oficiale și 41 de reformulări prudente. Cele mai multe greșeli erau în fișele vechi, scrise fără surse: limba de predare (Copenhaga, DTU, TU Delft, Heidelberg, RWTH, TU Wien, KU Leuven, Lund), calea de înscriere (Italia: nu Universitaly pentru cetățenii UE; Germania: nu uni-assist la LMU, Heidelberg, RWTH; Sciences Po și INSA nu prin Parcoursup), examene și teste lipsă sau greșite (Viena, EPFL, ETH, Princeton, Columbia, UCL, King's, Warwick), burse (Imperial, Manchester, Barcelona, Irlanda) și note de cămin copiate de la o fișă la alta (Olanda, Danemarca, Marea Britanie, Italia). Schimbate 17 câmpuri „da/nu” sau niveluri de cost. Datele calendaristice și numerele exacte de locuri au fost scoase. Paginile deschise de verificatori au fost adăugate la sursele fișelor. Ce nu s-a putut confirma și hotărârile rămase echipei sunt în `docs/de-verificat-strainatate.md`
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/universities-index.json`, `apps/web/data/university-sources.json`, `docs/de-verificat-strainatate.md` (nou)
- Poartă: TRECUT (`node scripts/gate.mjs`: secrete, fișiere, registru, build, 127 de teste, aplicația pornește)
- Neverificat: nivelul de prestigiu, domeniile și plusurile/minusurile fișelor; la o parte dintre fișele noi, descrierea, orașul și adresa nu au fost recitite separat; părerile studenților, specializările și planurile de învățământ pe domenii; verificarea a fost făcută de ajutoare automate, nu de un om
- Urmează: un om parcurge `docs/de-verificat-romania.md` și `docs/de-verificat-strainatate.md`; echipa hotărăște punctele din „Hotărâri de luat de echipă”

### 2026-10-13 09:08 — verificarea informațiilor de pe site, pasul 2: fișele din România recitite pe site-urile oficiale
- Cerut: continuarea verificării: recitirea surselor oficiale pentru toate fișele din România; ce nu se poate confirma se reformulează prudent și se trece pe o listă
- Făcut: unsprezece verificatori independenți au deschis site-urile oficiale pentru cele 83 de fișe de universități și cele 107 fișe de facultăți. Rezultat: 77 de fișe confirmate integral, 110 corectate, 3 al căror site nu s-a deschis (UGAL, AFA Brașov, UNAp). Aplicate 294 de corecturi confirmate pe pagini oficiale și 36 de reformulări prudente. Cele mai multe greșeli erau în fișele de universități scrise în zilele hackathonului, fără surse: examen de admitere trecut greșit (politehnicile din Cluj, Iași, Timișoara, UTCB, UPG, UMC, USV Iași), cămin sau burse trecute greșit „nu” (zece universități private), limbi de predare greșite (UMF Cluj, UMF Timișoara), descrieri cu facultăți care nu există, superlative care nu apar pe niciun site oficial. La facultăți: materii de examen completate (FMI București, Fizică UBB, Informatică UAIC), adrese corectate, linkuri spre planurile de învățământ adăugate la 19 facultăți UBB. Adeverința medicală a fost trecută la acte peste tot unde universitatea o cere. Paginile deschise de verificatori au fost adăugate la sursele fișelor. Ce nu s-a putut confirma este în `docs/de-verificat-romania.md`
- Fișiere: `apps/web/data/universities-ro.json`, `apps/web/data/universities-index.json`, `apps/web/data/faculties-ro.json`, `apps/web/data/university-sources.json`, `docs/de-verificat-romania.md` (nou)
- Poartă: TRECUT (127 de teste); văzute în browser după corecturi: fișele Emanuel Oradea și UTCN, fișele facultăților de Matematică și Informatică (UB) și Fizică (UBB)
- Neverificat: cele 320 de fișe din străinătate (doar linkurile, automat); părerile studenților, specializările și planurile de învățământ pe domenii; verificarea a fost făcută de ajutoare automate, nu de un om
- Urmează: pasul 3 (străinătatea), dacă echipa îl cere; un om parcurge `docs/de-verificat-romania.md`

### 2026-10-13 08:53 — verificarea informațiilor de pe site, pasul 1: verificări automate pe tot
- Cerut: „vreau să verifici fiecare informație de pe site și dacă ceva nu este în regulă să o schimbi”; echipa a ales: întâi verificări automate pe tot, apoi recitirea surselor oficiale pentru România; ce nu se poate confirma se reformulează prudent și se trece pe o listă; aprecierile se corectează doar dacă contrazic faptele
- Făcut: verificate 2.039 de adrese web din date: 1.971 se deschid, 49 blochează verificarea automată, 6 greșite au fost reparate (site-urile Athenaeum, Universitatea Maritimă Constanța și Universitatea din Craiova; două linkuri de admitere la facultăți UBB; un link de planuri la UAIC), 3 site-uri nu au răspuns (AFA Brașov, UGAL, UNAp). Domeniile din fișele universităților românești au fost aliniate cu lista oficială de programe: 305 adăugate la 59 de universități, 24 scoase la 15 universități, fiindcă nu aveau niciun program acreditat. Căutate greșeli de scriere (diacritice, litere vechi, spații): niciuna găsită
- Lăsate neschimbate, fiind alegeri de redactare: „Cămin: da” la universități din străinătate fără cămine proprii; regula pentru burse în Spania și SUA
- Fișiere: `apps/web/data/universities-ro.json`, `apps/web/data/universities-index.json`, `apps/web/data/faculties-ro.json`
- Poartă: rulată după această intrare
- Urmează: pasul 2, în lucru — unsprezece ajutoare recitesc pe site-urile oficiale cele 83 de fișe de universități și cele 107 fișe de facultăți din România

### 2026-10-13 02:30 — fișe de facultăți pentru România: primele 107, de la șapte universități mari
- Cerut: „vreau să mai căutăm facultăți strict din România, să încercăm să le avem pe toate și să avem fișe complete pentru majoritatea”; echipa a ales: o fișă pentru fiecare facultate, cu descriere și programe, cum se intră, contact și linkuri; se începe cu circa 100, de la universitățile mari
- Făcut: pagină nouă „Fișa facultății” (`/universitati/<universitate>/<facultate>`): ce studiezi acolo, cum intri (tipul admiterii și, unde site-ul oficial le numește, materiile de examen), programele de licență ale facultății din lista oficială, site-ul, pagina de admitere, planurile de învățământ și adresa. Fișa universității arată lista facultăților care au fișă și un link „Vezi fișa facultății” lângă fiecare. Scrise 107 fișe, pentru toate facultățile de la Universitatea din București (20), Politehnica București (21), Babeș-Bolyai (23), ASE (12), Universitatea de Vest Timișoara (12), „Al. I. Cuza” Iași (15) și UMF „Carol Davila” (4), după site-urile oficiale și regulamentele de admitere pentru 2026. Fără medii, locuri, taxe sau date. Din cele 492 de facultăți din lista oficială au acum fișă 107. Corectat în catalog orașul Facultății de Inginerie a UBB: Reșița, nu Cluj-Napoca
- Fișiere: `apps/web/data/faculties-ro.json` (nou), `apps/web/lib/faculties.ts` și `faculties.test.ts` (noi), `apps/web/app/universitati/[id]/[facultate]/page.tsx` (nou), `apps/web/components/FacultyPrograms.tsx` (nou), `apps/web/components/OfficialPrograms.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/lib/types.ts`, `scripts/data/ro/build.mjs`, `apps/web/data/catalog/ro-programs.json`
- Poartă: TRECUT (127 de teste); văzute în browser: fișa Facultății de Automatică și Calculatoare (UPB) cu cele 3 programe, fișa Facultății de Medicină (UMF) cu materiile de examen, lista de fișe pe paginile UPB și UBB, pagina de eroare pentru o facultate inexistentă
- De verificat de un om: la Politehnică regulile vin din regulamentul de admitere, ale cărui tabele cu materii nu s-au citit limpede, așa că materiile „de exemplu” au fost scoase; la UBB și UAIC site-urile proprii ale facultăților nu au fost deschise (linkurile sunt cele tipărite pe paginile universității); la Teologie Baptistă și Limbi Străine (UB) sursele oficiale se contrazic și fișele spun să verifici; la câteva facultăți lista oficială nu se potrivește cu site-ul (de exemplu Robotică la UB, „Moașe și Asistență Medicală” la UMF)
- Urmează: celelalte 385 de facultăți, dacă echipa vrea; fișele de facultăți nu apar încă în căutare

### 2026-10-12 02:18 — numele site-ului: idei strânse, nimic hotărât; salvare de seară
- Cerut: mai multe runde de idei de nume, apoi „ne vom opri aici pentru această seară, te rog să salvezi totul”
- Făcut: aflat că `unipath.ro` și `unipath.com` sunt luate, deci e nevoie de un nume nou pentru domeniu. Echipa a ales un filtru (română + engleză, fără cifre, fără argou, modern, cu liceul și drumul la vedere), dar nu a ales încă un nume. Favoritele, filtrul și numele verificate la registrele oficiale sunt păstrate în `docs/nume-site.md`
- Fișiere: `docs/nume-site.md` (nou), `docs/ultimii-pasi.md`
- Poartă: nu s-a schimbat cod; ultima poartă trecută: 123 de teste, la salvarea `efe2ff9`
- Urmează: echipa alege 2–3 nume → verificare la registru → cumpărarea domeniului; în paralel cheia Resend nouă și un adult pentru pagina de confidențialitate (vezi `docs/ultimii-pasi.md`, „Unde suntem”)

### 2026-10-12 00:59 — etapa 3 începută: baza de date de producție și adresa de probă
- Cerut: „vreau să începem pasul 3”; echipa a ales: Claude pregătește tot ce se poate, domeniul se cumpără, administrator `dobrinmatei2008@gmail.com`, nu există încă cineva pentru verificarea juridică
- Făcut: creată baza de date de producție Convex (`impartial-heron-254`) cu tabelele și funcțiile la zi; generate și puse cheile ei de semnare a sesiunilor (nearătate nicăieri); pus administratorul; încărcat catalogul (4.117 instituții, 100.187 programe); puse pe Vercel, doar pentru adresele de probă, adresa bazei de producție și cheia publică de probă a verificării anti-robot; publicată versiunea de lucru pe adresa de probă https://unipath-proba.vercel.app. Conectarea prin email și formularul de păreri sunt oprite intenționat acolo, până vin cheile reale. Site-ul public nu a fost atins
- Fișiere: `docs/ultimii-pasi.md` (secțiunea „Unde suntem”)
- Poartă: nu s-a schimbat cod; ultima poartă trecută: 123 de teste, la salvarea `efe2ff9`
- Neverificat: paginile de pe adresa de probă — Vercel cere conectarea la contul Vercel ca să le arate, deci nu le-am putut deschide; starea publicării este „Ready”
- De știut: Vercel construiește singur o variantă de probă la fiecare salvare pe GitHub; cele dinainte de azi au eșuat pentru că lipseau setările, cele de acum încolo ar trebui să meargă
- Urmează (echipa): hotărârea numelui și cumpărarea domeniului; cheia Resend nouă (cea veche se șterge); cheile Turnstile; un adult pentru verificarea paginii de confidențialitate

### 2026-10-12 00:39 — chestionar: se pot alege mai multe orașe din România
- Cerut: „la finalul chestionarului, unde te întreabă unde vrei să studiezi și selectezi România, vreau să poți selecta mai multe localități, nu doar una”
- Făcut: la ultimul pas elevul bifează unul sau mai multe orașe (cel mult 10), apoi apasă „Vezi rezultatul pentru N orașe”; „Oricare oraș” a rămas. Rezultatul arată universitățile și programele de licență din toate orașele alese și spune care sunt („Cluj-Napoca și Iași”). Dacă niciunul dintre orașele alese nu are domeniul, apar ca înainte universități din alte orașe, cu explicație. Rezultatul salvat în cont și statisticile anonime țin acum lista de orașe; rezultatele salvate mai demult, cu un singur oraș, se citesc în continuare. Linkul „Vezi toate” spre căutarea de universități poartă orașul doar când s-a ales unul singur (căutarea filtrează după un singur oraș)
- Fișiere: `apps/web/app/quiz/page.tsx`, `apps/web/app/rezultat/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/components/MatchCard.tsx`, `apps/web/components/DomainPrograms.tsx`, `apps/web/lib/match.ts`, `session.ts`, `cities.ts`, `types.ts`, `pendingSave.ts`, `apps/web/convex/schema.ts`, `results.ts`, `analytics.ts`, `catalog.ts` și testele lor
- Poartă: TRECUT (123 de teste); parcurs în browser: chestionarul până la ultimul pas, bifat Cluj-Napoca și Iași (și bifat apoi debifat București), rezultatul cu universități și programe din ambele orașe
- Neverificat: pasul cu orașe pe telefon; salvarea în cont a unui rezultat cu mai multe orașe (verificată doar prin test automat)
- Urmează: salvarea pe GitHub când cere echipa

### 2026-10-12 00:28 — etapa 2, calitate tehnică: pagini mai ușoare, verificare pe telefon, varianta de producție, observațiile CodeQL
- Cerut: „da” la etapa 2 din plan (viteza paginilor, verificarea pe telefon, parcurgerea variantei de producție, cele 23 de observații CodeQL)
- Făcut: (1) Viteză — am măsurat varianta de producție: serverul răspundea deja repede (10–20 ms), dar aproape fiecare pagină descărca în browser toate cele 403 fișe cu textele lor lungi. Acum browserul primește doar un rezumat al fișelor (fără textele lungi) și doar pe paginile care au nevoie; textele lungi rămân pe server și apar doar pe fișa universității. JavaScript descărcat (comprimat), înainte → după: chestionar 365 → 231 KB, întrebări 369 → 233, rezultat 397 → 293, căutare universități 368 → 262, fișa unei universități 382 → 248, specializări 381 → 242, studenți 369 → 235; pagina principală, programe și surse neschimbate (202–218). (2) Telefon — toate paginile principale verificate la lățime de 375 px, fără ieșiri din ecran; reparat titlul rupt în mijlocul cuvântului pe cardul de rezultat („kinetoterapie”). (3) Varianta de producție — construită și parcursă: fereastra de bun venit, chestionarul întreg (profil, 18 întrebări, unde studiezi) până la rezultat, căutarea de universități și de programe, o fișă cu programe din catalog, formularul de păreri cu verificarea anti-robot, redirecționarea paginilor de administrare. (4) CodeQL — 25 de observații, toate în scripturile din `scripts/`, niciuna în aplicație. Una era o greșeală adevărată în scripturile pentru Irlanda, Belgia și Austria (secvențele de tip `\"` din sursă nu erau desfăcute corect); reparată, iar Irlanda a recâștigat un program (2.401). Restul sunt comportamente voite ale scripturilor de date (descarcă fișiere, le scriu pe disc) sau sunt în `scripts/gate.mjs`, care nu se modifică
- De știut: după ce se schimbă o fișă de universitate se rulează `node scripts/data/sheets-index.mjs`; un test pică dacă rezumatul nu mai corespunde fișelor. Căutarea de universități nu mai caută și în textul „despre” al fișei (doar în nume, oraș, țară, domenii, specializări, facultăți)
- Fișiere: `scripts/data/sheets-index.mjs` (nou), `apps/web/data/universities-index.json` și `ro-cities.json` (noi, generate), `apps/web/lib/sheets.ts`, `labels.ts`, `cities.ts`, `traits.ts` (noi), `apps/web/lib/universities.ts`, `data.ts`, `match.ts`, `types.ts`, testele din `apps/web/lib/`, componentele și paginile care importau datele, `apps/web/components/MatchCard.tsx`, `scripts/data/{ie,be,at}/build.mjs`, `apps/web/data/catalog/ie-*` și `index.json`, `docs/catalog-status.md`
- Poartă: TRECUT (121 de teste); varianta de producție construită și parcursă în browser la lățime de telefon; titlul reparat verificat pe varianta de lucru
- Neverificat: viteza pe internet real (măsurătorile sunt pe acest calculator); conectarea și panoul de administrare pe varianta de producție (linkul de conectare de probă duce la portul variantei de lucru); paginile nu se pot face statice cât timp fiecare răspuns poartă un cod de securitate unic
- Urmează: etapa 3, ultimii pași, unde e nevoie de echipă: cheia nouă Resend, domeniul, administratorii, adresa de contact, cheile Turnstile, baza de producție

### 2026-10-11 23:56 — fereastră de bun venit: îți faci cont sau continui fără cont
- Cerut: „vreau ca prima pagină de conectare să o scoți și ca atunci când intri pe site să ai opțiunea să îți faci cont sau nu”; echipa a ales: fereastră de bun venit, o singură dată pe dispozitiv
- Făcut: la prima vizită apare peste pagină o fereastră „Bine ai venit pe UniPath!” cu două butoane: „Îmi fac cont” (formularul cu nume și email se deschide în aceeași fereastră) și „Continui fără cont”. Alegerea se ține minte în browser, deci întrebarea nu mai apare a doua oară. Butonul „Conectare” din meniu deschide aceeași fereastră, pe pagina pe care ești, în loc să te ducă pe o pagină separată. Pagina `/conectare` a rămas doar ca plasă de siguranță: acolo ajungi dacă deschizi „Contul meu” fără să fii conectat. Pagina de confidențialitate explică notița ținută în browser
- Fișiere: `apps/web/components/WelcomeDialog.tsx` (nou), `apps/web/components/SignInForm.tsx` (nou, formularul scos din pagina de conectare), `apps/web/app/conectare/page.tsx`, `apps/web/components/NavLinks.tsx`, `apps/web/app/layout.tsx`, `apps/web/app/confidentialitate/page.tsx`
- Poartă: TRECUT (120 de teste); parcurse în browser: fereastra la prima vizită, „Continui fără cont” (nu mai apare la pagina următoare), butonul „Conectare” din meniu (deschide formularul pe aceeași pagină), închiderea cu Escape, trimiterea formularului cu o adresă de probă, pagina „Contul meu” fără conectare (duce la pagina de conectare)
- Neverificat: fereastra pe telefon (verificată doar la lățime de calculator); conectarea cu Google din fereastră (Google nu e pornit încă)
- Urmează: salvarea pe GitHub când cere echipa

### 2026-10-09 03:58 — 198 de fișe complete noi de universități (403 în total), din 32 de țări
- Cerut: „aș dori să mai aduni informații despre facultăți, pentru a avea fișă completă la cât mai multe posibil”, pentru mai mult de două ore, cu oprire după 200 de fișe
- Făcut: 198 de fișe noi, toate în străinătate: SUA 25, Franța 19, Marea Britanie 19, Spania 18, Polonia 15, Germania 12, Italia 12, Irlanda 8, Austria 7, Belgia 6, Canada 6, Danemarca 5, Olanda 5, Suedia 4, câte 3 pentru Australia, Cehia, Elveția, Finlanda, Grecia și Republica Moldova, câte 2 pentru Bulgaria, Cipru, Estonia, Letonia, Lituania, Norvegia și Portugalia, câte una pentru Coreea de Sud, Hong Kong, Malta, Singapore și Slovenia. Aceeași metodă ca la runda anterioară: doar din site-ul oficial al universității și din pagini oficiale de stat, cu paginile folosite păstrate în `apps/web/data/university-sources.json`, fără sume exacte și fără medii de admitere. 99 dintre fișele noi sunt legate de catalogul oficial și arată lista de programe (Spania, Polonia, Austria, SUA, Olanda, Germania, Italia, Irlanda, Belgia)
- Lăsate deoparte (prea puțin confirmat pe pagini oficiale deschise): Universitatea din Luxemburg, Universitatea din Bergen, Universitatea Pedagogică „Ion Creangă” din Chișinău, Universitatea de Medicină din Varna. Sărite de ajutoare pentru că site-urile blochează citirea automată sau nu au răspuns: Durham, Lancaster, Pompeu Fabra, Deusto, Grenoble, Firenze, Torino, Milano Statale, Milano-Bicocca, Pavia, Trento, Melbourne, NUS, ELTE și altele
- Fișiere: `apps/web/data/universities-abroad.json`, `apps/web/data/university-sources.json`, `apps/web/data/catalog/` (instituțiile și programele pentru `es`, `pl`, `at`, `us`, `nl`, `de`, `it`, `ie`, `be`, plus `index.json`), `scripts/data/{es,pl,at,us,nl,de,it,ie,be}/build.mjs` și README-urile lor, `apps/web/lib/universities.data.test.ts`
- Poartă: TRECUT (120 de teste); toate cele 11 țări VALID; văzute în browser: pagina principală cu 403 fișe, fișele Universității din Varșovia, Trinity College Dublin și Caltech cu lista de programe, fișa USM Chișinău, căutarea „toronto”
- De verificat de un om: prestigiul, nivelul de cost și plusurile/minusurile sunt aprecieri orientative; la o parte din fișe unele detalii vin din rezumatul paginii oficiale din motorul de căutare, nu din pagina deschisă; lista de domenii este aprecierea noastră la primele 15 fișe din SUA și la universitățile mari din Suedia, Elveția, Finlanda, Portugalia și Cehia; la Republica Moldova nivelul taxei pentru cetățenii români nu a fost găsit; la Spania bursele sunt trecute „da” (bursa națională acoperă taxa și pentru cetățeni UE), spre deosebire de fișa veche a Universității din Barcelona; fișele din Franța nu sunt legate de catalog, fiindcă acolo o universitate apare împărțită pe campusuri
- Urmează: echipa hotărăște dacă mai vrea fișe; pentru universitățile cu site blocat, datele trebuie adunate de mână

### 2026-10-09 02:55 — salvare pe GitHub: fișele noi, separat de panoul de statistici
- Cerut: `/git-workflow` — salvarea lucrului de azi
- Făcut: lucrul a fost salvat în două părți, ca să poată fi urmărit ușor: întâi panoul de statistici și caseta de pe pagina principală, apoi cele 74 de fișe noi cu legătura lor la catalog (descrise în intrarea „74 de fișe complete noi” de mai jos). Niciun fișier nou față de acea intrare
- Fișiere: cele din intrarea „74 de fișe complete noi”
- Poartă: rulată la salvare
- Urmează: verificările automate de pe GitHub; apoi ce hotărăște echipa (alte țări pentru fișe, numele site-ului, ultimii pași)

### 2026-10-09 02:51 — 74 de fișe complete noi de universități (205 în total)
- Cerut: „te rog să mai aduni informații pentru a avea cât mai multe cu fișă completă”; echipa a ales: cele 10 instituții din România rămase fără fișă și destinațiile preferate de români, circa 80 de fișe, scrise ca la cele existente, cu sursa notată
- Făcut: 74 de fișe noi: România 9 (acum 83 din 84 de instituții din lista oficială au fișă), Olanda 12, Marea Britanie 15, Germania 14, Italia 12, Austria 8, Danemarca 4. Fiecare fișă e scrisă din site-ul oficial al universității și din pagini oficiale de stat; paginile folosite sunt păstrate în `apps/web/data/university-sources.json`. Fișele din România, Olanda, Germania, Italia și Austria sunt legate de catalogul oficial, deci arată și lista de programe de licență. Fără sume exacte și fără medii de admitere
- Lăsată deoparte: Universitatea „Tomis” din Constanța — nu am găsit un site oficial care să funcționeze, deci nu am putut confirma admiterea, bursele și căminul
- Fișiere: `apps/web/data/universities-ro.json`, `apps/web/data/universities-abroad.json`, `apps/web/data/university-sources.json` (nou), `apps/web/data/catalog/` (instituțiile și programele pentru `ro`, `nl`, `de`, `it`, `at`, plus `index.json`), `scripts/data/{ro,nl,de,it,at}/build.mjs` și README-urile lor, `apps/web/lib/catalog.test.ts`, `apps/web/lib/universities.data.test.ts`
- Poartă: TRECUT (120 de teste); toate cele 11 țări VALID; văzute în browser: pagina principală cu 205 fișe, fișa Fontys și fișa „Dimitrie Cantemir” Târgu Mureș cu lista de programe, căutarea „bristol”
- De verificat de un om: prestigiul, nivelul de cost și plusurile/minusurile sunt aprecieri orientative; la unele fișe o parte din detalii (burse în Germania, câteva cămine, câteva cerințe de limbă) vin din rezumatul paginii oficiale din motorul de căutare, nu din pagina deschisă; lista de domenii e parțială la câteva universități (Nottingham, Napoli, Verona, Klagenfurt, Tilburg). Fișele din Marea Britanie și Danemarca nu au listă de programe, fiindcă aceste țări nu sunt în catalog
- Urmează: salvarea pe GitHub când cere echipa; apoi alte țări (Spania, Franța, Polonia, Irlanda) dacă echipa vrea mai multe fișe

### 2026-10-09 00:45 — pagina principală: numărul de instituții în loc de numărul de programe
- Cerut: „în loc de programe de licență, vreau să afișezi pe pagina principală numărul de facultăți/instituții”
- Făcut: caseta din „UniPath în cifre” arată acum „4.117 universități și instituții din 11 țări, din date oficiale” (numărul vine din catalog și se schimbă singur); duce tot la căutarea de programe
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (119 teste); pagina principală văzută în browser cu textul nou
- Urmează: salvarea pe GitHub când cere echipa

### 2026-10-09 00:35 — panou de administrare cu statistici și mentenanță; contor public la chestionar
- Cerut: un panou pentru administratori cu câte accesări are site-ul, de unde vin, câți au terminat chestionarul și cine a răspuns ce, plus mentenanță; iar pe pagina chestionarului, pentru elevi, câți l-au făcut înaintea lor. Echipa a ales: numărătoare proprie anonimă, toate răspunsurile salvate anonim, pentru elevi doar numărul, la mentenanță starea bazei de date și descărcarea statisticilor
- Făcut: pagina nouă `/admin/statistici` (doar pentru administratori): afișări și vizite pe zile, țări, site-uri de pe care vin vizitele, cele mai văzute pagini, chestionare terminate, domeniile rezultate, profilul, orașul, răspunsurile la fiecare întrebare, starea bazei de date și buton de descărcare CSV. Site-ul numără fiecare pagină deschisă fără cookie, fără adresă IP și fără vreun cod al vizitatorului; țara vine de la Vercel (local apare „necunoscută”). La afișarea rezultatului, chestionarul terminat se salvează o singură dată, fără nume sau cont. Pagina chestionarului arată „N elevi au făcut deja chestionarul” abia de la 50 în sus. Textul „răspunsurile rămân pe dispozitivul tău” a fost corectat, iar pagina de confidențialitate are o secțiune nouă „Statistici anonime”
- Fișiere: `apps/web/convex/analytics.ts` și `analytics.test.ts` (noi), `apps/web/convex/schema.ts`, `apps/web/app/admin/statistici/page.tsx` (nou), `apps/web/components/VisitTracker.tsx` (nou), `apps/web/app/layout.tsx`, `apps/web/app/rezultat/page.tsx`, `apps/web/app/test/page.tsx`, `apps/web/app/confidentialitate/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/app/admin/pareri/page.tsx`
- Poartă: TRECUT (119 teste); parcurse în browser pe baza de dezvoltare: un chestionar terminat și numărat o singură dată, panoul de statistici cu contul de probă de administrator, pagina chestionarului și pagina de confidențialitate
- Neverificat: țara reală a vizitelor (se vede doar pe varianta publicată pe Vercel); contorul public afișat (în baza de dezvoltare e un singur chestionar; pragul de 50 e verificat doar prin test automat); descărcarea fișierului CSV
- Urmează: echipa hotărăște pragul de afișare a contorului (acum 50); la lansare, tabelele noi se creează singure în baza de producție

### 2026-10-08 23:46 — baza de date: verificare de completitudine pe 11 țări și reparații
- Cerut: „poți să mai cauți informații despre facultățile din România și restul țărilor, ca să ne asigurăm că le avem pe toate integral”; apoi echipa a aprobat pașii 1 (curățenie) și 2 (completări din surse deschise)
- Făcut: fiecare țară a fost comparată cu liste oficiale independente și cu site-urile câtorva universități. România era completă (neschimbată). Spania a trecut de la o regiune la toată țara (91 de universități, 4.302 programe). Franța: oferta 2026 plus licențele profesionale (7.104). SUA: 118 campusuri secundare adăugate (65.202). Olanda, Polonia, Belgia, Italia, Irlanda: scoase dublurile, rândurile vechi și cele care nu erau licențe; adăugate programele integrate din Irlanda. Total în baza de dezvoltare: 4.117 instituții și 100.186 programe. Germania (circa 35%) și Austria rămân parțiale: nu există surse deschise, trebuie cerut acordul
- Fișiere: `apps/web/data/catalog/` (fișierele a nouă țări și `index.json`), `scripts/data/` (`sources.json`, `build.mjs` și `README.md` pentru `be`, `es`, `fr`, `ie`, `it`, `nl`, `pl`, `ro`, `us`; nou `es/fetch.mjs`), `docs/catalog-status.md`
- Poartă: TRECUT (113 teste); toate cele 11 țări VALID; pagini parcurse pe baza de dezvoltare: căutarea de programe (Spania, Olanda), fișa Universitat de Barcelona, pagina de surse
- De verificat de un om: licențele pentru SUA și Spania; lista belgiană de diplome scoase; detaliile sunt în `docs/catalog-status.md`
- Urmează: hotărârea echipei despre cererile de acord (HRK Germania, ministerul austriac, ARES Belgia); universitățile lumii din ROR; fișe pentru cele 10 instituții românești noi

### 2026-10-08 04:02 — verificarea de secrete de pe GitHub: alarmă falsă pe datele catalogului
- Cerut: lucru autonom peste noapte; verificarea „Leaked secrets” de pe GitHub pica după salvarea catalogului
- Făcut: toate cele 2.364 de semnalări erau în fișierele de date ale catalogului, pe câmpul `key` al fiecărui program (un identificator ușor de citit, de exemplu `upb--electronica-aplicata--engleza-if-2`), luat drept cheie secretă de regula generală; niciuna în cod. Am adăugat o excepție îngustă: doar pentru acea regulă, doar în fișierele de programe și doar pe rândurile cu un astfel de identificator. Toate celelalte reguli rămân active peste tot
- Fișiere: `.gitleaks.toml` (nou), `.github/workflows/security.yml`
- Poartă: rulată la salvare
- Urmează: confirmăm pe GitHub că verificarea trece; apoi raportul de dimineață pentru echipă

### 2026-10-08 03:56 — verificarea de secrete de pe GitHub: aflăm ce a găsit
- Cerut: lucru autonom peste noapte; după salvarea catalogului, verificarea automată „Leaked secrets” de pe GitHub a picat cu 2.364 de semnalări
- Făcut: verificarea scrie acum, când pică, regula și fișierul fiecărei semnalări (valorile rămân ascunse), ca să vedem dacă sunt secrete adevărate sau date din catalog luate drept secrete
- Fișiere: `.github/workflows/security.yml`
- Poartă: rulată la salvare
- Urmează: citim rezultatul și reparăm cauza, fără să ascundem secrete adevărate

### 2026-10-08 03:49 — baza de date, etapa C încheiată: 11 țări, 96.215 programe
- Cerut: continuarea lucrului autonom peste noapte pe celelalte țări
- Făcut: adăugate Polonia (9.083 de programe, registrul RAD-on, CC0), Olanda (3.768, DUO, CC BY), Spania — doar Comunitatea Valenciană (481, Generalitat Valenciana, CC BY), Irlanda (2.433), Belgia — doar Flandra (643) și Austria (520), ultimele trei din datele deschise Europass ale Comisiei Europene. Total în baza de dezvoltare: 3.843 de instituții și 96.215 programe de licență din 11 țări. Pagina principală arată numărul de programe și de țări; la țările a căror sursă dă doar un cod de domeniu, fișa universității grupează programele după domeniile aplicației. Starea pe țări, ce nu s-a putut și ce ar debloca fiecare caz sunt în `docs/catalog-status.md`
- Nu s-a putut (fără date oficiale deschise cu numele programelor): Marea Britanie, restul Spaniei, Danemarca, Suedia, Elveția, Ungaria — motivele și sursele încercate sunt în `docs/catalog-status.md` și în README-ul fiecărei țări din `scripts/data/`
- Fișiere: `apps/web/data/catalog/` (fișierele noilor țări, `index.json`), `scripts/data/` (`sources.json`, dosarele `pl`, `nl`, `es`, `ie`, `be`, `at`, plus README-urile pentru `gb`, `dk`, `se`, `ch`, `hu`), `apps/web/app/page.tsx`, `apps/web/components/OfficialPrograms.tsx`, `docs/catalog-status.md` (nou), `docs/ultimii-pasi.md`
- Poartă: TRECUT (build, 113 teste, pornire). Fiecare din cele 11 țări trece verificatorul și testele comune. În baza reală de dezvoltare: 3.843 de instituții, 96.215 programe. Într-un browser separat, la lățime de telefon și pe laptop: fișele Universității din Viena, KU Leuven, Leiden și TU Delft arată programele din sursa țării lor; căutarea merge în Irlanda, Belgia, Austria, Olanda, Polonia, Spania și Franța (ex. „rechtsgeleerdheid” în Olanda → 20; Medicină în Polonia → 98; „informatik” în Viena → 3); rezultatul pentru „în străinătate” arată numărul de programe de Informatică din fiecare țară; pagina principală arată „96.215 programe de licență din 11 țări”; fără erori. NEVERIFICAT: niciun rând comparat cu site-ul unei universități; pe un telefon real; versiunea construită ca pentru producție nu a fost reparcursă după aceste schimbări
- De verificat de un om: licența datelor din SUA (nu e scrisă pe pagina de descărcare); licența datelor de bază din Europass (Irlanda, Belgia, Austria); legătura cu cele 40 de domenii unde a fost dedusă din numele programului
- Urmează: hotărârea echipei despre țările parțiale (le păstrăm cu eticheta „parțial” sau le scoatem); universitățile lumii din ROR; fișe pentru cele 10 instituții românești noi; apoi calitatea tehnică și ultimii pași

### 2026-10-08 03:35 — baza de date, etapa C: catalog pe mai multe țări (lucru autonom peste noapte)
- Cerut: după verificarea României, același lucru, autonom, pentru celelalte țări relevante: Olanda, Italia, Franța, Spania, SUA și altele de interes; fără întrebări peste noapte
- Verificare România (înainte de a merge mai departe): o a doua citire a documentului, independentă (text simplu, fără liniile tabelelor), dă același număr de programe și aceeași sumă de locuri la 82 din 84 de instituții; la celelalte două diferența e de un singur rând, pe care citirea simplă îl ratează
- Făcut: (1) un format comun pentru orice țară (`scripts/data/CONTRACT.md`), un verificator (`scripts/data/validate.mjs`), legătura standard dintre clasificarea internațională ISCED-F și cele 40 de domenii (`scripts/data/isced.mjs`), un rezumat pe țări folosit de pagini (`apps/web/data/catalog/index.json`) și un script care încarcă totul în Convex (`scripts/data/import.mjs`); România a fost trecută în același format. (2) Câte un agent pe țară a găsit sursa oficială, i-a verificat licența și a construit datele cu un script reproductibil: Italia (MUR USTAT, IODL 2.0), SUA (College Scorecard), Franța (Parcoursup, Licence Ouverte 2.0), Polonia (RAD-on, CC0), Olanda (DUO RIO, CC BY), Germania (DEQAR, PDDL — parțial), Spania (Generalitat Valenciana, CC BY — doar o regiune). (3) Baza de date și paginile primesc acum orice țară: căutarea de programe are alegere de țară, fișele universităților din străinătate care se regăsesc în date arată programele lor, rezultatul chestionarului arată câte programe din domeniu are fiecare țară, iar pagina „Surse de date” arată sursa, licența și limitele fiecărei țări
- Nu s-a putut: Marea Britanie (site-ul oficial blochează descărcarea automată, iar termenii lui cer acord scris pentru refolosire); Spania la nivel național (registrul oficial RUCT se poate doar consulta; fișierul național al ministerului nu are orașul și acoperă doar universitățile publice)
- Fișiere: `scripts/data/` (`CONTRACT.md`, `validate.mjs`, `isced.mjs`, `index.mjs`, `import.mjs`, `sources.json`, câte un dosar pe țară cu `build.mjs` și `README.md`), `apps/web/data/catalog/` (fișierele pe țări și `index.json`), `apps/web/convex/schema.ts`, `apps/web/convex/catalog.ts`, `apps/web/convex/catalog.test.ts`, `apps/web/lib/catalog.ts` (nou), `apps/web/lib/catalog.test.ts`, `apps/web/lib/types.ts`, `apps/web/components/ProgramRow.tsx`, `OfficialPrograms.tsx`, `DomainPrograms.tsx`, `ProgramSearch.tsx`, `MatchCard.tsx`, `apps/web/app/programe/page.tsx`, `apps/web/app/surse/page.tsx`, `apps/web/app/universitati/[id]/page.tsx`
- Poartă: TRECUT (build, 110 teste, pornire). Prima rulare a dat PICAT la „Fișiere care nu se salvează”: fișierul Poloniei avea peste 5 MB; l-am trecut în formă comprimată (aceleași rânduri), poarta nu a fost atinsă. Fiecare țară trece verificatorul (`validate.mjs`) și testele comune. În baza reală de dezvoltare: 3.711 instituții și 92.619 programe din 8 țări. Într-un browser separat, pe laptop și la lățime de telefon (rulat cu primele 5 țări): fișele „Carol Davila”, Harvard, Sapienza, Sorbonne și TUM arată programele din sursa țării lor, Oxford nu are listă; căutarea de programe merge pe fiecare țară (ex. „computer science” în SUA, Drept în Paris, Medicină în Italia) și spune cinstit când nu găsește; rezultatul chestionarului pentru „în străinătate” arată câte programe de Informatică are fiecare țară, cu link spre căutare; „Surse de date” listează fiecare țară cu sursa ei; fără erori. NEVERIFICAT: paginile după adăugarea Poloniei, Olandei și Spaniei (doar teste și numărători în bază); niciun rând comparat cu site-ul unei universități; pe un telefon real
- Limite de știut: legătura cu cele 40 de domenii e a noastră și e aproximativă, mai ales unde sursa nu are coduri de domeniu (Germania, Olanda, Franța, Spania, Italia — după numele sau clasa programului); programele fără o legătură sigură rămân fără domeniu și apar doar în căutare. SUA: numele sunt categorii oficiale de domenii, nu numele programului de la fiecare universitate, iar datele sunt adunate până în 2019–2020; pe pagina de descărcare nu am găsit o licență scrisă. Germania: doar programele cu raport de acreditare în DEQAR; fără Medicină și Drept; limba de predare nespecificată. Numele programelor sunt în limba sursei. Niciun rând nu a fost verificat pe site-ul universității
- Urmează: celelalte țări cercetate (Danemarca, Austria, Belgia, Suedia, Irlanda, Elveția, Ungaria) pe măsură ce se termină; pagina principală cu cifrele noi; universitățile lumii (ROR)

### 2026-10-08 03:13 — baza de date, etapa A: România din lista oficială a Guvernului
- Cerut: echipa vrea o bază de date completă cu universități, facultăți și programe de studii, pentru un site internațional; a confirmat să pornesc cu România din lista oficială. Hotărât mai devreme: doar licență, datele din lista oficială plus legătura cu cele 40 de domenii, fișiere în proiect și apoi în Convex
- Făcut: citită automat HG 606/2026 (Monitorul Oficial 679 bis din 17.08.2026, anexele 2 și 3, anul 2026–2027), folosind liniile tabelelor ca să știu exact ce facultate și ce domeniu are fiecare program. Rezultat: 84 de instituții (52 de stat, 32 particulare; toate cele 74 cu fișă în aplicație plus 10 noi) și 2.673 de programe de licență, fiecare cu facultate, domeniu oficial, domeniul nostru (din cele 40), limbă, formă de învățământ, credite, ani, număr maxim de studenți, acreditat / autorizat provizoriu și orașul unde se țin cursurile. Datele sunt în `apps/web/data` și încărcate în baza Convex de dezvoltare (tabelele `institutions` și `programs`, cu căutare). În site: pe fișa fiecărei universități din România, „Facultăți și programe de licență” din lista oficială (înlocuiește lista veche, care exista doar la Politehnica București); pe rezultatul chestionarului, „Programe de licență în {oraș}” la fiecare domeniu; pagină nouă `/programe` (căutare după cuvânt, domeniu și oraș), cu link din pagina de universități; pagină nouă `/surse` (de unde sunt datele, ce am adăugat noi, limite), cu link în subsol
- Fișiere: `apps/web/data/ro-institutions.json` (nou), `apps/web/data/ro-programs.json` (nou), `apps/web/convex/schema.ts`, `apps/web/convex/catalog.ts` (nou), `apps/web/convex/catalog.test.ts` (nou), `apps/web/lib/catalog.test.ts` (nou), `apps/web/lib/types.ts`, `apps/web/components/ProgramRow.tsx`, `OfficialPrograms.tsx`, `DomainPrograms.tsx`, `ProgramSearch.tsx` (noi), `apps/web/components/MatchCard.tsx`, `apps/web/components/Shell.tsx`, `apps/web/app/programe/page.tsx` (nou), `apps/web/app/surse/page.tsx` (nou), `apps/web/app/universitati/page.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `scripts/data/` (`dump.mjs`, `parse.mjs`, `build.mjs`, `README.md` — cum s-au construit datele)
- Poartă: TRECUT (build, 103 teste, pornire). Verificări ale datelor: numărul de rânduri citite (2.681) e egal cu numărul de căsuțe „A/AP” din PDF; niciun câmp gol; fiecare număr de facultate duce la un singur nume de facultate; toate cele 40 de domenii au programe; câteva rânduri comparate cu textul tipărit (Medicină la „Carol Davila”: 6 ani, 1.266 de locuri; Mecatronică și Media digitală la Politehnica București); la Politehnica București, 111 din cele 132 de programe adunate mai demult de pe upb.ro se regăsesc cu același nume. Pe baza reală de dezvoltare: 84 de instituții, 2.673 de programe; „Informatică în Iași” → 5; căutarea fără diacritice merge. Într-un browser separat, pe laptop și la lățime de telefon: fișa „Carol Davila” arată 4 facultăți și 14 programe, Sapientia arată limba maghiară, Harvard nu are secțiunea; `/programe` caută după cuvânt, domeniu și oraș și spune cinstit când nu găsește; rezultatul chestionarului cu Iași arată programe reale din Iași la toate cele 3 domenii; `/surse` și linkul din subsol merg; fără erori. NEVERIFICAT: lista nu a fost recitită rând cu rând de un om; orașele de la Pitești și Baia Mare; pe un telefon real
- Ce e al nostru, nu al documentului: legătura cu cele 40 de domenii (alegerea noastră, uneori discutabilă: de ex. „Inginerie și management” e pus la inginerie, „Științe inginerești aplicate” la fizică); orașul la facultățile care țin de un centru din alt oraș — la POLITEHNICA București (Pitești) și la UT Cluj-Napoca (Baia Mare) l-am pus din cunoștințe generale, de confirmat pe site-urile lor; limba maghiară la Sapientia și Partium, după nota de subsol a listei
- Lăsate pe dinafară: 8 programe de nivel master trecute în aceeași listă (MBA-uri), programele care intră în lichidare (anexa 4) și 3 instituții particulare care apar în listă fără niciun program activ (Avram Iancu Cluj, Mihail Kogălniceanu Iași, Româno-Germană Sibiu)
- Urmează: etapa B (universitățile lumii din registrul ROR) și etapa C (Olanda, Italia, Franța, Polonia, SUA din sursele oficiale găsite); cele 10 instituții noi nu au încă fișă proprie; baza de producție va trebui încărcată la fel (vezi `scripts/data/README.md`)

### 2026-10-08 02:47 — conturi cu nume complet și email
- Cerut: utilizatorii să se poată conecta cu nume complet și email, iar noi să salvăm aceste date și să le creăm cont pe platformă. Înainte: cercetarea surselor oficiale de date pentru baza de universități și programe a fost salvată în `docs/db-sources.md`; planul pe țări așteaptă confirmarea echipei
- Făcut: formularul de conectare cere „Numele tău complet” și „Adresa ta de email”; la prima conectare se creează contul, iar numele se salvează în el imediat după deschiderea linkului din email (conectarea rămâne fără parolă). „Contul meu” salută cu numele, îl arată și îl lasă schimbat; dacă lipsește (de exemplu la un cont vechi), îl cere acolo. Regula pentru nume e una singură, folosită în formular, în cont și pe server (`lib/name.ts`): 3–80 de caractere, cel puțin o literă, fără linkuri sau simboluri de cod. Ștergerea contului șterge și numele. Pagina de confidențialitate spune acum că păstrăm numele complet. Șters un fișier rătăcit (`cs.html`) lăsat în rădăcina proiectului de agentul de cercetare
- Fișiere: `apps/web/app/conectare/page.tsx`, `apps/web/app/cont/page.tsx`, `apps/web/app/confidentialitate/page.tsx`, `apps/web/convex/account.ts`, `apps/web/convex/access.test.ts`, `apps/web/lib/name.ts` (nou), `apps/web/lib/pendingSave.ts`
- Poartă: TRECUT (build, 91 de teste, pornire). Teste noi: fiecare utilizator își salvează doar numele lui, vizitatorii sunt refuzați, numele goale, prea lungi sau care nu sunt nume sunt refuzate, numele dispare la ștergerea contului. Probă reală într-un browser separat, la lățime de telefon, pe baza de dezvoltare: fără nume sau cu „ab” formularul nu trimite nimic și nu se creează cont; cu „Maria Ionescu” și email → link → „Contul meu” spune „Bună, Maria Ionescu!” și numele e în baza de date; schimbat în „Maria-Elena Ionescu” (un nume cu cod e refuzat); la a doua conectare numele e tot acolo; după ștergerea contului utilizatorul nu mai există în bază; fără erori. NEVERIFICAT: email real prin Resend; Google; pe un telefon real
- De știut: păstrăm acum numele real al utilizatorilor, dintre care mulți sunt minori; asta mărește răspunderea pentru protecția datelor și trebuie văzut la verificarea juridică (vezi `docs/ultimii-pasi.md`, pasul 6). Cu Google, numele vine din contul Google
- Urmează: confirmarea echipei pentru planul bazei de date (România din lista oficială, apoi alte țări)

### 2026-10-08 00:01 — schimbare de ordine: întâi baza de date completă, cheile reale la final
- Cerut: echipa a observat că pașii cu chei reale sunt pași de producție și a hotărât ordinea: întâi un proiect cât mai bun tehnic, începând cu o bază de date completă (universități, facultăți, programe de studii), apoi acești pași, la final; să existe un fișier .md care spune că sunt cam ultimii pași. A cerut și deschiderea paginii de chei în Claude in Chrome
- Făcut: `docs/ultimii-pasi.md` — ordinea de lucru (1. baza de date completă, 2. calitate tehnică, 3. ultimii pași) și fiecare pas final scris pe rând, cu cine îl face (cheia Resend, domeniu, administratori, Turnstile, Google, confidențialitate, baza de producție, adresa de probă și lansarea). Claude in Chrome nu era conectat (două încercări), deci pagina de chei nu a fost deschisă
- Fișiere: `docs/ultimii-pasi.md` (nou)
- Poartă: NEVERIFICAT (doar documente; niciun cod schimbat)
- Urmează: întrebări către echipă despre baza de date completă (ce universități, ce câmpuri, de unde datele), apoi construirea ei

### 2026-10-07 01:14 — producție, pasul 5: pagina de confidențialitate; scanările de pe GitHub
- Cerut: pasul 5 din plan (confidențialitate), local; verificarea că scanările automate rulează pe GitHub
- Făcut: pagina `/confidentialitate`, în română simplă: ce nu păstrăm fără cont, ce păstrăm cu cont (email, rezultatul salvat, datele conectării), ce păstrăm la o părere, cum se șterg datele, ce servicii folosim (Convex, Resend, Cloudflare Turnstile, Vercel, Google), cookie-uri, contact; marcată vizibil „Versiune de lucru” până la verificarea juridică; adresa de contact e lăsată goală intenționat (pagina spune că va fi adăugată); link în subsolul tuturor paginilor, pe pagina de conectare și lângă bifa de acord din formularul de păreri. Pe GitHub: prima rulare a scanărilor a arătat căutarea de chei în tot istoricul TRECUTĂ și CodeQL TRECUT, iar verificarea tipurilor PICATĂ din cauza configurării (lipsea generarea tipurilor Next.js înainte de verificare); am adăugat pasul lipsă
- Fișiere: `apps/web/app/confidentialitate/page.tsx` (nou), `apps/web/components/Shell.tsx`, `apps/web/app/conectare/page.tsx`, `apps/web/app/studenti/parere/page.tsx`, `.github/workflows/security.yml`
- Poartă: TRECUT (build, 88 de teste, pornire). Într-un browser separat, pe laptop și la lățime de telefon: linkul din subsol duce la pagină, cele 7 secțiuni apar, nota „Versiune de lucru” e vizibilă, linkurile de pe conectare și din formular există; fără erori. Scanările de pe GitHub după reparație (văzute rulând pe `c76d79c`): căutarea de chei în tot istoricul TRECUT, pachete + tipuri + teste TRECUT, CodeQL TRECUT cu 4 semnalări, toate în scripturile locale de lucru (`scripts/gate.mjs`, `scripts/map.mjs`), niciuna în aplicație; nu le-am atins (poarta nu se modifică)
- De făcut de un om înainte de lansare: verificarea juridică a textului (minori, acordul părinților, vârsta de la care un elev își poate da singur acordul), adresa de contact, unde ține Convex datele, acordurile cu furnizorii
- Urmează: „nivelul următor”, cu echipa: cheie Resend nouă și domeniu, Google, chei Turnstile reale, lista de administratori, baza de producție, adresă de probă

### 2026-10-07 01:11 — producție, pasul 4: antete de securitate, scanări automate, pachet de conectare actualizat
- Cerut: pasul 4 din plan, local: antete de securitate, scanare de chei și pachete la fiecare salvare, verificare de cod
- Făcut: (1) politică de conținut (CSP) pusă la fiecare cerere în `proxy.ts`: scripturile rulează doar cu un cod unic pe cerere, conexiunile sunt permise doar către site, baza Convex și verificarea anti-robot, site-ul nu poate fi pus în ramă pe alt site; plus antetele `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security` în `next.config.ts`. (2) Pe GitHub, la fiecare salvare și săptămânal: căutare de chei scăpate în tot istoricul (gitleaks), verificarea pachetelor (`npm audit`), verificarea tipurilor și testele; scanare de cod CodeQL; Dependabot pentru actualizări de pachete. (3) `@auth/core` trecut de la 0.41.1 la 0.41.3: verificarea de pachete a găsit o vulnerabilitate critică cunoscută în versiunea veche (printre altele, la validarea adreselor de email)
- Găsit și reparat pe parcurs: regula `upgrade-insecure-requests` strica deconectarea când versiunea de producție rula local, fără conexiune securizată; acum se trimite doar pe conexiune securizată
- Fișiere: `apps/web/proxy.ts`, `apps/web/next.config.ts`, `apps/web/lib/csp.ts` (nou), `apps/web/lib/csp.test.ts` (nou), `apps/web/package.json`, `apps/web/package-lock.json`, `.github/workflows/security.yml` (nou), `.github/workflows/codeql.yml` (nou), `.github/dependabot.yml` (nou)
- Poartă: TRECUT (build, 88 de teste, pornire). Teste noi pentru politica de conținut (scripturi doar cu codul cererii, fără „inline” sau „eval” în producție; conexiuni doar către site, Convex și verificarea anti-robot; fără rame). Verificat pe site-ul local, în mod dezvoltare și construit ca pentru producție: antetele sunt trimise, toate scripturile paginii poartă codul, 11 pagini parcurse fără nicio încălcare a politicii; proba completă de conectare (salvare, link, cont, deconectare, link refolosit refuzat, ștergerea contului) și cea de păreri (trimitere, aprobare, afișare, scoatere) trec cu regulile noi și cu pachetul actualizat. `npm audit` pe pachetele site-ului: 0 probleme. NEVERIFICAT la momentul scrierii: rularea scanărilor pe GitHub (se văd după urcare); politica pe adresa reală, cu conexiune securizată
- De știut: rămâne un avertisment „high” doar într-o unealtă de dezvoltare (`braces`, adus de verificatorul de stil al Next.js); nu ajunge în site și nu are reparație fără a strica unealta. Stilurile din pagină sunt permise „inline” (bare de progres, animații); niciun text scris de utilizatori nu ajunge într-un stil
- Urmează: pasul 5 (pagina de confidențialitate), apoi „nivelul următor” cu echipa

### 2026-10-06 01:14 — producție, pasul 3: formularul de păreri și pagina de aprobare (local)
- Cerut: pasul 3 din plan, lucrat local pe baza de dezvoltare, fără chei reale
- Făcut: formular public `/studenti/parere` (nume, universitate din listă sau „alta”, facultate, an, text, bifă de acord și de 18 ani), fără cont; pe server: verificare anti-robot (Cloudflare Turnstile), câmp-capcană pentru roboți, limită de 20 de păreri pe oră pentru tot site-ul, verificarea lungimilor, iar părerea intră mereu „în așteptare”; pagină `/admin/pareri` doar pentru administratori (în așteptare / aprobate / respinse, „Aprobă”, „Respinge”, „Scoate de pe site”); părerile aprobate apar pe `/studenti`, pe fișa universității și în semnul din căutare, lângă cele 24 adunate de echipă. Textul se afișează doar ca text simplu
- Abatere de la plan, anunțată echipei: cele 24 de păreri existente rămân în fișierele aplicației (cu pozele lor) și se afișează împreună cu cele din baza de date; nu le-am mutat în bază. Formularul nu primește încă poze
- Fișiere: `apps/web/convex/reviews.ts`, `apps/web/convex/convex.config.ts` (nou), `apps/web/convex/access.test.ts`, `apps/web/app/studenti/parere/page.tsx` (nou), `apps/web/app/admin/pareri/page.tsx` (nou), `apps/web/components/Turnstile.tsx` (nou), `apps/web/components/UniversityOpinions.tsx` (nou), `apps/web/lib/useTestimonials.ts` (nou), `apps/web/components/StudentVoices.tsx`, `apps/web/components/UniversityCard.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/app/studenti/page.tsx`, `apps/web/lib/testimonials.ts`, `apps/web/lib/types.ts`, `apps/web/proxy.ts`, `.env.example`
- Poartă: TRECUT (build, 84 de teste, pornire). Prima rulare a dat PICAT la „Parole / chei”: un text inventat dintr-un test semăna cu o cheie; l-am scurtat, poarta nu a fost atinsă. Teste noi pentru formular: părerea verificată intră „în așteptare”; refuz când verificarea anti-robot pică, lipsește sau formularul nu e configurat; câmpul-capcană completat = nimic salvat; starea nu poate fi trimisă din afară; a 21-a părere într-o oră e refuzată. Probă reală într-un browser separat, la lățime de telefon, pe baza de dezvoltare: formularul ține butonul dezactivat până sunt completate câmpurile, acordul și verificarea anti-robot; după trimitere apare „Mulțumim”; părerea NU apare public; un elev conectat primește „Nu ai acces aici” la `/admin/pareri` și nu vede părerea; neconectat → `/conectare`; administratorul de test o vede în coadă și o aprobă; apoi apare pe `/studenti` (25), pe fișa ASE (2 păreri) și în semnul din căutare; un `<script>` pus în text apare ca text și nu rulează; „Scoate de pe site” o ascunde din nou (24); fără erori. NEVERIFICAT: chei Turnstile reale; pe un telefon real
- De știut: pe dezvoltare verificarea anti-robot folosește cheile publice de probă ale Cloudflare, care trec mereu; pentru producție trebuie chei reale. Limita de 20 pe oră e pentru tot site-ul, nu pe persoană. Administratorul de pe dezvoltare e o adresă de probă
- Urmează: pasul 4 (antete de securitate, scanare de chei și pachete la fiecare salvare, verificare de cod) și pasul 5 (confidențialitate), apoi „nivelul următor”: chei reale și baza de producție, cu echipa

### 2026-10-06 01:05 — producție, pasul 2: conectarea probată cap-coadă pe baza de dezvoltare
- Cerut: echipa a cerut să lucrez întâi local, fără să depind de ea, și abia apoi să trecem la nivelul următor (chei și servicii reale)
- Făcut: comutator doar pentru dezvoltare (`AUTH_DEV_LOG_LINKS=1`, pus numai pe baza de dezvoltare): linkul de conectare se scrie în jurnalul funcțiilor în loc să plece pe email, ca fluxul să poată fi probat fără cheia Resend. În producție comutatorul nu se pune, iar emailul pleacă prin Resend
- Fișiere: `apps/web/convex/auth.ts`, `apps/web/convex/account.ts`
- Poartă: TRECUT (build, 80 de teste, pornire). Probă reală într-un browser separat, la lățime de telefon, pe baza de dezvoltare: chestionar → „Salvează în contul meu” → conectare cu email de probă → linkul deschis → „Contul meu” arată emailul și cele 3 domenii, salvate automat (Medicină dentară, Medicină, Farmacie; Iași); `/conectare` când ești conectat duce la cont; deconectarea închide accesul la `/cont`; același link folosit a doua oară NU mai conectează; al doilea link merge și rezultatul e tot acolo; „Șterge contul” cere confirmare, iar după ea baza de date are 0 utilizatori, 0 rezultate, 0 sesiuni, 0 conturi de conectare; fără erori. NEVERIFICAT: trimiterea reală a emailului prin Resend; Google; pe un telefon real
- De știut: cheia Resend lipită de echipă în conversație nu a fost folosită și trebuie înlocuită cu una nouă înainte de a fi pusă în Convex
- Urmează: pasul 3 (păreri: formular public, coadă de aprobare, pagină de administrare), tot local

### 2026-10-06 00:27 — producție, pasul 2 (în lucru): conectare, „Contul meu”, salvarea rezultatului
- Cerut: pasul 2 din plan (conturi). Echipa și-a făcut cont la Resend; administratorii nu sunt încă hotărâți
- Făcut: conectare fără parolă cu link pe email (text în română, valabil 15 minute, trimis prin Resend) și buton Google care apare doar după ce e configurat; pagina `/conectare`; pagina `/cont` („Contul meu”: emailul, rezultatul salvat, deconectare, ștergerea contului cu tot ce ține de el); pe rezultat, „Salvează în contul meu” (dacă elevul nu e conectat, rezultatul rămâne pe dispozitiv până se conectează și se salvează apoi singur); în meniu „Conectare” / „Contul meu”; `proxy.ts` trimite vizitatorii neconectați de la `/cont` la `/conectare` (verificarea adevărată e în funcțiile Convex). Rolul de administrator e pus doar de server, după emailul verificat, din setarea `ADMIN_EMAILS` (goală deocamdată). Cheile de semnare a sesiunilor au fost generate și puse direct în Convex, fără să apară în cod sau în conversație
- Fișiere: `apps/web/convex/auth.ts`, `apps/web/convex/account.ts` (nou), `apps/web/convex/access.test.ts`, `apps/web/proxy.ts` (nou), `apps/web/app/conectare/page.tsx` (nou), `apps/web/app/cont/page.tsx` (nou), `apps/web/components/ConvexClientProvider.tsx` (nou), `apps/web/components/SaveResult.tsx` (nou), `apps/web/components/NavLinks.tsx`, `apps/web/lib/pendingSave.ts` (nou), `apps/web/app/layout.tsx`, `apps/web/app/rezultat/page.tsx`, `apps/web/package.json`, `.env.example`
- Poartă: TRECUT (build, 80 de teste, pornire) pe ramura `production`. Teste noi: „eu” e gol pentru vizitatori și nu spune „administrator” decât dacă așa scrie în baza de date; ștergerea contului scoate doar datele acelui utilizator. Într-un browser separat, pe laptop și la lățime de telefon: `/conectare` se deschide și spune cinstit că emailul nu e încă pornit (butonul e dezactivat); `/cont` neconectat duce la `/conectare`; paginile vechi merg ca înainte; după chestionar, „Salvează în contul meu” păstrează rezultatul pe dispozitiv și duce la conectare; fără erori. NEVERIFICAT: conectarea reală cu link pe email, salvarea în cont, pagina „Contul meu” conectat și ștergerea contului din pagină (lipsește cheia Resend); Google
- De știut: toate paginile sunt acum generate la cerere, nu dinainte (sesiunea se citește la fiecare vizită) — de măsurat și optimizat înainte de lansare. Fără domeniu verificat în Resend, emailul se poate trimite doar către adresa contului Resend
- Urmează: echipa pune cheia Resend în Convex (`AUTH_RESEND_KEY`); apoi probă reală de conectare, salvare și ștergere de cont; apoi pasul 3 (păreri)

### 2026-10-06 00:06 — producție, pasul 1: proiectul Convex, tabelele și regulile de acces
- Cerut: pasul 1 din planul confirmat de echipă (temelia). Echipa și-a făcut contul Convex și a autorizat calculatorul din browser
- Făcut: proiectul Convex „unipath” (bază de date de dezvoltare, în contul echipei); tabelele `users` (cu rol scris doar de server), `results` (rezultatul salvat al elevului) și `reviews` (păreri, cu stare în așteptare / aprobată / respinsă), plus tabelele Convex Auth; regulile comune de acces într-un singur loc (`convex/access.ts`): funcții pentru utilizator conectat și funcții doar pentru administrator; funcțiile pentru rezultat (salvează, citește, șterge — doar al tău) și pentru păreri (lista publică doar cu cele aprobate și fără câmpuri interne; coada și aprobarea doar pentru administratori; adăugarea unei păreri doar printr-o funcție internă, mereu „în așteptare”). Convex Auth e pus fără nicio metodă de conectare, deci încă nu se poate conecta nimeni. Aplicația (paginile) nu folosește încă baza de date
- Fișiere: `apps/web/convex/` (`schema.ts`, `access.ts`, `results.ts`, `reviews.ts`, `auth.ts`, `auth.config.ts`, `http.ts`, `access.test.ts`, `tsconfig.json`, `_generated/`), `apps/web/vitest.config.ts` (nou), `apps/web/eslint.config.mjs`
- Poartă: TRECUT (build, 78 de teste, pornire) pe ramura `production`. Cele 8 teste noi verifică regulile de acces: neconectat → refuzat; elevul A nu vede și nu schimbă rezultatul elevului B; nu se poate trimite id-ul altui utilizator; coada și aprobarea sunt refuzate oricui nu e administrator în baza de date, chiar dacă își zice „admin”; o părere nouă e mereu în așteptare și nu apare public; lista publică nu conține câmpuri de moderare. Pe baza reală de dezvoltare: tabelele există, lista publică întoarce o listă goală, iar funcțiile protejate răspund „Trebuie să fii conectat”. NEVERIFICAT: conectarea unui utilizator real (nu există încă metodă de conectare); nimic din pagini nu folosește încă baza de date
- Urmează: pasul 2 — conturi: echipa face cont la Resend (emailul cu linkul de conectare) și setarea Google; apoi conectarea în pagini și salvarea rezultatului
- De știut: adresa bazei de date stă în `apps/web/.env.local`, care nu se salvează în Git; cheile de conectare vor sta în Convex, nu în cod

### 2026-10-06 00:00 — faza de producție, pasul 1 (început): ramura `production`, plan și pachete
- Cerut: după prezentare, echipa vrea să treacă de la demo la o versiune de producție: conturi pentru utilizatori, bază de date și păreri de studenți păstrate în ea, cu verificări de securitate; agentul de cercetare să caute proiecte de referință pe GitHub. Hotărâri luate cu echipa: bază de date Convex; conectare cu link pe email și Google (Convex Auth); conturi pentru elevi și pentru echipă; păreri prin formular public, aprobate de echipă; lucru pe o copie separată
- Făcut: ramura `production` (`main` și adresa publică rămân neatinse); cercetarea și planul în 5 pași, cu lista de 18 verificări de securitate și punctele neverificate, în `docs/production-plan.md`; instalate și fixate la versiune exactă pachetele Convex (`convex`, `@convex-dev/auth`, `convex-helpers`, `@convex-dev/rate-limiter`, `convex-test`); început dosarul `apps/web/convex` cu o schemă goală; secțiunea „Stack” din `CLAUDE.md` actualizată. Încă nu există conturi, tabele sau funcții
- Fișiere: `docs/production-plan.md` (nou), `CLAUDE.md`, `apps/web/package.json`, `apps/web/package-lock.json`, `apps/web/convex/schema.ts` (nou)
- Poartă: TRECUT (build, 70 de teste, pornire) pe ramura `production`; `npm audit` pe pachetele aplicației: 0 probleme cunoscute. NEVERIFICAT: orice legătură cu Convex (nu există încă cont)
- Urmează: echipa își face contul Convex și autorizează calculatorul (link dat de Claude); apoi tabelele și regulile comune de acces, cu teste
- De știut: nu am verificat dacă datele pot sta în UE la Convex; partea juridică pentru minori trebuie văzută de un adult care se pricepe

### 2026-10-05 11:28 — logoul echipei în previzualizarea linkului și în filă
- Cerut: când linkul aplicației e trimis pe WhatsApp apărea triunghiul negru (iconița implicită) în loc de logoul ales de echipă. Înainte: părerile din căutare publicate la cererea echipei; răspunsurile la grila de jurizare salvate în `docs/raspunsuri-juriu.md`
- Făcut: iconița implicită înlocuită cu emblema din logo (toca și scutul) pentru fila din browser și pentru ecranul telefonului; adăugată imaginea de previzualizare a linkului (logoul întreg pe fundalul crem, 1200×630) și datele de previzualizare (titlu, descriere, adresa publică)
- Fișiere: `apps/web/app/favicon.ico`, `apps/web/app/icon.png` (nou), `apps/web/app/apple-icon.png` (nou), `apps/web/app/opengraph-image.png` (nou), `apps/web/app/opengraph-image.alt.txt` (nou), `apps/web/app/layout.tsx`
- Poartă: TRECUT (build, 70 de teste, pornire); pe calculator pagina trimite iconițele noi și imaginea de previzualizare; imaginile văzute. NEVERIFICAT: cum arată în WhatsApp — aplicațiile de mesaje țin minte o vreme previzualizarea veche a unui link
- Urmează: `/pitch`

### 2026-10-05 11:19 — părerile studenților în căutarea de universități
- Cerut: când cauți o universitate (ex. ASE), să apară și părerea studenților, dacă avem una în aplicație. Echipa a ales ambele locuri: semn pe cardul din rezultate și părerile întregi pe fișă. Înainte: cei 3 studenți noi și deschiderea domeniului pe loc publicate, cum s-a stabilit cu echipa
- Făcut: pe cardul universității din rezultate apare „💬 o părere de la un student” / „N păreri de la studenți”; pe fișa universității apare secțiunea „Ce spun studenții” (poză, nume, facultate, textul întreg) cu buton în bara de sus și link spre toate părerile. Cardul unei păreri e acum o singură componentă, folosită și pe pagina „Studenți”. Legate 11 universități care au fișă: Cambridge, Universitatea din București, IE University, ASE, Universitatea din Amsterdam, Sciences Po, UBB, Bocconi, Columbia, UMF „Carol Davila”, UVT
- De știut: 10 păreri sunt de la universități care nu au fișă în aplicație (ESADE, Institut Lyfe, Lyon 3, Medicină Lyon, La Salle Barcelona, Wisconsin–Madison, Les Roches, Paris-Saclay, Inholland, Universidad Europea); ele apar doar pe pagina „Studenți”
- Fișiere: `apps/web/lib/testimonials.ts` (nou), `apps/web/components/StudentCard.tsx` (nou), `apps/web/components/StudentVoices.tsx`, `apps/web/components/UniversityCard.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/lib/universities.test.ts`
- Poartă: TRECUT (build, 70 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: căutarea „ASE” → cardul are „o părere de la un student”, „bocconi” și „carol davila” → „2 păreri”, „harvard” → fără semn; fișa ASE arată părerea lui Tudor Demușcă cu poză, fișa „Carol Davila” pe ambele Andre, fișa Harvard nu are secțiunea; pagina „Studenți” are tot 24 de păreri; fără erori. Observat: pe serverul de dezvoltare, la încărcări repetate una după alta, lista de rezultate rămânea uneori goală; aceeași succesiune pe adresa publică a mers de fiecare dată. NEVERIFICAT: pe un telefon real
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 11:07 — încă 3 studenți pe pagina „Ce spun studenții”
- Cerut: echipa a trimis încă 3 studenți (texte reale, cu acordul lor) și a spus „poți începe”
- Făcut: adăugate Andreea Lixandru (Universidad Europea, Spania), Andra Mehedintu (Medicină, UMF „Carol Davila”, absolventă — apare lângă Andra Drăghici, aceeași universitate) și Anastasia Cerempei (International Economics and Finance, Bocconi, anul 2 — apare lângă David Vasile); pozele decupate pătrat pe față. Schimbări în texte, anunțate echipei: diacritice puse la Andra și Anastasia fără să se schimbe vreun cuvânt, numele scos de la sfârșitul textului, „mulțumit” corectat în „mulțumită” la Andreea. Pagina are acum 24 de păreri
- Fișiere: `apps/web/data/testimonials.json`, `apps/web/components/StudentVoices.tsx`, `apps/web/public/studenti/` (3 poze noi)
- Poartă: TRECUT (build, 68 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: 24 de păreri; „carol davila” → Andra Drăghici și Andra Mehedintu, alături; „bocconi” → David Vasile și Anastasia Cerempei, alături; „europea” → Andreea Lixandru; fără erori. NEVERIFICAT: pe un telefon real
- De confirmat de echipă: ce studiază Andreea și în ce oraș; scrierea „Mehedintu/Mehedințu”; rămân și cele dinainte (Carina, Ruxandra)
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 11:02 — fișa universității: domeniul se deschide pe loc
- Cerut: pe fișa unei universități, la „Ce poți studia aici”, apăsarea pe „Informatică” scotea elevul din pagină (îl ducea la căutare) în loc să-i arate ce informatică se poate studia. Înainte: planurile de învățământ publicate la cererea echipei
- Făcut: domeniile sunt acum butoane; la apăsare se deschide sub ele, pe aceeași pagină, descrierea domeniului, specializările lui, „Ce înveți, an cu an” (doar la universitățile din România, fiindcă exemplul e un plan românesc) și un link separat „Vezi și alte universități cu acest domeniu”; a doua apăsare închide. Lista veche „Vezi specializările din aceste domenii (N)” a fost înlocuită de aceste panouri pe domeniu. Sub specializări scrie că lista exactă de la acea universitate e pe site-ul ei
- Fișiere: `apps/web/components/UniversityDomains.tsx` (nou), `apps/web/app/universitati/[id]/page.tsx`
- Poartă: TRECUT (build, 68 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon, pe fișele ASE și Harvard: apăsarea pe „Informatică” lasă pagina pe loc și arată 6 specializări; la ASE apare și planul pe 3 ani, la Harvard nu; alt domeniu schimbă panoul, a doua apăsare îl închide; fără erori. NEVERIFICAT: pe un telefon real
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 10:53 — planuri de învățământ: materii pe ani și linkuri oficiale
- Cerut: la fiecare facultate să apară planul de învățământ (ce materii se studiază în fiecare an) și linkul spre plan. Echipa a ales: materii pe ani la cele 40 de domenii + link pe fișa fiecărei universități din România; unde nu se găsește un link verificat, fără link; străinătatea nu acum
- Făcut: „Ce înveți, an cu an” la toate cele 40 de domenii (pe paginile de specializări și pe cardurile din rezultatul chestionarului): 4–7 materii pe fiecare an, citite dintr-un plan de învățământ oficial al unei universități de stat (ex. Medicină — UMF „Carol Davila”, Informatică — Transilvania Brașov, Drept — Universitatea din București), cu numele programului, universitatea, anul planului și link spre planul oficial; sub materii scrie că e un exemplu și că materiile diferă de la o facultate la alta. Pe fișa universităților din România: secțiunea „Planuri de învățământ” cu link spre site-ul oficial la 57 din 74 (9 duc direct la planuri, 48 la lista programelor de studii, de unde se ajunge la planuri; textul linkului spune care din două). Fiecare link a fost deschis de două ori (la căutare și la o verificare automată separată); linkurile care duceau doar la pagina principală, pe alt site sau nu se deschideau au fost scoase
- De știut: la domeniile largi exemplul e de la o singură specializare (Inginerie mecanică = Autovehicule rutiere, Brașov; Energie, petrol, mediu = Petrol și gaze, Ploiești; Arte = Pictură; Muzică = Canto; Teatru-film = Actorie; Militar = Academia Forțelor Terestre; Sociologie fără Asistență socială; Științe politice fără Relații internaționale); la Drept planul e cel de la învățământ la distanță; la Inginerie civilă planul e din 2020-2021; la Arhitectură materiile sunt traduse din engleză. Fără link (17): USAMV București și Cluj, UNArte, Academia de Poliție, ATM, TU Iași, Transilvania Brașov, UMF Craiova, ULBS Sibiu, Dunărea de Jos Galați, Universitatea din Craiova, UNAp, Nicolae Titulescu, Andrei Șaguna, Partium, Athenaeum, Bioterra
- Fișiere: `apps/web/data/curricula.json` (nou), `apps/web/data/curriculum-links.json` (nou), `apps/web/lib/curricula.ts` (nou), `apps/web/lib/curricula.test.ts` (nou), `apps/web/components/CurriculumPlan.tsx` (nou), `apps/web/components/DomainDetails.tsx`, `apps/web/components/MatchCard.tsx`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/lib/types.ts`
- Poartă: TRECUT (build, 68 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: categoria Sănătate — 5 domenii din 5 au planul, Medicină are 6 ani cu 6–7 materii; fișa UPT are link direct la planuri, fișa Universității din București la programele de studii, TU Iași și Harvard nu au secțiunea; pe rezultat toate cele 3 carduri au „Ce înveți, an cu an”; fără erori. NEVERIFICAT: că fiecare materie e copiată exact din plan (am verificat că linkurile se deschid, nu am recitit eu toate cele 40 de planuri); pe un telefon real
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 10:18 — încă 7 studenți pe pagina „Ce spun studenții”
- Cerut: echipa a trimis 7 studenți noi (texte reale, cu acordul lor) și a spus „poți începe”; ce lipsea să fie lăsat deoparte
- Făcut: adăugați Ruxandra Marmandiu (Columbia University), Bianca Donici (Communication Arts, University of Wisconsin–Madison, fără poză), Carina (Les Roches, doar prenumele, fără poză), Andra Drăghici (Medicină Dentară, UMF „Carol Davila”), Luca Gutumanu (Drept, Paris-Saclay), Maya Mirt (Asistență Medicală, Hogeschool Inholland Amsterdam), Andreea Birca Nadolu (Studii de Securitate, Universitatea de Vest din Timișoara); pozele decupate pătrat pe față (cea a Mayei luminată puțin); căutarea găsește și după „columbia”, „wisconsin”, „carol davila”, „saclay”, „inholland”, „uvt”, „olanda”. Texte neschimbate, cu două excepții anunțate echipei: la Bianca Donici scos „Mă numesc Donici Bianca și” și corectat „literatura in teatru” în „literatura și teatrul”. Pagina principală arată acum 21 de păreri
- Fișiere: `apps/web/data/testimonials.json`, `apps/web/components/StudentVoices.tsx`, `apps/web/public/studenti/` (5 poze noi)
- Poartă: TRECUT (build, 62 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: 21 de păreri, fiecare student nou găsit după universitatea lui, „drept” → 4, „medicina” → 2, fără erori; pozele văzute în captură. NEVERIFICAT: pe un telefon real
- De confirmat de echipă: numele de familie al Carinei, ce studiază și campusul; ce studiază Ruxandra; scrierea „Birca Nadolu” (echipa a confirmat ulterior „Drăghici”, corectat); că „UVT” înseamnă Universitatea de Vest din Timișoara
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 01:35 — orașul în chestionar: universități doar din orașul ales
- Cerut: chestionarul să întrebe și orașul, ca elevul care alege București să nu primească universități din Alba Iulia. Echipa a ales: întrebarea la ultimul pas, listă doar cu orașele în care avem universități, iar dacă orașul nu are nimic pentru domeniu arătăm alte orașe cu mesaj clar
- Făcut: la ultimul pas, după „În România” sau „Oriunde”, apare „În ce oraș vrei să studiezi?” cu „Oricare oraș” și cele 21 de orașe din datele noastre (București primul); la „În străinătate” nu se mai întreabă. Pe rezultat, lista din România se numește „În București” și are doar universități din orașul ales; dacă orașul nu are nimic pentru un domeniu, apare „În Alba Iulia nu am găsit universități pentru acest domeniu. Iată din alte orașe:”. Linkurile „Vezi toate” și butonul mare duc la căutare cu filtru nou de oraș (`oras=`), care se poate scoate. Domeniile potrivite și universitățile din străinătate nu se schimbă. „Ce-ar fi dacă?” păstrează orașul
- Fișiere: `apps/web/app/quiz/page.tsx`, `apps/web/app/rezultat/page.tsx`, `apps/web/components/MatchCard.tsx`, `apps/web/components/UniversitySearch.tsx`, `apps/web/lib/match.ts`, `apps/web/lib/session.ts`, `apps/web/lib/types.ts`, `apps/web/lib/universities.ts`, `apps/web/lib/match.test.ts`
- Poartă: TRECUT (build, 62 de teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: România + București → doar universități din București, pagina de căutare arată 8 universități, niciuna din alt oraș; Oriunde + Alba Iulia → Informatică din Alba Iulia, iar la Inginerie civilă și mecanică mesajul și alte orașe; „Oricare oraș” și „În străinătate” merg ca înainte; „Înapoi” de la oraș revine la „Unde vrei să studiezi?”; fără erori. NEVERIFICAT: pe un telefon real
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 01:23 — chestionar nou: 18 situații, pe baza unei documentări
- Cerut: întrebări mai complexe și mai interesante în chestionar, documentate din cât mai multe surse, ca rezultatul să fie cât mai precis; echipa a ales 18 întrebări, cu un singur răspuns pe întrebare, de tip situație/dilemă
- Făcut: cele 12 întrebări vechi înlocuite cu 18 situații concrete din viața unui licean (proiect de grup, internet picat, regulă nedreaptă, job de vară…), fiecare cu 4–5 variante; documentare din 17 surse deschise (modelul Holland RIASEC, O*NET Interest Profiler, Open RIASEC, studii despre întrebările cu alegere forțată, surse românești de consiliere) păstrată în `docs/quiz-research.md`; nu am copiat întrebări din testele existente (au licențe), sunt scrise de la zero; ponderile echilibrate ca nicio înclinație să nu fie favorizată de răspunsuri la întâmplare (înainte „lucru cu oamenii” ieșea prea des); fiecare înclinație e acum principală în cel puțin 7 variante; pagina de start spune „18 situații… cam 6 minute”; pe pagina de rezultat scrie cinstit că nu e un test psihologic validat, ci un punct de pornire. Testul care cerea „10–12 întrebări” a fost schimbat la noua cerință a echipei (16–20) și s-a adăugat unul care cere minimum 6 variante principale pe înclinație
- Fișiere: `apps/web/data/questions.json`, `apps/web/lib/match.test.ts`, `apps/web/app/test/page.tsx`, `apps/web/app/rezultat/page.tsx`, `docs/quiz-research.md` (nou)
- Poartă: TRECUT (build, 58 teste, pornire); simulare cu 30.000 de elevi cu răspunsuri la întâmplare: toate cele 40 de domenii pot ieși pe locul 1; 10 elevi „tip” (câte unul pe înclinație) primesc domenii logice (ex. logică → Informatică, Fizică, Matematică; grijă → Asistență medicală, Medicină, Medicină veterinară); chestionarul parcurs cap-coadă într-un browser separat, pe laptop și la lățime de telefon: 18 întrebări diferite, pasul bonus, „unde”, rezultat, „Reia chestionarul”, fără erori. NEVERIFICAT: pe un telefon real; cu liceeni reali (chestionarul nu e validat științific)
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 02:40 — „Surprinde-mă” înlocuit cu alegerea după interese
- Cerut: echipei nu îi place jocul cu specializarea la întâmplare: UniPath ghidează liceenii spre ce li se potrivește, nu „dă cu zarul”. Înainte: versiunea cu un singur logo și cu „Surprinde-mă” publicată la cererea echipei
- Făcut: jocul la întâmplare scos cu totul; în locul lui, „Nu știi de unde să începi?”: elevul alege până la 3 lucruri care i se potrivesc (cele 10 înclinații din chestionar) și vede primele 6 specializări apropiate de alegerile lui, în ordine, cu procent de potrivire, descriere și link spre universități, plus un îndemn spre chestionarul complet. Aceeași alegere dă mereu același rezultat
- Fișiere: `apps/web/components/InterestPicker.tsx` (nou), `apps/web/components/SurpriseSpecialization.tsx` (șters), `apps/web/components/SpecializationsBrowser.tsx`, `apps/web/app/specializari/page.tsx`
- Poartă: TRECUT (build, 57 teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: fără alegeri nu apare nimic; „Grijă pentru alții” + „Științe și natură” → Medicină veterinară, Medicină dentară, Medicină generală; + „Lucru cu oamenii” → Asistență medicală, Moașe, Psihologie clinică; „Logică” + „Tehnică” → Calculatoare, Electronică, Informatică; „Creativitate” → Arte plastice, Interpretare muzicală; la 3 alegeri celelalte butoane se blochează; fără erori în consolă; pagina văzută în captură pe laptop. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 02:15 — pagina „Specializări”: desen și „Surprinde-mă”
- Cerut: pagina de specializări să aibă din nou un desen sau ceva interactiv, la alegerea lui Claude
- Făcut: desenul cu cărți lângă titlu; sub categorii, cartonașul „Nu știi de unde să începi?” cu butonul „Surprinde-mă”, care arată o specializare la întâmplare (domeniu, descriere, link spre universitățile unde se studiază) și nu repetă aceeași specializare de două ori la rând; cartonașul dispare cât timp elevul caută ceva
- Fișiere: `apps/web/components/SurpriseSpecialization.tsx` (nou), `apps/web/components/SpecializationsBrowser.tsx`, `apps/web/app/specializari/page.tsx`
- Poartă: TRECUT (build, 57 teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: butonul arată o specializare cu link corect, 13 apăsări au dat 13 specializări diferite, căutarea „finante” merge în continuare; pagina văzută în captură pe laptop; fără erori în consolă. Nepublicat (nici schimbarea cu un singur logo)
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 01:55 — un singur logo pe pagina principală
- Cerut: pe pagina de început apăreau două logouri; unul să dispară. Înainte: pagina nouă de start a chestionarului publicată la cererea echipei; ideea cu previzualizarea locală pentru telefon a fost abandonată de echipă, iar setarea începută a fost anulată
- Făcut: scos logoul mare de deasupra titlului; rămâne cel din antet, prezent pe toate paginile; titlul „Ghidul tău între liceu și facultate” e acum titlul principal al paginii
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (build, 57 teste, pornire); pagina văzută în captură pe laptop și la lățime de telefon, cu un singur logo. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 01:20 — pagina de start a chestionarului, cu titlu propriu
- Cerut: pagina „Chestionar” arăta la fel ca pagina principală; echipa a aprobat propunerea: titlu propriu, fără logoul mare, desenul mare și butonul „Ce spun studenții”, cu butonul de pornire sus. Înainte: „UniPath în cifre” publicat la cererea echipei
- Făcut: `/test` are titlul „Chestionarul UniPath”, o frază despre ce urmează (numărul de întrebări e luat din date), butonul „Începe chestionarul” imediat sub titlu, cei 3 pași și nota „Nu îți cerem nume sau cont”
- Fișiere: `apps/web/app/test/page.tsx`
- Poartă: TRECUT (build, 57 teste, pornire); pagina văzută în captură la lățime de telefon; traseul start → profil → prima întrebare parcurs într-un browser separat, pe laptop și telefon; fără erori în consolă. NEVERIFICAT: captura de laptop a paginii. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 01:00 — „UniPath în cifre” pe pagina principală
- Cerut: pagina principală părea goală; ceva în partea de jos, la alegerea lui Claude. Din trei propuneri, echipa a ales-o pe a doua: „UniPath în cifre”. Înainte: versiunea cu Politehnica și cele 12 universități noi publicată la cererea echipei și verificată pe adresa publică
- Făcut: patru cartonașe sub partea de sus a paginii principale, cu numere calculate din date (nu scrise de mână): universități cu fișă completă, specializări, păreri de la studenți, universități din lume la căutare; fiecare duce la pagina lui
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (build, 57 teste, pornire); pagina văzută în captură pe laptop și la lățime de telefon: 131, 206, 14, 10.000+. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 00:40 — Politehnica cu toate facultățile și încă 12 universități din România
- Cerut: încă 10–15 facultăți din România, inclusiv Politehnica plus toate specializările ei. Lămurit cu echipa: Politehnica București primește pe fișă lista tuturor facultăților și specializărilor de licență; 12 universități noi, acreditate, verificate online; lista de facultăți doar la Politehnica. Înainte: versiunea cu 14 studenți publicată la cererea echipei
- Făcut: câmp nou opțional `faculties`; secțiunea pliabilă „Facultăți și specializări” pe fișă; Politehnica București are 22 de facultăți (16 în București, 6 la Centrul Universitar Pitești) cu 132 de specializări, luate de pe paginile facultăților de pe upb.ro; căutarea găsește după facultate sau specializare și pune universitatea respectivă prima; 12 universități private noi: „Constantin Brâncoveanu” Pitești, „Andrei Șaguna” Constanța, „George Bacovia” Bacău, Emanuel, Partium și Agora din Oradea, „Tibiscus” Timișoara, Apollonia Iași, Athenaeum, Bioterra și Artifex din București, Adventus Cernica. Total: 74 de universități din România, 131 cu fișă
- Fișiere: `apps/web/lib/types.ts`, `apps/web/lib/universities.ts`, `apps/web/lib/universities.data.test.ts`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/data/universities-ro.json`
- Poartă: TRECUT (build, 57 teste, pornire); fișa Politehnicii văzută în captură pe laptop; într-un browser separat, pe laptop și telefon: secțiunea are 22 de rânduri, „Automatică și Calculatoare” se deschide cu 3 specializări; „aerospatiala”, „mecatronica” → Politehnica prima; „bacovia”, „partium”, „apollonia” găsite; fără erori în consolă. NEVERIFICAT: la Politehnica, „Media Digitală” și „Jurnalism” de la Departamentul de Formare pentru Cariera Didactică (nu e sigur că sunt programe de licență); la universitățile noi, 9 din 12 verificate doar din rezultate de căutare, bursele și căminele neconfirmate (trecute „nu”, cu îndemnul de a întreba la secretariat). Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-05 00:10 — încă șapte studenți și poza lui Anton Mocanu
- Cerut: adăugarea a șapte păreri reale (texte în capturi de mesaje, cu poze) și poza lui Anton Mocanu; echipa are acordul lor pentru publicare. Înainte: versiunea cu „chestionar” publicată la cererea echipei și parcursă pe adresa publică
- Făcut: Bianca Mermezan (Drept, UBB), Robert Radoi (ESADE), Eliza Florescu (Institut Lyfe, Lyon), Irene Enculescu (Drept, Université Jean Moulin Lyon 3), Julie Vuillaume (Medicină, Lyon), David Vasile (Bocconi), Ariana Vișan (Arhitectură, La Salle Barcelona), toți cu poză decupată pe față; poza lui Anton Mocanu. Texte transcrise din capturi exact; la Robert Radoi adăugate doar diacriticele care lipseau. Căutarea de la „Studenți” găsește și după oraș sau țară
- Fișiere: `apps/web/data/testimonials.json`, `apps/web/public/studenti/*.jpg` (8 noi), `apps/web/components/StudentVoices.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); pagina văzută întreagă în captură pe laptop, cu 14 păreri și 12 poze; căutarea încercată: „drept” → 3, „lyon” → 3, „barcelona” → 2, „ubb”, „bocconi”, „esade”, „medicina” → câte una; fără erori în consolă. Rămase de confirmat de echipă: că fiecare poză e a persoanei lângă care a fost trimisă; forma la masculin din textul Elizei Florescu; scrierea numelui „Radoi”; universitatea Juliei Vuillaume (pe cartonaș: „Medicină, Lyon (Franța)”). Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-04 23:35 — „test” devine „chestionar”
- Cerut: cuvântul „test” să fie înlocuit cu „chestionar”. Înainte: versiunea cu căutarea de la „Studenți” și pagina principală fără bara de căutare publicată la cererea echipei și verificată pe adresa publică
- Făcut: în meniu „Chestionar”; butoanele „Completează chestionarul”, „Începe chestionarul”, „Reia chestionarul”; textele care vorbeau despre testul nostru. Adresa paginii rămâne `/test`. Cuvântul „test” rămâne acolo unde e vorba de testele de admitere ale universităților
- Fișiere: `apps/web/components/NavLinks.tsx`, `apps/web/app/{page,test/page,rezultat/page,studenti/page}.tsx`, `apps/web/lib/match.ts`
- Poartă: TRECUT (build, 55 teste, pornire); traseul complet parcurs într-un browser separat, pe laptop și la lățime de telefon, cu butoanele noi; pagina principală văzută în captură la lățime de telefon. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-04 23:20 — bara de căutare scoasă de pe pagina principală
- Cerut: de pe prima pagină să dispară bara de căutare
- Făcut: căsuța de căutare scoasă din `/`; căutarea de universități rămâne pe `/universitati` (din meniu sau din butonul „Găsește top 10 universități”)
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); pagina principală văzută în captură pe laptop și la lățime de telefon, fără căsuța de căutare; `/universitati` are în continuare căutarea. Nepublicat
- Urmează: publicare la cererea echipei (împreună cu căutarea de la „Studenți”); `/pitch`

### 2026-10-04 23:10 — căutare pe pagina studenților
- Cerut: la „Studenți”, o bară de căutare cu lupă: omul caută o facultate și vede părerea studentului de acolo, sau pe toate dacă sunt mai multe. Înainte: versiunea cu profilul în test publicată la cererea echipei și parcursă pe adresa publică
- Făcut: căsuță de căutare cu lupă pe `/studenti`; filtrează pe loc după universitate, facultate, oraș sau prescurtare (și fără diacritice); arată câte păreri s-au găsit; grupul de la aceeași universitate rămâne alăturat; când nu avem nicio părere apare un mesaj și un buton spre căutarea din „Universități”
- Fișiere: `apps/web/components/StudentVoices.tsx` (nou), `apps/web/app/studenti/page.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); într-un browser separat, pe laptop și la lățime de telefon: fără text 7 păreri; „ie” → 2 (Mihai Florea, Anton Mocanu); „cambridge”, „drept”, „ase”, „amsterdam”, „sciences po” → câte una; „bucuresti” → 2; „harvard” → mesajul fără rezultat cu link spre Universități; fără erori în consolă. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-04 22:50 — profilul de liceu mutat în test
- Cerut: de pe pagina de start a testului să dispară lista de profiluri de liceu și să fie adăugată în test. Înainte: pagina principală fără specializări publicată la cererea echipei (prima încercare de publicare a dat eroare, a doua a reușit)
- Făcut: `/test` are doar titlul, cei 3 pași și butonul „Începe testul”; profilul de liceu e acum primul pas din test („Primul pas — Ce profil de liceu urmezi?”), urmat de cele 12 întrebări, pasul bonus și „Unde vrei să studiezi?”; `/quiz` deschis direct pornește de la profil
- Fișiere: `apps/web/app/test/page.tsx`, `apps/web/app/quiz/page.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); parcurs într-un browser separat, pe laptop și la lățime de telefon: start → profil (12 variante în 3 grupe) → Înapoi păstrează alegerea → 12 întrebări → pas bonus → unde → rezultat cu motivul despre profil → „Reia testul”; `/quiz` și `/rezultat` deschise direct; fără erori în consolă. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-04 19:30 — specializările scoase de pe pagina principală
- Cerut: pe pagina principală să nu mai apară specializările; să rămână strict pe pagina de specializări. Înainte: repo-ul GitHub făcut public la cererea echipei (istoricul verificat: fără chei sau parole)
- Făcut: secțiunea „Ce poți studia” cu cele 10 cartonașe scoasă din `/`; rămâne pe `/specializari`, la care se ajunge din meniul de sus
- Fișiere: `apps/web/app/page.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); pagina principală văzută în captură pe laptop și telefon; `/specializari` are în continuare cele 10 categorii. Nepublicat
- Urmează: publicare la cererea echipei; `/pitch`

### 2026-10-04 19:00 — versiunea aerisită publicată
- Cerut: publicarea versiunii aerisite, ca echipa să o verifice pe telefon; apoi salvarea progresului
- Făcut: publicat la https://unipath-taupe-mu.vercel.app (aceeași adresă, același cod QR); nicio schimbare de cod față de intrarea de mai jos
- Fișiere: `docs/LEDGER.md`
- Poartă: TRECUT înainte de publicare; pe adresa publică: toate paginile se deschid, pagina principală e scurtă, categoria „Business și economie” (domenii pliabile), test → rezultat (primul loc deschis, 2 și 3 pliate) → universități → fișă; fără erori în consolă (avertismentul de „hydration” nu apare în producție). NEVERIFICAT: pe telefonul echipei; folosirea doar din tastatură; corectitudinea fișelor (orientative)
- Urmează: `/pitch` (prezentarea e pe 2026-10-05)

### 2026-10-04 18:40 — pagini aerisite, aceeași informație
- Cerut: site-ul să nu mai pară încărcat, dar să cuprindă aceleași informații (`/researcher`, apoi aprobarea echipei pentru toate cele 5 schimbări; „compară două universități” amânat)
- Făcut: pagina principală scurtă (lupă, două butoane, 10 cartonașe de categorii); pagini noi `/specializari` și `/specializari/[categorie]` cu domeniile pliabile și căutarea de specializări; la rezultat primul loc deschis, locurile 2 și 3 pliate, admitere / meserii / specializări pe rânduri pliabile, câte 3 universități și „Vezi toate”; la `/universitati` două filtre la vedere, „Mai multe filtre”, etichete de filtre active, cartonașe scurte, lista lumii pliată; fișa universității în 4 grupe cu bară fixă de sus; „Specializări” în meniu; titlul lung de pe cartonașul de rezultat nu mai iese din cadru pe telefon. Versiunea dinainte (cu căutare, filtre și fișe) fusese publicată la cererea echipei
- Fișiere: `apps/web/app/page.tsx`, `apps/web/app/specializari/**`, `apps/web/app/universitati/[id]/page.tsx`, `apps/web/components/{CategoryTiles,DomainDetails,SpecializationsBrowser,MatchCard,UniversityList,UniversityCard,UniversitySearch,NavLinks}.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); capturi întregi pe laptop și telefon pentru pagina principală, top 10, rezultat, fișă; la 375px în browser: test → rezultat (cartonașe pliate care se deschid, rânduri pliabile, „Vezi toate”, cursoare, „Reia testul”), fișa (cele 4 ancore ajung sub bară), căutarea de specializări. Un avertisment de „hydration” pe `/specializari` apare doar pe serverul de dezvoltare (HTML vechi păstrat de el), nu în build-ul de producție — de reverificat după publicare. NEVERIFICAT: folosirea doar din tastatură; nepublicat
- Urmează: publicare cu acordul echipei; `/pitch` (prezentarea e pe 2026-10-05)

### 2026-10-04 17:55 — reparații după verificarea codului
- Cerut: verificarea întregii lucrări înainte de publicare (`reviewer`)
- Făcut: nimic grav găsit; reparate trei lucruri mici în căutare: linkurile din lista lumii se afișează doar dacă sunt adrese web obișnuite; cât se încarcă lista apare „Se caută…”, iar dacă nu se poate încărca apare un mesaj clar; `?prestigiu=national` nu mai e numărat ca filtru
- Fișiere: `apps/web/components/UniversitySearch.tsx`
- Poartă: TRECUT (build, 55 teste, pornire); în browser: căutarea „oxford” (mesajul de încărcare, apoi rezultatele), adrese cu valori greșite (stare goală prietenoasă), filtre România + fără taxă + cămin (10 rezultate), panoul de filtre, butonul Înapoi al browserului
- Urmează: publicare cu acordul echipei; `/pitch`

### 2026-10-04 17:40 — pagină principală, căutare, filtre top 10 și fișe de universități
- Cerut: pagină principală cu lupă de căutare, toate specializările cu detalii, filtre (țară, specializare, buget, prestigiu, admitere, burse, cămin, certificate) cu top 10, fișă cu informații utile pentru fiecare universitate (admitere, avantaje, dezavantaje), Ivy League și cât mai multe universități din România; testul pe pagina lui, iar după test specializările potrivite și drumul spre universitățile care le au. Echipa a anunțat că ora prezentării s-a schimbat și că nu mai e grabă
- Făcut: `/` pagină principală (căutare, butoane spre test și top 10, 206 specializări în 10 categorii cu filtru); `/test` testul; `/universitati` căutare + filtre + top 10, cu starea în adresă; `/universitati/[id]` fișa (119 universități: 62 din România, 57 din străinătate, cele 8 Ivy League); lista lumii (10.248, doar nume, țară, site) la căutare; la rezultat: 3 specializări potrivite pe domeniu și buton spre universități; meniu sus pe toate paginile; pagină 404 în română
- Fișiere: `apps/web/lib/{types,data,match,universities}.ts`, `apps/web/lib/universities*.test.ts`, `apps/web/data/{universities-ro,universities-abroad,specializations,categories}.json`, `apps/web/public/world-universities.json`, `apps/web/app/**`, `apps/web/components/**`
- Poartă: TRECUT (build, 55 teste, pornire); văzute în capturi: pagina principală, top 10, filtrul Ivy League, căutarea „cluj” la lățime de telefon, fișa Harvard; parcurs în browser: test → rezultat cu specializări → „Vezi universitățile” → top 10 → fișă; fără erori în consolă. NEVERIFICAT: corectitudinea fișelor (verificate online doar regulile SAT/ACT și de ajutor financiar la cele 10 universități din SUA și existența câtorva universități românești noi; restul din cunoștințe generale, marcat „orientativ” pe site); butonul Înapoi al browserului pe pagina de filtre; folosirea doar din tastatură
- Urmează: `reviewer` pe tot diff-ul, reparații, publicare cu acordul echipei; `/pitch`

### 2026-10-04 16:15 — Zara Faflei, a șaptea părere
- Cerut: adăugarea Zarei Faflei (Sciences Po Paris), cu poza trimisă de Pilot
- Făcut: părerea pusă exact cum a fost dată; poza decupată pe față (320px). Asistentul AI cerut între timp a fost abandonat de echipă (ar fi cerut o cheie plătită)
- Fișiere: `apps/web/data/testimonials.json`, `apps/web/public/studenti/zara-faflei.jpg`
- Poartă: TRECUT (build, teste, pornire); pagina văzută într-o captură
- Urmează: republicare; `/pitch`

### 2026-10-04 16:00 — studenții de la aceeași universitate, unul lângă altul
- Cerut: pe pagina „Ce spun studenții”, cei de la aceeași facultate să apară unul lângă altul
- Făcut: părerile sunt grupate pe universitate (câmp nou `university` în date); un grup cu mai mulți studenți are un titlu mic și cartonașele alăturate pe ecran lat, unul sub altul pe telefon (acum: Mihai Florea și Anton Mocanu, IE University)
- Fișiere: `apps/web/app/studenti/page.tsx`, `apps/web/data/testimonials.json`, `apps/web/lib/types.ts`
- Poartă: TRECUT (build, teste, pornire); pagina văzută în capturi pe laptop și la lățime de telefon
- Urmează: republicare; `/pitch`

### 2026-10-04 15:50 — încă doi studenți
- Cerut: adăugarea a încă două păreri reale date de Pilot
- Făcut: Anton Mocanu (IE University) și Alexa Munteanu (Universitatea din Amsterdam — Politică, Economie și Filozofie), fără poze (inițială în cerc); la textul Alexei corectate doar greșelile de tastare și diacriticele
- Fișiere: `apps/web/data/testimonials.json`
- Poartă: TRECUT (build, teste, pornire); pagina văzută într-o captură la lățime de telefon, cu șase cartonașe
- Urmează: republicare; `/pitch`

### 2026-10-04 15:35 — poza Victoriei Dumitru
- Cerut: poza Victoriei Dumitru atașată la părerea ei
- Făcut: poza decupată pe față (320px) și pusă pe cartonașul ei; textul alternativ al pozelor reformulat neutru
- Fișiere: `apps/web/public/studenti/victoria-dumitru.jpg`, `apps/web/data/testimonials.json`, `apps/web/app/studenti/page.tsx`
- Poartă: TRECUT (build, teste, pornire); pagina văzută într-o captură la lățime de telefon, cu cele trei poze
- Urmează: republicare; `/pitch`

### 2026-10-04 15:25 — părerile studenților pe pagină
- Cerut: patru studenți reali (păreri și poze date de Pilot, cu acordul lor): numele și facultatea sus, părerea jos, poza în lateral; fără an de studiu
- Făcut: Alexandru Badea (University of Cambridge), Victoria Dumitru (Drept, Universitatea din București), Mihai Florea (IE University), Tudor Demușcă (Management, ASE București); poze rotunde în stânga pentru Mihai și Tudor (decupate pe față, 320px), inițială în cerc pentru ceilalți doi; textele puse cum au fost date, corectate doar greșelile de tastare și diacriticele
- Fișiere: `apps/web/data/testimonials.json`, `apps/web/public/studenti/*.jpg`, `apps/web/app/studenti/page.tsx`, `apps/web/lib/types.ts`
- Poartă: TRECUT (build, 24 teste, pornire); pagina văzută întreagă într-o captură la lățime de telefon, cu ambele poze
- Urmează: republicare; `/pitch`

### 2026-10-04 15:05 — culorile logoului, plus auriu
- Cerut: același design, dar în culorile logoului plus încă una la alegerea lui Claude
- Făcut: versiunea cu aspectul nou și activitățile publicată la cererea echipei; apoi paleta schimbată doar din `globals.css`: bleumarin (text), burgundi (butoane), fundal crem cald, plus auriu ca a treia culoare; confetti în aceleași culori; capturi de ecran în `docs/screens`
- Fișiere: `apps/web/app/globals.css`, `apps/web/components/Confetti.tsx`, `docs/screens/*.png`
- Poartă: TRECUT (build, 24 teste, pornire); văzute în capturi întregi: start, întrebare, activități, rezultat (laptop și telefon), pagina studenților
- Urmează: republicare; părerile studenților; `/pitch`

### 2026-10-04 14:40 — activitățile elevului luate în calcul
- Cerut: după cele 12 întrebări, un pas în care liceanul își pune concursurile, voluntariatul și activitățile extra, cu poza diplomei, luate în calcul la potrivire
- Făcut: pasul „Ce ai făcut până acum?” (până la 5 activități: fel, domeniu, nivel la concursuri, nume și poză opționale, „Sar peste”); activitățile intră în potrivire și apar la motive; la rezultat, secțiunea „Am ținut cont și de activitățile tale” cu poza. Poza e doar dovadă: e micșorată și păstrată numai în browserul elevului, aplicația nu o citește și nu o trimite nicăieri (fără AI)
- Fișiere: `apps/web/lib/activities.ts`, `apps/web/lib/activities.test.ts`, `apps/web/lib/match.ts`, `apps/web/lib/types.ts`, `apps/web/lib/session.ts`, `apps/web/components/ActivitiesStep.tsx`, `apps/web/components/ActivitiesSummary.tsx`, `apps/web/app/quiz/page.tsx`, `apps/web/app/rezultat/page.tsx`
- Poartă: TRECUT (build, 24 teste, pornire); în browser: profil → 12 întrebări → pasul bonus (butonul de adăugare blocat fără fel/domeniu/nivel, olimpiadă națională cu nume și poză de 1600×1100 micșorată la 480px, 4 voluntariate, limita de 5) → „Oriunde” → Medicină 92%, Asistență 88%, Psihologie 87%, secțiunea cu poza, motivul cu activitatea; fără erori în consolă. NEVERIFICAT: poză făcută cu un telefon adevărat; mesajul pentru poză prea mare. Nepublicat (nici aspectul nou)
- Urmează: echipa aprobă aspectul → republicare; părerile studenților; `/pitch`

### 2026-10-04 14:20 — aspect nou, vesel, în culori reci
- Cerut: site mai vesel și colorat, în stilul unui șablon arătat de echipă (titluri groase, fundal cu puncte, desene, animații), dar în culori reci cu mai multe nuanțe
- Făcut: paletă rece (bleumarin, albastru, turcoaz, violet, albastru-cer, mentă) cu nume noi de culori; culoare și emoji pe familii de domenii; desene proprii (tocă, drum, cărți, diplomă, steluțe); animații scurte, confetti la rezultat; mesaje de încurajare în test; logo cu fundal transparent (`public/logo.png`). Funcționarea e neschimbată
- Fișiere: `apps/web/app/globals.css`, `apps/web/app/**/page.tsx`, `apps/web/components/**` (noi: `Illustrations.tsx`, `Confetti.tsx`, `domainStyle.ts`), `apps/web/public/logo.png`
- Poartă: TRECUT (build, 18 teste, pornire); în browser, pe laptop și la 375px: tot traseul, cursoare, revenire, „Reia testul”, pagina studenților, nimic nu iese din ecran, fără erori în consolă. NEVERIFICAT: cum arată ecranele întregi de întrebări și rezultat (unealta de capturi prinde doar un colț; văzut întreg doar ecranul de start) — de privit de echipă. Nepublicat
- Urmează: echipa se uită și aprobă → republicare; părerile studenților; `/pitch`

### 2026-10-04 13:55 — buton „Înapoi” pe pagina studenților
- Cerut: buton de mers înapoi pe pagina „Ce spun studenții”
- Făcut: butonul „← Înapoi”, sus pe pagină, duce la pagina de început
- Fișiere: `apps/web/app/studenti/page.tsx`
- Poartă: TRECUT; văzut în browser la 375px și apăsat: duce la start. Nepublicat
- Urmează: părerile studenților → republicare; `/pitch`

### 2026-10-04 13:50 — poartă completă cerută de echipă + o reparație mică la cursoare
- Cerut: `/gate`
- Făcut: parcurs tot site-ul local; găsit și reparat: dacă două cursoare se mișcau în aceeași clipă, prima mișcare se pierdea (un om cu un singur deget nu ajungea acolo)
- Fișiere: `apps/web/app/rezultat/page.tsx`
- Poartă: TRECUT — build, 18 teste, pornire; în browser: pagini deschise direct fără răspunsuri, start → 12 întrebări → „În străinătate” → rezultat, „Vezi toate”, linkuri în filă nouă, cursoare (3 mutate deodată), revenire, „Reia testul”, pagina studenților goală; fără erori în consolă. NEVERIFICAT acum: butonul „Înapoi” din întrebări; versiunea publică (nerepublicată după ultimele două schimbări)
- Urmează: părerile studenților → republicare; `/pitch`

### 2026-10-04 13:40 — pagina „Ce spun studenții” (fără păreri încă)
- Cerut: buton pe pagina de început spre păreri reale de la studenți și absolvenți: nume, facultate, an sau absolvent, ce au de spus; fără poze; deocamdată fără niciun conținut
- Făcut: pagina `/studenti`, butonul „Ce spun studenții” pe start, fișierul gol `data/testimonials.json` în care se pun părerile când le aduce echipa; „Ce-ar fi dacă?” terminat, verificat și publicat între timp
- Fișiere: `apps/web/app/studenti/page.tsx`, `apps/web/app/page.tsx`, `apps/web/data/testimonials.json`, `apps/web/lib/types.ts`, `apps/web/lib/data.ts`
- Poartă: TRECUT; văzut în browser: butonul duce la pagină, mesajul pentru lista goală, cartonașul la 375px cu un text de probă (șters apoi). Nepublicat
- Urmează: echipa trimite părerile → le pun în fișier → poartă → republicare

### 2026-10-04 13:05 — publicare online și „Ce-ar fi dacă?” (în lucru)
- Cerut: test pe telefon; funcția cu cursoare „Ce-ar fi dacă?”
- Făcut: site publicat la https://unipath-taupe-mu.vercel.app (proiect Vercel `unipath`), aprobarea notată în `CLAUDE.md`; calculul pentru cursoare (`studentTraits`, `matchByTraits`) cu 6 teste noi; ecranul cu cursoare e în lucru la agentul `frontend`
- Fișiere: `apps/web/lib/match.ts`, `apps/web/lib/match.test.ts`, `apps/web/.gitignore`, `CLAUDE.md`, `README.md`
- Poartă: versiunea publică parcursă la 375px (start → 12 întrebări → rezultat), fără erori în consolă; funcția nouă NEVERIFICATĂ în browser și nepublicată
- Urmează: integrarea cursoarelor, poartă, republicare

### 2026-10-04 13:00 — logoul echipei în site
- Cerut: logoul UniPath trimis de echipă să apară în site
- Făcut: logoul pus în antet (emblema) și mare pe ecranul de start; culorile site-ului luate exact din logo (bej, bleumarin, burgundi)
- Fișiere: `apps/web/public/logo.jpg`, `apps/web/components/Shell.tsx`, `apps/web/app/page.tsx`, `apps/web/app/globals.css`
- Poartă: TRECUT (build, teste, pornire); ecranul de start văzut în browser pe laptop cu logoul afișat
- Urmează: publicare pentru test pe telefon, apoi funcțiile în plus alese de echipă

### 2026-10-04 12:50 — UniPath, versiunea simplă de demo
- Cerut: cea mai simplă versiune de arătat; nume UniPath; culori bej, burgundi, bleumarin
- Făcut: 40 de domenii, 12 profiluri, 12 întrebări, regula de potrivire cu teste; 3 ecrane (start, întrebări, rezultat) în culorile noi; lista de 88 de universități pusă în site după verificarea online (România aproape toată, străinătatea doar regulile de taxe și limbă pe țări)
- Fișiere: `apps/web/data/*.json`, `apps/web/lib/match.ts`, `apps/web/lib/match.test.ts`, `apps/web/lib/session.ts`, `apps/web/app/**`, `apps/web/components/**`
- Poartă: TRECUT (parole, fișiere, registru, build, 12 teste, pornire); fluxul parcurs în browser pe laptop (profil militar → 12 întrebări → „În străinătate” → rezultat, inclusiv cazul fără universități) și ecranul de start la 375px. NEVERIFICAT: ecranele de întrebări și rezultat la 375px văzute de mine; universitățile din străinătate (site, nume, domenii) online
- Urmează: `reviewer`, salvare, `/deploy-demo`, apoi paginile în plus

### 2026-10-04 12:30 — scheletul site-ului UniPath (în lucru)
- Cerut: construirea site-ului ales (ghid de facultate), cu universități din România și din străinătate, culori reci, numele UniPath
- Făcut: aplicație Next.js în `apps/web`, contractul de date, teste (vitest), poarta configurată; agenții `backend` (date + potrivire) și `frontend` (ecrane) lucrează în paralel; lista de 88 de universități e ciornă, în curs de verificare online
- Fișiere: `apps/web/` (schelet, `lib/types.ts`, `lib/data.ts`, `lib/match.ts`, `data/*.json`), `gate.config.json`
- Poartă: rulată în timp ce agenții încă scriu — rezultatul e orientativ; fluxul nu a fost parcurs
- Urmează: integrare, poartă completă, parcurs fluxul, `reviewer`, apoi `/deploy-demo`

### 2026-10-04 12:10 — alegerea ideii
- Cerut: idei pentru tema „The Middle Man” (start-up sau aplicație)
- Făcut: cerințele salvate; trei runde de idei cu agentul `ideator`; echipa a ales o idee proprie — ghid de facultate pentru liceeni; stack fixat (Next.js, fără chei, date scrise dinainte)
- Fișiere: `docs/challenge.md`, `docs/ideas.md`, `CLAUDE.md`
- Poartă: NEVERIFICAT pe build / teste / pornire (nu există încă aplicație); originalitatea ideii alese nu a fost căutată
- Urmează: confirmarea acoperirii facultăților și a numelui, apoi `/foreman`

### 2026-10-04 — deploy prin Vercel CLI
- Cerut: echipa nu știe să facă deploy; Claude să se ocupe de tot
- Făcut: Vercel CLI instalat și logat; `/deploy-demo` rescris (întreabă o dată „public acum?”, apoi republică singur; dă doar adresa scurtă; verifică prin conținut); regulă de stack compatibil cu Vercel; deploy de probă reușit la https://hackaton-proba.vercel.app
- Fișiere: `.claude/skills/deploy-demo/SKILL.md`, `.claude/skills/foreman/SKILL.md`, `.claude/settings.json`, `CLAUDE.md`, `ghid.html`
- Poartă: TRECUT pe parole și fișiere; pagina de probă verificată că se deschide fără logare. NEVERIFICAT: fluxul complet din skill și un deploy cu aplicație reală cu build
- Urmează: primul deploy real la hackathon, cu `/deploy-demo`

### 2026-10-04 — testarea mesajelor din ghid
- Cerut: mesajele gata făcute din ghid să fie încercate în sesiuni reale
- Făcut: 7 mesaje testate pe o aplicație de probă, într-o copie separată (unde am rămas, funcționalitate nouă, depanare, poartă, salvare, deploy, pitch); reparat hook-ul de final, care cerea poarta și fără cod schimbat; lista de la deploy folosește acum TRECUT / PICAT / NEVERIFICAT
- Fișiere: `scripts/gate.mjs`, `.claude/skills/gate/SKILL.md`, `.claude/skills/deploy-demo/SKILL.md`
- Poartă: TRECUT în copia de test (build, teste, pornire). NEVERIFICAT: pagina în browser; economia de tokeni pe un proiect mare
- Urmează: —

### 2026-10-03 — hartă, registru și ghid la zi
- Cerut: sesiunile viitoare să nu ardă tokeni pe navigare și să știe ce s-a făcut
- Făcut: `docs/MAP.md` generat automat (etapă, skilluri, agenți, cod) și încărcat în fiecare sesiune; `docs/LEDGER.md` obligatoriu prin poartă; lucru direct pe `main`; ghidul actualizat, cu mesaje care trimit la hartă și registru
- Fișiere: `scripts/map.mjs`, `scripts/gate.mjs`, `.githooks/pre-commit`, `CLAUDE.md`, `ghid.html`, `.claude/skills/git-workflow/SKILL.md`
- Poartă: TRECUT; refuzul commit-ului fără intrare în registru verificat în copia de test
- Urmează: —

### 2026-10-03 — porți de verificare și repetiție completă
- Cerut: un tester cu porți, fiindcă echipa poate rata lucruri
- Făcut: `scripts/gate.mjs`, blocare la commit și la finalul răspunsului, skill `/gate`, agent `tester` întărit; repetiție completă cu aplicația de probă „Strada Mea”
- Fișiere: `scripts/gate.mjs`, `.githooks/pre-commit`, `.claude/settings.json`, `.claude/skills/gate/SKILL.md`, `.claude/agents/tester.md`, `gate.config.json`
- Poartă: TRECUT în repetiție (build, teste, pornire), după două greșeli reparate
- Urmează: —

### 2026-10-03 — pregătirea proiectului
- Cerut: folder gata de hackathon, cu skilluri, agenți și verificări
- Făcut: repo git + GitHub privat; skilluri (`ideate`, `foreman`, `scaffold-feature`, `researcher`, `debugging`, `coordonator`, `git-workflow`, `pitch`, `token-budget`) și agenți; ghid pentru echipă; îmbunătățiri din cercetarea pe GitHub
- Fișiere: `.claude/`, `ghid.html`, `CLAUDE.md`
- Poartă: TRECUT pe parole și fișiere; build / teste / pornire NEVERIFICAT (nu există încă aplicație)
- Urmează: tema hackathonului → `/ideate`

## Commit-uri (automat)

<!-- commits:start -->
- 2026-10-24 23:30 `13518bf` feat: add drawings to the universities, guides and fields pages
- 2026-10-24 22:08 `fcc2f62` feat: list the team's top Romanian universities first; fix Artifex fee
- 2026-10-24 21:49 `eacbed4` feat: show how many universities each city has in the city filter
- 2026-10-24 03:19 `d70a411` feat: filter universities by the yearly tuition they start from
- 2026-10-23 23:40 `9723d41` feat: show the exact yearly tuition on 772 university sheets
- 2026-10-23 14:03 `8e52be8` feat: add 147 university sheets with official sources and photos
- 2026-10-23 12:13 `60a3d62` feat: favourite heart on the university search cards
- 2026-10-23 12:06 `c833f37` feat: search suggestions, phone menu, accessibility fixes, page titles
- 2026-10-23 11:39 `23ff2fc` feat: keep the university search when coming back from a sheet
- 2026-10-23 11:33 `0e5c950` feat: freely licensed university photos on sheets, third fee check
- 2026-10-23 01:57 `774d9f6` feat: keep only the privacy link in the page footer
- 2026-10-23 01:53 `54da51b` feat: operator name and contact email on the privacy page
- 2026-10-23 01:25 `abc6d65` feat: email code for admins, security emails on password change and deletion
- 2026-10-22 02:47 `d1f4f32` docs: launch preparation, production database and settings ready
- 2026-10-21 18:16 `c711921` feat: second fee check, 11 more levels corrected from official pages
- 2026-10-21 17:39 `0a5d0cf` feat: clearer cost filter with euro bands, 10 more results, checked fees
- 2026-10-21 16:19 `091c093` feat: friendly error pages with the broken-road drawing
- 2026-10-21 16:09 `c6c72c5` feat: sitemap, robots rules, one official address and page descriptions
- 2026-10-21 03:24 `d99a168` feat: greet signed-in visitors on the home page, go home after sign-out
- 2026-10-21 03:10 `3739afd` feat: favourite universities in the account, findmyuni.ro in link previews
- 2026-10-21 02:32 `98a6891` feat: account card first on the result page
- 2026-10-21 00:29 `72d63d0` feat: faster navigation, Frankfurt region, findmyuni.ro domain
- 2026-10-20 02:24 `df419da` feat: bot check on sign-up, data retention, backups, launch guide
- 2026-10-20 01:55 `31da3e0` feat: rate limits, 16+ accounts, privacy page, my-data page, ZAP scan
- 2026-10-20 01:00 `cd56f9b` feat: restore NTUA in the Greek programme catalogue
- 2026-10-19 18:15 `673cf7b` feat: add programme catalogues for seven more EU countries
- 2026-10-19 04:19 `caece3c` feat: username and password accounts with email code verification
- 2026-10-19 03:23 `90b1388` feat: guides for every country, hide data counts, guide search
- 2026-10-19 02:11 `efdb4e4` feat: welcome home page with cloud buttons, hide counts, collapse cities
- 2026-10-19 01:53 `ec9d731` feat: rename the site to FindMyUni
<!-- commits:end -->
