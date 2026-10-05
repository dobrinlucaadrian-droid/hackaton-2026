# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** UniPath — ghid între liceu și facultate (tema „The Middle Man”). Prezentarea e azi, 2026-10-05 (ora nu a fost spusă)
- **Unde:** aplicația e în `apps/web` (pagini: `/`, `/specializari`, `/specializari/[categorie]`, `/universitati`, `/universitati/[id]`, `/test`, `/quiz`, `/rezultat`, `/studenti`), publicată la https://unipath-taupe-mu.vercel.app
- **Urmează:** faza de producție pe ramura `production` (plan în `docs/production-plan.md`): pasul 1 — contul Convex al echipei, apoi tabelele și regulile de acces. Prezentarea a avut loc pe 2026-10-05; `main` rămâne cum a fost prezentat
- **De știut:** Vercel CLI e logat doar în aplicația Claude (cont `dobrinlucaadrian-7970`); proiectul de probă `hackaton-proba` din Vercel se poate șterge

## Jurnal

<!-- Cea mai nouă intrare sus. Format:
### AAAA-LL-ZZ HH:MM — titlul sarcinii
- Cerut: ce a vrut echipa
- Făcut: ce s-a schimbat, pe scurt
- Fișiere: căile atinse
- Poartă: TRECUT / PICAT / NEVERIFICAT (și ce anume)
- Urmează: pasul următor
-->

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
- 2026-10-05 00:48 `86d84fe` feat: keep a single logo on the home page
- 2026-10-05 00:27 `3551c80` feat: questionnaire start page with its own title and the start button on top
- 2026-10-05 00:12 `2c00f9b` feat: UniPath in numbers on the home page
- 2026-10-04 23:47 `f1683ad` feat: Politehnica faculties and programmes on its sheet, 12 more Romanian universities
- 2026-10-04 23:32 `803b972` feat: seven more student opinions with photos, and Anton Mocanu's photo
- 2026-10-04 23:10 `3d2e96b` feat: call the personality test a questionnaire (chestionar) in the UI
- 2026-10-04 23:02 `46df569` feat: remove the search box from the home page
- 2026-10-04 22:57 `956d89f` feat: search student opinions by faculty or university
- 2026-10-04 22:45 `9ca0e28` feat: ask the high-school profile as the first step of the test
- 2026-10-04 22:30 `564932a` feat: keep specializations only on their own page, not on the home page
- 2026-10-04 18:02 `97391c5` docs: record the published decluttered version in the ledger
- 2026-10-04 17:57 `9a716e4` feat: declutter pages - short home, specialization pages, collapsed result cards, compact filters and sheet
- 2026-10-04 17:24 `9b62030` docs: presentation moved to 2026-10-05
- 2026-10-04 17:22 `6092918` fix: world-list link check, loading and failure messages, ignore prestige=national
- 2026-10-04 17:19 `46b3584` feat: home page with search, specializations, top-10 filters and university profile sheets
- 2026-10-04 15:48 `a30bf9b` feat: add Zara Faflei's opinion and photo
<!-- commits:end -->
