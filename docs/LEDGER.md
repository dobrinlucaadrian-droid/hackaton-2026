# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** UniPath — ghid între liceu și facultate (tema „The Middle Man”). Prezentarea e mâine, 2026-10-05 (ora nu a fost spusă)
- **Unde:** aplicația e în `apps/web` (pagini: `/`, `/specializari`, `/specializari/[categorie]`, `/universitati`, `/universitati/[id]`, `/test`, `/quiz`, `/rezultat`, `/studenti`), publicată la https://unipath-taupe-mu.vercel.app
- **Urmează:** `/pitch` — prezentarea și scenariul de demo (prezentarea e pe 2026-10-05). Pagina studenților are 14 păreri reale; fără poză: Alexandru Badea și Alexa Munteanu
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
- 2026-10-04 15:36 `140f3a3` feat: show students from the same university side by side
- 2026-10-04 15:32 `53386e1` feat: add two more student opinions
- 2026-10-04 15:25 `dfe2825` feat: add Victoria Dumitru's photo to her opinion
- 2026-10-04 15:18 `b51f84f` feat: four real student opinions with photos on the student voices page
- 2026-10-04 14:56 `dbc0fef` feat: logo palette (navy, burgundy) plus gold on the new design
- 2026-10-04 14:43 `79f354e` docs: add screenshots of each screen
- 2026-10-04 14:35 `7392526` feat: activities step - competitions, volunteering and diploma photo feed the matching
- 2026-10-04 13:59 `b40f794` feat: cheerful cool-colour redesign with illustrations and animations
- 2026-10-04 13:37 `da25839` feat: back button on the student voices page
- 2026-10-04 13:35 `6aabf5a` fix: slider changes made at the same instant no longer overwrite each other
- 2026-10-04 13:31 `ba2ae6b` docs: phone test confirmed by the team
- 2026-10-04 13:29 `fe42b3d` feat: student voices page, empty until the team brings real opinions
- 2026-10-04 13:13 `45755bb` docs: add QR code for the public address
- 2026-10-04 13:05 `a89bbaa` feat: what-if sliders on the result page; record deploy address
- 2026-10-04 12:54 `34e9f2e` feat: show the team logo and match the palette to it
- 2026-10-04 12:40 `5082a83` feat: UniPath demo version - profile, quiz and matched study domains
- 2026-10-04 12:13 `933cc25` docs: add universities abroad and named university lists to scope
<!-- commits:end -->
