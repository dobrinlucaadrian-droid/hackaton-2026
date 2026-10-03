# Registru

Ce urmărim, unde și ce s-a făcut. Claude adaugă o intrare după fiecare sarcină;
lista de commit-uri de la final se reface singură.

## Acum lucrăm la

- **Scop:** pregătirea proiectului înainte de hackathon
- **Unde:** `.claude/`, `scripts/`, `docs/`
- **Urmează:** când se anunță tema → `/ideate`

## Jurnal

<!-- Cea mai nouă intrare sus. Format:
### AAAA-LL-ZZ HH:MM — titlul sarcinii
- Cerut: ce a vrut echipa
- Făcut: ce s-a schimbat, pe scurt
- Fișiere: căile atinse
- Poartă: TRECUT / PICAT / NEVERIFICAT (și ce anume)
- Urmează: pasul următor
-->

### 2026-10-03 — pregătirea proiectului
- Cerut: folder gata de hackathon, cu skilluri, agenți și verificări
- Făcut: skilluri și agenți Claude, poartă de verificare, hartă a codului, registru, ghid pentru echipă
- Fișiere: `.claude/`, `scripts/gate.mjs`, `scripts/map.mjs`, `docs/ghid.html`, `CLAUDE.md`
- Poartă: TRECUT pe parole și fișiere; build / teste / pornire NEVERIFICAT (nu există încă aplicație)
- Urmează: tema hackathonului → `/ideate`

## Commit-uri (automat)

<!-- commits:start -->
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
