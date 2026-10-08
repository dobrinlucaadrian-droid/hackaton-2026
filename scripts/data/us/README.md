# United States: institutions and bachelor fields of study

Output: `apps/web/data/catalog/us-institutions.json` (1,942 institutions, 0.66 MB) and `apps/web/data/catalog/us-programs.jsonl.gz`
(63,738 rows, 2.25 MB gzipped, one JSON object per line; about 30 MB unzipped, so the JSON Lines form is used). Check: `node scripts/data/validate.mjs us` prints VALID.

## Source

U.S. Department of Education, **College Scorecard** (collegescorecard.ed.gov), "Download the Data" page, data last updated June 10, 2026.

- Field of study: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Field-of-Study_06102026.zip (17 MB; CSV 153 MB)
- Institution level: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Institution_06102026.zip (23 MB; CSV 100 MB)
- Page that lists them: https://collegescorecard.ed.gov/data/
- Downloaded: 2026-10-08.

Terms: the data is published by a U.S. federal agency on an official .gov site. **No licence or terms-of-use statement was found** on the download page or the
pages reachable from it (the footer only links to the Department's general "required notices"). It is US federal government data, which in general is not
subject to US copyright, but this was not stated for the dataset itself; confirm before any public release. Attribution used: "U.S. Department of Education, College Scorecard".

## Rebuild

1. Download and unzip the two files above into one folder (for example `db/us/x_Field.../` and `db/us/x_Institution.../`).
2. `node scripts/data/us/build.mjs <that folder>` (Node 24, no packages). It finds the two CSVs inside, writes both output files and deletes a stale `us-programs.json` if present.
3. `node scripts/data/validate.mjs us`.

## What is kept

One row per institution and 4-digit CIP field (CREDLEV = 3, "Bachelor's Degree"). Institution filters, applied in this order to the 6,273 institutions in the file:

| Filter | Removed |
| --- | --- |
| not currently operating (CURROPER = 0) | 30 |
| not the main campus (MAIN = 0) | 1,300 |
| not a 4-year institution (ICLEVEL != 1: 2-year, less-than-2-year) | 2,465 |
| for-profit (CONTROL = 3) | 196 |
| outside the 50 states + DC (territories) | 54 |
| kept: public and private non-profit | 2,228 |
| of those, no bachelor row in the field-of-study file | 286 |
| **final institutions** | **1,942** (703 public, 1,239 private non-profit) |

Field rows: 227,980 in the file, 63,741 bachelor rows at the 2,228 kept institutions, 3 dropped (CIP "Reserved" and 2 high-school diploma rows, which are not bachelor fields) = **63,738 programmes**.

## Mapping

- Programme `name` = CIP field title, trailing period dropped. `domain` = the 2-digit CIP family title (CIP 2020 titles typed into build.mjs).
- `domainId`: table in build.mjs (4-digit CIP first, then 2-digit family). 9,675 programmes (15.2%) have `null` where no clear fit exists (general studies, area studies, interdisciplinary, health administration, etc.).
- USA: medicine, dentistry, pharmacy, veterinary medicine and law are graduate degrees. No bachelor field is mapped to `medicina`, `medicina-dentara`, `farmacie` or `medicina-veterinara` (0 programmes; pre-medicine, pharmaceutical sciences, dental support and veterinary technology stay `null`). CIP 22 (legal) is mapped to `drept` as requested (mostly non-professional legal studies).
- Ten institutions reuse existing sheet ids (`harvard`, `yale`, `princeton`, `columbia`, `upenn`, `brown`, `dartmouth`, `cornell`, `mit`, `stanford`, `hasSheet: true`); all ten were found. Other ids are `us-` + name slug (+ UNITID on collisions).
- `city` = "City, ST" of the institution (the Scorecard does not give a place per programme). `website` from INSTURL with `https://` added. `language` "engleză", `years` 4 (no credits, capacity, form or URL are invented).

## Known limits

- Field rows are Scorecard "pooled" completions (award years 2018-19 and 2019-20 are the newest); a field a university stopped or started since then is not reflected, and fields with very few graduates are listed (privacy-suppressed earnings and debt are not used here).
- Branch campuses are not included, so a system's other campuses are missing.
- Only the 4-year public and non-profit set: community colleges and for-profit colleges (some of which award bachelor's degrees) are out; so are the 286 4-year institutions with no bachelor rows in the file.
- Programme names are CIP categories (e.g. "Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing"), not each university's own degree titles, and no programme URLs exist.
- Share without a domain: 15.2%. The CIP table is our own choice.
