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
- Kept: course level "pierwszego stopnia" (first cycle) and "jednolite magisterskie" (long cycle, e.g. medicine, law); the course status and the course-instance status must both be "prowadzone" (running). Dropped: second-cycle (4,478 records), courses not running (1,193: zarchiwizowane, zlikwidowane, wygaszane = being phased out), courses without instances (203), instances not running (278).
- One row per course instance = programme x institution x form x language. Form: stacjonarne -> full-time, niestacjonarne -> part-time, dual = "Tak" -> dual. Language mapped to Romanian lower case.
- `domain` = the register's ISCED label (iscedName); `domainId` = `iscedToDomain(iscedCode)`.
- Institution = the main institution (mainInstitution*) of the course; branches ("Filia") belong to it, the programme `city` is the leading unit's city. Institution city, website from the institutions endpoint. kind: Uczelnia publiczna -> public, niepubliczna -> private, anything else unknown. Faculty = organizational unit name after the institution name. credits = ECTS, years = semesters / 2.
- 320 rows that were identical in every output field (the register has two course records, for example academic and practical profile, e.g. WUM "Kierunek lekarski") were collapsed into one.

## Counts (2026-10-08)
- 342 institutions, 9,083 programmes, 169 cities.
- Without app domain: 1,258 (13.9%) - mostly ISCED "Obszar nieznany" (9999), hair and beauty (1012), engineering not elsewhere classified (0719), interdisciplinary codes, "not further defined" codes.
- Languages: poloneză 8,367, engleză 594, rusă 23, ucraineană 23, others a handful.

## Known limits
- Programme `url`, `maxStudents` are not in the source and left out; `status` is always "prowadzone".
- The register does not give a tuition fee, admission thresholds or programme web page.
- 15 institution names end in "w likwidacji" (in liquidation) as the register names them; they still run some programmes.
- Institutions with several course records of the same name in different faculties get a key with a city or instance-code suffix.
- Programmes being phased out ("wygaszane") are excluded because they no longer admit students.
