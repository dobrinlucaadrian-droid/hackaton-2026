# United States: institutions and bachelor fields of study

Output: `apps/web/data/catalog/us-institutions.json` (2,053 institutions, 0.70 MB) and `apps/web/data/catalog/us-programs.jsonl.gz`
(65,202 rows, 2.30 MB gzipped, one JSON object per line; about 30 MB unzipped, so the JSON Lines form is used). Check: `node scripts/data/validate.mjs us` prints VALID.

## Sources

1. U.S. Department of Education, **College Scorecard** (collegescorecard.ed.gov), "Download the Data" page, data last updated June 10, 2026. Source of 65,163 rows.
   - Field of study: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Field-of-Study_06102026.zip (17 MB; CSV 153 MB)
   - Institution level: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Institution_06102026.zip (23 MB; CSV 100 MB)
   - Page that lists them: https://collegescorecard.ed.gov/data/
   - Downloaded: 2026-10-08.
2. National Center for Education Statistics (NCES), **IPEDS** (nces.ed.gov/ipeds), survey year 2024. Used as a check on every institution and as the source of 39 rows.
   - Completions 2023-24, `C2024_A` (awards by 6-digit CIP and award level): https://nces.ed.gov/ipeds/datacenter/data/C2024_A.zip
   - Institutional characteristics, `HD2024` (name, city, state, web address): https://nces.ed.gov/ipeds/datacenter/data/HD2024.zip
   - Page that lists them: https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx
   - Downloaded: 2026-10-08 (by the data audit; the same two CSV files were copied into the raw folder).

## Licence and attribution

- IPEDS / NCES. https://nces.ed.gov/help (opened 2026-10-08), under "Permission to Replicate Information", says: "Unless stated otherwise, all information on the
  U.S. Department of Education's IES website at http://ies.ed.gov is in the public domain and may be reproduced, published, linked to, or otherwise used without
  IES' permission. This statement does not pertain to information at websites other than http://ies.ed.gov, whether funded by or linked to from IES." and
  "The following citation should be used when referencing all IES products: U.S. Department of Education. Institute of Education Sciences."
  NCES is a centre of IES and the statement is published on nces.ed.gov, but its wording names ies.ed.gov; that it covers the IPEDS files is our reading, not a quote.
- College Scorecard. **No licence or terms-of-use statement was found** on collegescorecard.ed.gov/data or the pages reachable from it. The statement above does not
  name the Scorecard site. The Department's general copyright notice (https://www.ed.gov/notices/copyright-status-notice) answered "403 Forbidden" on two attempts
  (2026-10-08): **not verified**. It is US federal government data, which in general is not subject to US copyright, but this is not stated for the dataset itself;
  confirm before any public release.
- Attribution used: "U.S. Department of Education, College Scorecard" and "U.S. Department of Education. Institute of Education Sciences, National Center for Education Statistics, IPEDS".

## Rebuild

1. Download and unzip the four files above into one folder (for example `db/us/x_Field.../`, `db/us/x_Institution.../`, `db/us/ipeds/`).
2. `node scripts/data/us/build.mjs <that folder>` (Node 24, no packages). It finds the four CSVs inside (any sub-folder, any letter case), writes both output files and deletes a stale `us-programs.json` if present.
3. `node scripts/data/validate.mjs us`.

## What is kept

One row per institution and 4-digit CIP field (Scorecard CREDLEV = 3, "Bachelor's Degree"). The 6,273 institutions of the Scorecard file are filtered like this:

| Filter | Main campuses (MAIN = 1) | Branch / online campuses (MAIN = 0) |
| --- | --- | --- |
| not currently operating (CURROPER = 0): 30 in total | | |
| operating | 4,943 | 1,300 |
| not a 4-year institution (ICLEVEL != 1), for-profit (CONTROL = 3), outside the 50 states + DC | 2,465 + 196 + 54 removed | 986 removed |
| kept: 4-year, public or private non-profit | 2,228 | 314 |
| no bachelor row in the field-of-study file | 286 | 195 |
| no bachelor's degree record of its own in IPEDS Completions 2023-24 | 7 | 6 |
| no field with at least one graduate (branch rule, see below) | – | 4 |
| added from IPEDS (see below) | – | 9 |
| **final** | **1,935** | **118** |

Total **2,053 institutions** (764 public, 1,289 private non-profit) and **65,202 programmes**: 63,730 at main campuses, 1,433 at branch campuses from the Scorecard, 39 from IPEDS.
Main-campus rows: 63,741 bachelor rows, minus 3 (CIP "Reserved" and 2 high-school diploma rows), minus 8 rows of the 7 institutions below.

### Branch campuses (added 2026-10-08)

The Scorecard field-of-study file has rows per UNITID, so most branch campuses have their own list. Two traps were found and handled:

- **Parent list repeated.** Debt and earnings are computed per 6-digit OPEID and repeated on branches (documented in the Scorecard field-of-study documentation). For six campuses the
  field list itself is the parent's: the four University of Connecticut regional campuses carry the same 85 rows with identical counts, Oregon State University-Cascades 87 of the parent's 88,
  Southern University Law Center 30 of 31. None of the six has a bachelor's record of its own in IPEDS Completions 2023-24. Rule: a campus with no AWLEVEL 5 row in `C2024_A` is left out (457 rows).
- **Zero-graduate lists.** Some systems report the whole programme list on every branch with zero graduates (each Ohio University regional campus has 96 rows, 11 to 21 with graduates;
  the same shape is in IPEDS itself). Rule for branches only: a field is kept when IPEDSCOUNT1 or IPEDSCOUNT2 is above zero (640 rows dropped). Main-campus rows are unchanged, so they still include fields with zero or suppressed counts.
- **From IPEDS.** Nine MAIN = 0 institutions have a bachelor's record in IPEDS 2023-24 but no Scorecard row with graduates. Their fields are taken from `C2024_A` (AWLEVEL 5, 6-digit CIP cut to 4 digits,
  both majors summed, at least one graduate, CIP 99 totals excluded; the field title is the Scorecard's title for that CIP code) and their name, city and website from `HD2024`
  (4-year, degree-granting, active, public or non-profit, 50 states + DC). `source` = "IPEDS Completions 2023-24 (C2024_A, HD2024)". They are Northeastern University Oakland (17), Minerva University (5),
  Sattler College (5), University of Akron Wayne College (4), University of the People (3), Herzing University-Tampa (2), San Francisco Bay University (1),
  The Southwestern Baptist Theological Seminary (1), EDvance College (1). Six of them are not branches of anything: the Scorecard marks them MAIN = 0 because they have no OPEID.

Result, for example: Penn State 20 campuses with 8 to 35 fields each plus World Campus 46 (University Park 141); Rutgers-Newark 35 and -Camden 31 (New Brunswick 103);
University of Washington-Tacoma 29 and -Bothell 32 (Seattle 139). Concordia University Ann Arbor (35) and Simon's Rock at Bard College (28) are in the Scorecard as operating branches and are included.

### Removed: no bachelor's degrees (7)

Hebrew College, Interdenominational Theological Center, Kenrick Glennon Seminary, Mayo Clinic College of Medicine and Science, New York College of Traditional Chinese Medicine,
Touro University California, University of Saint Mary of the Lake. Each had one or two Scorecard bachelor rows with no graduate count ("NA"; Hebrew College 1 in the older year)
and has no bachelor's row at all in IPEDS Completions 2023-24.

### Not in the source (left out)

Eastern Nazarene College, Limestone University, Northland College, Fontbonne University and St. Andrews University are not in the Scorecard institution file of June 2026 at all.
They are still listed as active in IPEDS HD2024 with 2023-24 graduates. The Scorecard does not say why they are missing (closure is the likely reason, **not verified** in a source file), so no rows were made for them.

## Mapping

- Programme `name` = CIP field title, trailing period dropped. `domain` = the 2-digit CIP family title (CIP 2020 titles typed into build.mjs).
- `domainId`: table in build.mjs (4-digit CIP first, then 2-digit family). 9,937 programmes (15.2%) have `null` where no clear fit exists (general studies, area studies, interdisciplinary, health administration, etc.).
- USA: medicine, dentistry, pharmacy, veterinary medicine and law are graduate degrees. No bachelor field is mapped to `medicina`, `medicina-dentara`, `farmacie` or `medicina-veterinara` (0 programmes; pre-medicine, pharmaceutical sciences, dental support and veterinary technology stay `null`). CIP 22 (legal) is mapped to `drept` as requested (mostly non-professional legal studies).
- Ten institutions reuse existing sheet ids (`harvard`, `yale`, `princeton`, `columbia`, `upenn`, `brown`, `dartmouth`, `cornell`, `mit`, `stanford`, `hasSheet: true`); all ten were found. Other ids are `us-` + name slug (+ UNITID on collisions). Main campuses get their ids first, so adding branches changed no existing id or key.
- `city` = "City, ST" of the institution or campus (the Scorecard does not give a place per programme; online campuses carry the address the source gives). `website` from INSTURL (WEBADDR for the nine IPEDS ones) with `https://` added. `language` "engleză", `years` 4 (no credits, capacity, form or URL are invented).

## Which year the data describes

- **Documented.** The Scorecard field-of-study documentation says the file lists, per institution and field, "the number of recognized postsecondary credentials conferred by field of study for two
  consecutive award years (IPEDSCOUNT1 and IPEDSCOUNT2) as reported by institutions to IPEDS". The same document (version of September 2025, the newest we found) names award years 2018-19 and 2019-20 for the
  pooled **debt and earnings cohorts**. Those years describe debt and earnings, which this catalogue does not use; they are not the age of the field list. An earlier version of this README said "data up to 2019–2020": that was wrong.
- **Not documented.** Neither the file nor that document names the two award years behind IPEDSCOUNT1 and IPEDSCOUNT2 in the June 2026 release.
- **Inferred from our comparison with IPEDS Completions 2023-24.** The list of fields is recent: the audit matched it to IPEDS 2023-24 at 97.6% and found fields that exist only in CIP 2020; for branch campuses the number of
  Scorecard rows equals or nearly equals the number of IPEDS 2023-24 rows (Kent State at Ashtabula 14 and 14, Ohio University-Eastern 96 and 96). The counts themselves are not the 2023-24 ones
  (IPEDSCOUNT2 equals the 2023-24 total in only 16% of 63,023 compared rows, and campuses new in 2023-24 such as Northeastern University Oakland show zero), so the two count years are earlier than 2023-24.
  Best description: "fields with bachelor's degrees reported to IPEDS in recent award years, before 2023-24; exact years not stated by the source".

## Known limits

- A field a university started in 2023-24 or later may be missing, and a stopped one may still be listed. At main campuses, fields with zero or privacy-suppressed graduate counts are listed; at branch campuses they are not.
- Branch campuses that report together with their parent in IPEDS (University of Connecticut regional campuses, Oregon State University-Cascades and others) are not listed separately; 195 MAIN = 0 locations have no bachelor rows at all.
- Only the 4-year public and non-profit set: community colleges and for-profit colleges (some of which award bachelor's degrees) are out, as are the territories; so are the 286 4-year main campuses with no bachelor rows in the file.
- Institutions that the Scorecard does not list, or lists under another level, are missing even when IPEDS has them (the five named above; a few community colleges that IPEDS now counts as 4-year).
- Programme names are CIP categories (e.g. "Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing"), not each university's own degree titles, and no programme URLs exist.
- Share without a domain: 15.2%. The CIP table is our own choice.
