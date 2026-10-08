# Poland: institutions and first-cycle / long-cycle programmes

## Source
- RAD-on (Ministry of Science and Higher Education) open API over the POL-on register, no key needed.
  - Programmes: `https://radon.nauka.gov.pl/opendata/polon/courses` (register count 11,674 course records, API version 1.9.0)
  - Institutions: `https://radon.nauka.gov.pl/opendata/polon/institutions` (839 records)
  - Catalogue entries on dane.gov.pl: "Studia prowadzone na określonym kierunku" (https://dane.gov.pl/pl/dataset/1892) and "Instytucje systemu szkolnictwa wyższego i nauki w Polsce" (https://dane.gov.pl/pl/dataset/57)
- Licence: CC0 1.0 (public domain dedication) per the dane.gov.pl metadata of both datasets (checked through https://api.dane.gov.pl/1.4/datasets/1892 and /57). No attribution required; we still name the source as "RAD-on POL-on 2026-10". The radon.nauka.gov.pl site itself has no separate terms page that could be read without a browser (it is a JavaScript app), so the CC0 statement comes from dane.gov.pl only.
- Downloaded: 2026-10-08 (snapshot of the register on that day; API `lastRefresh` values go up to about 2025-10).

## Rebuild
```
node scripts/data/pl/build.mjs <scratch-folder>
node scripts/data/validate.mjs pl
```
Node 24, no packages. The script downloads sequentially (100 per page, 250 ms pause), saves every page in the scratch folder (a rerun reuses them) and writes `apps/web/data/catalog/pl-institutions.json` and `pl-programs.jsonl.gz`.

Paging detail: the API pages with a time cursor (`token`) and loses some records that share a timestamp (page size 100 gave 11,639 of 11,674). The script re-reads with other page sizes (99, 97, ...) and merges by id until the register's own count is reached; here two sizes were enough (11,674 of 11,674).

## Filters and mapping
Only the register's structured fields decide what is kept; no filtering by words in a name.
- Level: "pierwszego stopnia" (first cycle) and "jednolite magisterskie" (long cycle, e.g. medicine, law). Dropped: second cycle (4,478 course records).
- Institution status: the main institution must have status "Działająca" (statusCode 1) in the institutions register. Dropped: 17 institutions with 48 running instances - 10 "W likwidacji" (in liquidation), 5 "Zlikwidowana" (liquidated), 2 "Przekształcona" (transformed into another school). The build prints their names.
- Course status: the course record must be "prowadzone" (running). Dropped: 1,193 records (zarchiwizowane, zlikwidowane, wygaszane = being phased out, no new students).
- Course records without instances: 203 dropped. Each has status "prowadzone" but no creationDate and no instance, so no start date, form or language: the permission exists, teaching has not been registered. Examples: AGH "Recykling i Metalurgia" (legal basis 2025-02-11), Wojskowa Akademia Medyczna "Ratownictwo medyczne", Warszawska Szkoła Artystyczna "Charakteryzacja i kostiumografia".
- Instance status: the course instance must be "prowadzone" (278 dropped) and must not be bridging studies (bridging = "Tak": 72 dropped, short top-up courses for working nurses and midwives, 2-3 semesters, 0 ECTS).
- Legacy versions inside one course record (the register keeps the old instances "prowadzone" until the last old-curriculum student leaves):
  - an instance that still carries an earlier name of the course is dropped when the record has a running instance under its current name (181 dropped; e.g. AGH "Górnictwo i geologia [obowiązująca do 2019-09-30]" inside "Inżynieria górnicza", Uniwersytet Warszawski "Orientalistyka - sinologia" inside "Kultury Azji i Afryki - sinologia");
  - for each form + language + degree title only the instance with the latest educationStartDate is kept (222 earlier curriculum versions dropped, plus 120 with the same start date, mostly language tracks of one philology programme).
  - 9 course records have no instance under their current name; their instances are kept and shown under the record's current name (printed by the build).
- One row = course record x form x language x degree title. Form: stacjonarne -> full-time, niestacjonarne -> part-time, dual = "Tak" -> dual. Language mapped to Romanian lower case.
- `name` = the course record's current name; a register note at the end ("[ustawa]", "(rozporządzenie)", "[obowiązująca do ...]", "(od 1.10.2021)") is removed.
- `domain` = the register's ISCED label (iscedName); `domainId` = `iscedToDomain(iscedCode)`.
- Institution = the main institution (mainInstitution*) of the course; branches ("Filia") belong to it, the programme `city` is the leading unit's city. Institution city, website from the institutions endpoint. kind: Uczelnia publiczna -> public, niepubliczna -> private, anything else (church schools) unknown. Faculty = organizational unit name after the institution name. credits = ECTS, years = semesters / 2.
- 119 rows identical in every output field (two course records, for example academic and practical profile) were collapsed into one.

## Counts (2026-10-08)
- 325 institutions (134 public, 185 private, 6 unknown), 8,641 programmes, 167 cities. Before this clean-up: 342 institutions, 9,083 programmes.
- Without app domain: 1,207 (14.0%) - mostly ISCED "Obszar nieznany" (9999), hair and beauty (1012), engineering not elsewhere classified (0719), interdisciplinary codes, "not further defined" codes.
- Languages: poloneză 7,952, engleză 571, ucraineană 23, rusă 22, others a handful.
- Spot checks: AGH 98 rows, 76 programme names (the university's site lists 77; the 77th is "Recykling i Metalurgia", in the register without instances); Uniwersytet Warszawski 159 rows, 119 names.

## Active institutions of the register with no row here (19, all checked in the source)
None has a running first-cycle or long-cycle instance, so none was added.
- No course record at all (14): Wyższe Seminarium Duchowne Towarzystwa Salezjańskiego w Lądzie; Instytut Teologiczny im. św. Jana Kantego w Bielsku-Białej; Wyższa Szkoła Teologiczno-Społeczna w Warszawie; Wyższa Szkoła Teologiczno-Humanistyczna im. Michała Beliny-Czechowskiego w Podkowie Leśnej; Wyższe Seminarium Duchowne Diecezji Pelplińskiej; Wyższy Instytut Teologiczny w Częstochowie; Wyższe Seminarium Duchowne w Przemyślu; Wyższe Seminarium Duchowne Kościoła Polskokatolickiego w Warszawie; Wyższe Seminarium Duchowne w Rzeszowie; Wyższe Seminarium Teologiczne imienia Jana Łaskiego w Warszawie; Wyższe Baptystyczne Seminarium Teologiczne w Warszawie; Wschód-Zachód Szkoła Wyższa im. Henryka Jóźwiaka (Łódź); Pomorska Wyższa Szkoła Nauk Stosowanych w Gdyni; Centrum Medycznego Kształcenia Podyplomowego (postgraduate only).
- Only programmes being phased out ("wygaszane") or closed (2): Szkoła Wyższa Ekonomii i Zarządzania w Łodzi; Wyższa Szkoła Turystyki i Języków Obcych w Warszawie.
- A first-cycle record without instances, teaching not registered (2): Wojskowa Akademia Medyczna (Ratownictwo medyczne); Warszawska Szkoła Artystyczna (Charakteryzacja i kostiumografia).
- Second cycle only (1): Wyższa Szkoła Medyczna w Legnicy (Pielęgniarstwo, drugiego stopnia).

## Known limits
- Programme `url`, `maxStudents` are not in the source and left out; `status` is always "prowadzone".
- The register does not give a tuition fee, admission thresholds or programme web page.
- The register has no English programme name: AGH's "Mechatronic Engineering" is the English-language row of "Inżynieria mechatroniczna" (language engleză).
- A programme whose teaching is not yet registered as an instance (e.g. AGH "Recykling i Metalurgia") is missing until the register gets the instance; without it there is no language or form to publish.
- "prowadzone" also covers programmes that still teach but may not admit this year; the register has no admission flag.
- 611 name + form + language combinations of an institution still have more than one row (882 extra rows): separate course records in another city (branch), faculty, profile (academic / practical), level (first cycle / long cycle) or degree title. Their keys get a city, level, title, faculty or instance-code suffix.
- Some branches are abroad (e.g. Bratysława, Praga); the row keeps country PL and the branch city.
- Programmes being phased out ("wygaszane") are excluded because they no longer admit students.
