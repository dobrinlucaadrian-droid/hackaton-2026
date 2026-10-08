# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** UniPath — ghid între liceu și facultate. Hackathonul s-a încheiat (prezentare pe 2026-10-05); acum se construiește versiunea de producție: conturi, bază de date Convex, păreri moderate, securitate
- **Unde:** versiunea de producție e pe ramura `production` (nepublicată; rulează local cu `npm run dev --prefix apps/web` și folosește baza Convex de dezvoltare, proiectul „unipath”). Versiunea prezentată e pe `main`, publică la https://unipath-taupe-mu.vercel.app, și nu se atinge până nu cere echipa. Planul: `docs/production-plan.md`
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
- 2026-10-08 23:46 `6cf706f` feat: completeness pass on the catalogue: Spain nationwide, France 2026, cleanups
- 2026-10-08 04:02 `ce1a3d5` ci: stop the secret scan from flagging programme identifiers in the catalogue data
- 2026-10-08 03:56 `4e1429c` ci: print which rule and file each secret-scan finding is in
- 2026-10-08 03:49 `2f23ae9` feat: catalogue for eleven countries, status report and home page totals
- 2026-10-08 03:38 `2a332f4` feat: multi-country programme catalogue from official open datasets
- 2026-10-08 03:13 `a9edb12` feat: Romanian catalogue of institutions and bachelor programmes from the official list
- 2026-10-08 02:47 `a381c2f` feat: ask for the full name at sign-in and keep it on the account
- 2026-10-08 00:16 `a1fd781` docs: research on official and open data sources for universities and programmes
- 2026-10-08 00:01 `914f800` docs: final launch steps and the new order of work
- 2026-10-07 01:16 `4e39abf` docs: record the CI scan results and what is left for the next level
- 2026-10-07 01:14 `c76d79c` feat: privacy page; generate route types before the CI type check
- 2026-10-07 01:11 `cd08d1a` feat: security headers and CSP, CI security scans, patched auth package
- 2026-10-06 01:59 `e44ee5f` docs: record where the production work stops for the day
- 2026-10-06 01:15 `20dc009` feat: public review form with bot check and rate limit, and the moderation page
- 2026-10-06 01:05 `a21a479` feat: development-only sign-in links in the function log; sign-in verified end to end
- 2026-10-06 00:27 `ce65453` feat: passwordless sign-in, account page and saving the result
- 2026-10-06 00:06 `b4aeabc` feat: Convex schema, shared access rules and access tests
- 2026-10-06 00:00 `2c23414` chore: start the production phase with Convex packages and the plan
- 2026-10-05 11:28 `81704e7` feat: use the team logo for the site icon and the link preview
- 2026-10-05 11:24 `f9a8e9a` docs: answers to the judging criteria
- 2026-10-05 11:19 `763e331` feat: show student opinions in university search results and on university sheets
- 2026-10-05 11:07 `fdc7024` feat: add three more student opinions with photos
- 2026-10-05 11:02 `7c6d654` fix: open a domain in place on the university sheet instead of leaving the page
- 2026-10-05 10:53 `c75b5eb` feat: subjects per year for every domain and official curriculum links
- 2026-10-05 10:20 `1aa0610` fix: spell the student's name Drăghici
- 2026-10-05 10:19 `4e9ff71` feat: add seven more student opinions with photos
- 2026-10-05 01:35 `65cbccc` feat: ask the city in the questionnaire and list only universities from that city
- 2026-10-05 01:24 `6d6fbdf` feat: 18 researched scenario questions in the questionnaire, balanced across the ten traits
- 2026-10-05 00:59 `482966a` feat: replace the random card with a guided interest picker on the specializations page
- 2026-10-05 00:51 `4c91def` feat: illustration and a surprise-me card on the specializations page
<!-- commits:end -->
