# Lithuania (LT) — bachelor programmes catalogue

## Sources

1. **Studijų ir mokymų programų duomenys** — the register of study and training programmes and qualifications (SMPKR) kept by
   the National Agency for Education (Nacionalinė švietimo agentūra, NŠA), data.gov.lt dataset 3918, table `StudijuPrograma`.
   CSV: https://get.data.gov.lt/datasets/gov/nsa/smpkr/studiju_mokymu_programu_duomenys/StudijuPrograma/:format/csv
2. **LAMA BPO admission programmes** — the programmes of the national general admission to higher education run by LAMA BPO
   (Lietuvos aukštųjų mokyklų asociacija bendrajam priėmimui organizuoti), data.gov.lt dataset 2914, table `Programa`.
   CSV: https://get.data.gov.lt/datasets/gov/lamabpo/aukstosios_mokyklos/Programa/:format/csv

Licence: both **CC BY 4.0** (https://creativecommons.org/licenses/by/4.0/). Publisher: Valstybės duomenų agentūra (data.gov.lt).
Attribution: "Nacionalinė švietimo agentūra (SMPKR) and LAMA BPO, data.gov.lt, CC BY 4.0; data adapted by FindMyUni".

Downloaded: 2026-10-19. Full tables in one CSV each; the row counts match the API `?count()` (6,304 register rows, 3,187 admission rows).

## Steps

```
node scripts/data/lt/build.mjs <scratch folder>   # downloads programos.csv and bpo_programa.csv into the folder when missing
node scripts/data/validate.mjs lt
```

## Filters (what is kept)

1. Register rows with study cycle `Pirmosios pakopos studijos` (first cycle, university and college) or `Vientisosios studijos`
   (integrated long first degrees, e.g. medicine) — 4,707 other rows dropped (master, residency, pedagogy, short cycle, vocational, general education).
2. Not deregistered (`prg_isreg_data` empty) — 853 dropped; 744 registered first-cycle/integrated programmes remain.
3. Current: only programmes the LAMA BPO table lists for its latest admission year (**2025**; 2026 not published there yet),
   joined on the state code (`prg_valst_kodas` = `programos_valst_kodas`). 130 registered programmes are not in the 2025 admission and
   are dropped (among them all programmes of EHU, the Białystok University branch, Homo infinitum, Graičiūno school, Šiaurės Lietuvos
   kolegija and the Vilnius St. Joseph's Seminary, which are not in the general admission; their current status could not be confirmed).
4. One row per programme × offering institution × city, as the admission table gives them (612 repeated admission rows of the same
   combination merged). The institution is the one that offers the programme in the admission (by legal JAR code), not the one that first
   registered it — e.g. programmes registered by the former Aleksandras Stulginskis University are offered by Vytautas Magnus University.
5. City: taken from the admission municipality. A city municipality (`… miesto savivaldybė`) gives its city; a district municipality
   only when it carries the name of the institution's seat (Utenos rajono savivaldybė → Utena, Utenos kolegija). **24 rows dropped
   because the city is not stated clearly**: Mykolas Romeris University in "Marijampolės savivaldybė", Kauno kolegija in "Tauragės
   rajono savivaldybė", Vilnius Academy of Arts in "Telšių rajono savivaldybė" (the run prints the list). 6 programmes offered only
   there disappear with them.

Result: **27 institutions, 608 programmes in 694 rows, 7 cities; 10 institutions with a sheet; 101 rows (15%) without an app domain.**

## Fields

- `name`: `prg_pavad_lt` (Lithuanian). `domain`: the register's study sub-area (`stud_posritis_lt`).
- `domainId`: from the last four digits of `prg_isced_kodas` (7 digits: ISCED 2011 level code + ISCED-F 2013 field) via `iscedToDomain`.
  ISCED "broad programmes" codes (…0, e.g. 0410) and other unmapped fields give `null`.
- `credits`: `prg_apimtis_kred` (ECTS). `years`, `form`, `faculty`, `maxStudents`, `url` are left out: the sources do not give them.
- `language`: **"nespecificată"** — neither table has a language of teaching, so no language is claimed.
- `status`: "în admiterea generală 2025" (the programme is in the LAMA BPO 2025 general admission).
- Institutions: name and seat from the register (`prg_reg_inst_lt`, the city in `prg_reg_inst_adr`); the display name drops the legal-form
  words "Viešoji įstaiga" / "UAB" and quotes, `officialName` keeps them. `kind`: `private` when the legal form is UAB (company),
  `public` when the name says "valstybinė" (state), otherwise `unknown` (the sources have no ownership field). No websites.
- Sheets: matched by legal code to the 10 existing "Lituania" sheets (Vilnius University, KTU, VILNIUS TECH, VMU, LSMU, MRU,
  Klaipėda University, LSU, ISM, LCC), each checked against the register's English name.

## Limits

- Only programmes in the national general admission; institutions that admit on their own are missing (see filter 3).
- The 2025 admission is the latest published; programmes opened for 2026 are not yet included.
- No language of teaching, so English-taught programmes cannot be told apart.
