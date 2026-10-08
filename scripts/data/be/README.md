# Belgium (BE) catalogue

Result: BUILT, Flanders only. `node scripts/data/validate.mjs be` prints VALID (24 institutions, 643 programme rows, 13 cities, 33% of rows without an app domain).

## Source

- Europass "Learning Opportunities and Qualifications" open data (QDR, European Learning Model), Belgian country dataset.
  Catalogue entry: https://data.europa.eu/data/datasets/european-learning-data (publisher: European Commission DG EMPL). DCAT catalogue: https://europa.eu/europass/qdr/open-data/dcat
  File: `https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/bel/ttl/bel-ttl_1.zip` (Turtle, 14.5 MB zip, files dated 2026-10-04).
- The records come from the Flemish register published by AHOVOKS (Flemish agency for higher education, adult education and study grants; identifiers `https://www.ahovoks.be/learningopportunity`).
  All 9,839 learning opportunities in the file are Dutch-language and Flemish; nothing from the French or German-speaking communities (Wallonia, ARES, mesetudes.be were not available as open data in the Europass file).
- Downloaded on 2026-10-08.

## Licence and attribution

- data.europa.eu lists the distributions under "European Commission reuse notice" (http://data.europa.eu/eli/dec/2011/833/oj, Commission Decision 2011/833/EU).
  The Commission legal notice (https://commission.europa.eu/legal-notice_en) says EU-owned content "is licensed under the Creative Commons Attribution 4.0 International" licence,
  reuse allowed "provided appropriate credit is given and changes are indicated"; content not owned by the EU may need separate permission.
- Attribution to use: "Europass Qualifications Dataset Register (European Commission), Belgian (Flemish) data from AHOVOKS, retrieved 2026-10-08; reformatted by UniPath."
- Caveat: the underlying records are third-party (AHOVOKS) data republished by the Commission. No separate AHOVOKS licence text was found.

## Steps

1. `node scripts/data/be/build.mjs <raw folder>` (downloads and unpacks the zip into the folder when missing; no packages needed).
2. Keep a `LearningOpportunity` when its status is "released" (4,084 are "Not published anymore" and dropped), its qualification has EQF level 6 and the title contains "Bachelor"
   ("Bachelor-na-bachelor" would be excluded; none occurred).
3. Fields: name = Dutch title; institution = `providedBy` legal name; city = town in the institution's registered address ("... 3000 Leuven België"); url and credits are not in the source.
4. domain: the source's ISCED-F code is always "000" (no field), so `domain` is the text "ISCED-F 000 (no field given)" and `domainId` comes from Dutch keywords in the programme name (rules at the top of `build.mjs`), null when unsure.
5. Existing sheet reused: `ku-leuven` for "Katholieke Universiteit Leuven" (76 rows).

## Known limits

- 643 rows only: one row per programme per institution (no campus, no language variants, no study form, ECTS or duration: the source does not have them).
- City is the institution's seat/registered address, not the campus where the programme is taught (for example Vives and Thomas More run several campuses).
- Institution names are as in the register and include pre-merger names (for example "Katholieke Hogeschool Vives Zuid", "Hogeschool Gent", "Artesis Plantijn Hogeschool Antwerpen"); no public/private flag, so `kind` is "unknown".
- Some Flemish institutions (for example the 2013-2021 mergers under their current names) may be missing or listed under the older name; coverage was not compared with the official Flemish list.
- Programmes taught in English are labelled Dutch (`olandeză`) because the source gives only the default language of the record.
- 33% of rows have no app domain (keyword rules are deliberately conservative).
