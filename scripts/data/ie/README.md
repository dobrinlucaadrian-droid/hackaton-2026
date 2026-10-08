# Ireland (IE) catalogue

Result: BUILT. `node scripts/data/validate.mjs ie` prints VALID (45 institutions, 2,433 programme rows, 14 city areas, 25% of rows without an app domain).

## Source

- Europass "Learning Opportunities and Qualifications" open data (QDR, European Learning Model), Irish country dataset; the records are published by Quality and Qualifications Ireland (QQI).
  Catalogue entry: https://data.europa.eu/data/datasets/european-learning-data (publisher: European Commission DG EMPL). DCAT catalogue: https://europa.eu/europass/qdr/open-data/dcat
  File: `https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/irl/ttl/irl-ttl_1.zip` (Turtle, 21 MB zip, files dated 2026-10-04).
- The programme identifiers in the file look like CAO/college course codes (for example "TU871"), so the list is the Irish course database published through QQI.
- Other Irish sources looked at: data.gov.ie search for "CAO" returned 0 datasets; the HEA student data on data.gov.ie (CC-BY-4.0) is aggregated statistics, not a course list (see docs/db-sources.md). CAO and Qualifax have no open bulk download that was found.
- Downloaded on 2026-10-08.

## Licence and attribution

- data.europa.eu lists the distributions under "European Commission reuse notice" (http://data.europa.eu/eli/dec/2011/833/oj, Commission Decision 2011/833/EU).
  The Commission legal notice (https://commission.europa.eu/legal-notice_en) says EU-owned content "is licensed under the Creative Commons Attribution 4.0 International" licence,
  reuse allowed "provided appropriate credit is given and changes are indicated"; content not owned by the EU may need separate permission.
- Attribution to use: "Europass Qualifications Dataset Register (European Commission), Irish data from QQI, retrieved 2026-10-08; reformatted by UniPath."
- Caveat: the underlying records are third-party (QQI) data republished by the Commission. No separate QQI licence text was found.

## Steps

1. `node scripts/data/ie/build.mjs <raw folder>` (downloads and unpacks the zip into the folder when missing; no packages needed).
2. Keep a `LearningOpportunity` when: status "released"; its qualification has EQF level 6 (Irish NFQ levels 7 and 8, ordinary and honours degrees); the programme or award title looks like a bachelor degree
   (contains "Bachelor", BA/BSc/BEng/BBS/BBA/BCL/LLB/BEd..., "(Hons)", "honours degree", "ordinary degree") and does not contain certificate, diploma, higher/graduate diploma, postgraduate, master, micro-credential.
3. Fields: name = programme title as in the source (some are upper case or abbreviated, e.g. "Level 7 Ord Deg Computing"); institution = provider legal name;
   domain = "ISCED-F xxxx" (the source gives codes, not labels); domainId = `iscedToDomain` on the first 4-digit code, null otherwise.
4. City: the source address of an Irish provider starts with its local-authority area ("Dublin City", "Cork City", "Limerick County", "Donegal"); that area is used as the city (Dublin areas become "Dublin").
5. Rows with the same institution, programme title and award title are merged into one.

## Filtered out (counts from the run)

10,633 not "released", 10,963 other EQF levels, 1,379 EQF 6 but not a bachelor degree (certificates, diplomas, higher diplomas, micro-credentials, others), 297 duplicates.

## Known limits

- No ECTS, duration, study form, faculty, website or public/private flag in the source: `kind` is "unknown", no `credits`/`years`/`form`.
- City is the local-authority area of the provider's registered address, not the campus (Atlantic TU shows "Donegal" although it also teaches in Galway and Sligo; TU Shannon shows "Limerick" with Athlone).
- Language is the record's default language (all "engleză"); Irish-language programmes are not distinguished.
- Includes private colleges and a few non-university providers (Garda College, Teagasc, Institute of Banking...) when they offer a degree.
- 25% of rows have no app domain (ISCED narrow codes ending in 0 such as 0410 or 0510 have no mapping in `iscedToDomain`).
- Not compared with the full CAO list; coverage depends on what QQI exposes.
