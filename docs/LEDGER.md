# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** site care ghidează liceenii spre facultatea potrivită (tema „The Middle Man”); predare azi, 2026-10-04, la 18:00
- **Unde:** aplicația e în `apps/web`, publicată la https://unipath-taupe-mu.vercel.app
- **Urmează:** părerile studenților (nume, facultate, an/absolvent, text) → `apps/web/data/testimonials.json` → republicare; apoi `/pitch`. Aspect: design vesel în culorile logoului (bleumarin, burgundi) plus auriu
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
- 2026-10-04 12:06 `6a9379d` docs: confirm data coverage by study domain
- 2026-10-04 12:05 `72dd44b` docs: lock the chosen idea, ideation report and stack
- 2026-10-04 00:14 `018e7d7` docs: move the team guide to the repo root
- 2026-10-04 00:13 `3d0f662` docs: bring ledger and map up to date
- 2026-10-04 00:12 `be94cb3` fix: Vercel login and env vars work from inside the Claude app only
- 2026-10-04 00:09 `23b8667` feat: deploy through Vercel CLI, stack must be Vercel-compatible
- 2026-10-04 00:05 `9b25b99` docs: deploy checklist reports in the gate's TRECUT/PICAT/NEVERIFICAT words
- 2026-10-04 00:02 `63186a4` fix: stop hook asks for the gate only on uncommitted code changes
- 2026-10-03 23:53 `cdd9525` docs: guide prompts point Claude at the map and ledger
- 2026-10-03 23:51 `733b7e4` docs: update team guide; map now orients new sessions and loads via CLAUDE.md
- 2026-10-03 23:48 `8878279` docs: work directly on main, no branches by default
- 2026-10-03 23:45 `18dd146` feat: add generated codebase map and ledger, enforced by the gate
- 2026-10-03 23:38 `ff87e15` chore: keep git hooks on LF line endings
- 2026-10-03 23:38 `bc6faeb` feat: add quality gate script, commit and Stop hooks, gate skill
- 2026-10-03 23:26 `4327ebd` feat: improve skills from GitHub research, add debugging skill
- 2026-10-03 23:21 `0e6b41d` fix: let ideator run gh search, pre-approve read-only searches
- 2026-10-03 23:14 `686d90a` docs: make coordonator optional, add cheap next-step rule
- 2026-10-03 23:12 `764afdd` feat: add coordonator skill, team roles and Romanian-language rule
<!-- commits:end -->
