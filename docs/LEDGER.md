# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** site care ghidează liceenii spre facultatea potrivită (tema „The Middle Man”); predare azi, 2026-10-04, la 18:00
- **Unde:** ideea e fixată în `docs/challenge.md` („Chosen idea”); nu există încă aplicație (`apps/` e gol)
- **Urmează:** `/foreman` — construim site-ul (Next.js în `apps/web`); acoperim toate domeniile de studiu (35–40), cu universități pe nume din România și din străinătate (lista e în `docs/challenge.md`, neverificată); numele e încă nedecis
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
- 2026-10-03 23:07 `15c0a6e` docs: add step-by-step hackathon guide in Romanian
- 2026-10-03 23:03 `24660c9` chore: cap ideator budget and switch it to sonnet
- 2026-10-03 23:01 `e83842b` feat: add ideate skill and ideator agent for choosing the idea
- 2026-10-03 22:56 `b14577a` feat: add researcher skill and agent for GitHub research
- 2026-10-03 22:44 `be03fe3` chore: initialize hackathon monorepo with Claude skills and agents
<!-- commits:end -->
