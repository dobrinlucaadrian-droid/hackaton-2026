# Germany (de): institutions and first-cycle programmes

Outcome: BUILT from DEQAR open data. Programmes are accredited first-cycle programmes (what German quality-assurance agencies reported), not a full course catalogue.

## Source

- DEQAR (Database of External Quality Assurance Results), EQAR. Download page: https://www.eqar.eu/qa-results/download-data/
- Files (CSV, refreshed nightly): https://backend.deqar.eu/static/daily-csv/deqar-reports.csv and https://backend.deqar.eu/static/daily-csv/deqar-institutions.csv
- Licence: DEQAR data are "public and freely accessible for anybody free of charge", available under the Open Data Commons Public Domain Dedication and Licence (PDDL), asking users to respect the ODC Community Norms. Requested attribution: "if you use or republish DEQAR data in your work, we encourage you to give credit to EQAR and to let us know." Attribution to use: "Data: DEQAR, European Quality Assurance Register for Higher Education (eqar.eu), PDDL." Terms page: https://www.eqar.eu/qa-results/terms-and-conditions/ . The linked report PDFs belong to the agencies (CC-BY-SA-4.0 unless stated) and are NOT copied; only the link (`url`) is kept.
- Downloaded: 2026-10-08.

## Steps

1. Download the two CSV files above into a scratch folder as `deqar-reports.csv` and `deqar-institutions.csv`.
2. `node scripts/data/de/build.mjs <scratch-folder>` writes `apps/web/data/catalog/de-institutions.json` and `de-programs.json`.
3. `node scripts/data/validate.mjs de` prints VALID.

## Filters

- country = Germany; report_type programme / joint programme / institutional/programme; `programme_qf_ehea_level` = "first cycle".
- Dropped when qualification or name says Master / M.A. / M.Sc. / LL.M / MBA (some reports are mislabelled as first cycle).
- Only reports still valid on 2025-10-08 (`report_valid_to`); older accreditations are history and the programme may be gone.
- One row per institution x programme name x qualification (the report valid longest). Institutions without a city in the source are skipped.
- Programmes with `programme_qualification` "Magister Theologiae", "Dipl.-Ing." etc. are kept as the source labels them first cycle.

## Counts

311 institutions (70 marked private, the rest unknown), 4062 programmes, 152 cities. 1281 programmes (32%) have no app domain. Sheets reused: tum, lmu, hu-berlin, fu-berlin, uni-hamburg, uni-koeln, uni-freiburg, uni-goettingen, uni-tuebingen, uni-mannheim, uni-bonn (heidelberg, rwth, kit, tu-berlin, tu-dresden, uni-frankfurt, uni-stuttgart and uni-leipzig have no currently valid first-cycle report in DEQAR, so they are absent).

## Limits

- DEQAR lists programmes that were accredited, not all programmes offered. Many German universities (e.g. Heidelberg, RWTH) are missing or have expired reports; Staatsexamen programmes (Medizin, Jura, Lehramt state exams) are essentially absent. 311 institutions is well below the roughly 400 or more German higher-education institutions.
- No subject field in the source: `domain` holds the degree label (e.g. "Bachelor of Science"); `domainId` comes from German keywords in the programme name, null when unsure.
- `kind`: public/private is not in DEQAR; "private" only when the name says (Priv., staatlich anerkannt, katholisch, evangelisch, kirchlich), otherwise "unknown".
- `language` is "germană" by instruction default; the source gives only the language of the report, not the teaching language, so English-taught programmes are mislabelled. No credits, years, form or capacity in the source.
- City is the institution's seat, not the teaching location. Names are as reported (some include variant notes such as "(vormals: ...)").

## Sources checked and rejected

- HRK Hochschulkompass (https://www.hochschulkompass.de/hochschulen/downloads.html): downloads are only institution lists (hs_liste.txt, PDFs). Terms: lists are free "ausschliesslich fuer den persoenlichen Gebrauch"; other uses, especially commercial, need approval from the Stiftung zur Foerderung der Hochschulrektorenkonferenz. No programme download. Not reusable.
- Akkreditierungsrat ELIAS / antrag.akkreditierungsrat.de: public database with CSV export for logged-in users; no open-data licence or reuse terms found; page content could not be read. Not used.
- DAAD international programmes: terms page returned 404; no open licence confirmed. Not used.
- GovData (CKAN search): only Berlin Leistungsberichte PDFs (CC0), no programme list.
