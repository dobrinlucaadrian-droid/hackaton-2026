# Belgium (BE) catalogue

Result: BUILT, Flanders only. `node scripts/data/validate.mjs be` prints VALID (24 institutions, 533 programme rows, 13 cities, 34% of rows without an app domain).

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
2. Keep a `LearningOpportunity` when its status is "released" (these are the records of academic year 2026-27; the 4,084 "Not published anymore" records are
   the years 2024-25 and 2025-26 and are dropped), its qualification has EQF level 6 and the title contains "Bachelor".
3. Drop advanced bachelors ("bachelor-na-bachelor", banaba: a 60-credit degree that needs a bachelor degree first). The source has no field for the degree type
   (same EQF/NQF level and qualification type as an initial bachelor, no credits), so they are recognised by the words "bachelor-na-bachelor"/"banaba" in the title or in
   the qualification's learning outcomes (finds 3 qualifications) and by a list of 23 qualification numbers (the source's own "OK-" identifiers, in `build.mjs`).
   The list was checked by hand against the degree type "Bachelor na bachelor" of the Flemish Higher Education Register 2026-27; that register is used only for this check, no data is taken from it.
4. Merge records with the same institution and the same programme name into one row. The source has one record per campus or variant, but the record's own location holds only
   the country, and there is no language or study form, so nothing tells the copies apart.
5. Fields: name = Dutch title; institution = `providedBy` legal name; city = town in the institution's registered address ("... 3000 Leuven België"); url and credits are not in the source.
6. domain: the source's ISCED-F code is always "000" (no field), so `domain` is the text "ISCED-F 000 (no field given)" and `domainId` comes from Dutch keywords in the programme name (rules at the top of `build.mjs`), null when unsure.
7. Existing sheet reused: `ku-leuven` for "Katholieke Universiteit Leuven" (53 rows).

## Filtered out (counts from the run)

9,839 records: 4,084 not "released", 5,112 other EQF levels, 41 advanced bachelors (23 qualifications), 69 duplicates of an institution + name pair. 533 rows remain.

## Compared with the Flemish Higher Education Register (2026-27, check only)

The register has 547 distinct institution + bachelor name pairs. All 533 of our rows are in it and none of ours is extra. 14 register bachelors are absent from the source:
- only as a withdrawn 2025-26 record, no 2026-27 record: Arteveldehogeschool "Bachelor of International Graphic and Digital Media", Hogeschool Gent "Bachelor in de chemie",
  Karel de Grote Hogeschool "Bachelor in de multimedia en creatieve technologie", Universiteit Gent common programme "economische wetenschappen/toegepaste economische wetenschappen/... handelsingenieur".
  Old records are not used as a fallback: of the 9 names that exist for 2025-26 but not for 2026-27, the other 5 are renamed or closed programmes.
- not in the source at all: Vesalius College "Bachelor of Arts in International Affairs" and "... in Global Business and Entrepreneurship"; KU Leuven "theologie en de religiewetenschappen",
  "Theology and Religious Studies" and "geowetenschappen"; Koninklijke Militaire School "ingenieurswetenschappen" and "sociale en militaire wetenschappen" (the source has only its master);
  LUCA "Joint International Bachelor of Arts in Film - Pathfinder"; P.A.R.T.S. "Bachelor in Dance" (only its master); Universiteit Antwerpen "conservatie-restauratie".
- Koninklijke Militaire School and P.A.R.T.S. therefore have no row at all here.

## Known limits

- 533 rows: one row per programme name per institution (no campus, no language variants, no study form, ECTS or duration: the source does not have them).
- Flanders only (the Dutch-language community). Wallonia and French-speaking Brussels are missing.
- The advanced-bachelor list is fixed in the script: a new advanced bachelor in a later download is caught only when its texts say "bachelor-na-bachelor"/"banaba"; recheck the list after a new download.
- City is the institution's seat/registered address, not the campus where the programme is taught (for example Vives and Thomas More run several campuses).
- Institution names are as in the register and include pre-merger names (for example "Katholieke Hogeschool Vives Zuid", "Hogeschool Gent", "Artesis Plantijn Hogeschool Antwerpen"); no public/private flag, so `kind` is "unknown".
- Institutions are listed under the register's legal names, which are sometimes older than the public brand (for example "Katholieke Hogeschool Vives Zuid/Noord" for VIVES, "UC Limburg"/"UC Leuven" for UCLL).
- Programmes taught in English are labelled Dutch (`olandeză`) because the source gives only the default language of the record.
- 34% of rows have no app domain (keyword rules are deliberately conservative).
