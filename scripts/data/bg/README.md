# Bulgaria (BG) catalogue

Result: BUILT. `node scripts/data/validate.mjs bg` prints VALID (44 institutions, 2,402 programme rows, 14 cities, 7 institutions with an app sheet, 255 rows = 11% without an app domain).

## Sources

1. Programmes: Europass "Learning Opportunities and Qualifications" open data (QDR, European Learning Model), Bulgarian country dataset.
   Catalogue entry: https://data.europa.eu/data/datasets/european-learning-data (publisher: European Commission DG EMPL). DCAT catalogue: https://europa.eu/europass/qdr/open-data/dcat
   File: `https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/bgr/ttl/bgr-ttl_1.zip` (Turtle, 19 MB zip, files dated 2026-10-18).
   All 27,387 records are "released" and published by the Human Resource Development Centre (Bulgarian Europass centre); the higher-education records come from the
   national register of programmes (record homepage nacid.bg). Downloaded on 2026-10-19.
2. City of each institution: the DEQAR institutions register (EQAR, Database of External Quality Assurance Results), daily CSV export
   `https://backend.deqar.eu/static/daily-csv/deqar-institutions.csv`, column `city`, downloaded on 2026-10-19. The Europass records hold only the country
   (no address), so the institution's seat is taken from this register. Only Bulgarian DEQAR rows without a closure date are used.
   NACID's register API (rvu.nacid.bg) is NOT used: it is unpublished and has no licence.

## Licence and attribution

- Europass: data.europa.eu lists the distributions under "European Commission reuse notice" (http://data.europa.eu/eli/dec/2011/833/oj, Commission Decision 2011/833/EU).
  The Commission legal notice (https://commission.europa.eu/legal-notice_en) says EU-owned content "is licensed under the Creative Commons Attribution 4.0 International" licence,
  reuse allowed "provided appropriate credit is given and changes are indicated". Caveat: the records are third-party (Bulgarian) data republished by the Commission;
  no separate Bulgarian licence text was found.
- DEQAR: Open Data Commons Public Domain Dedication and Licence (ODC PDDL), stated on https://www.eqar.eu/qa-results/download-data-sets/.
- Attribution to use: "Europass Qualifications Dataset Register (European Commission), Bulgarian data published by the Human Resource Development Centre, retrieved 2026-10-19;
  institution cities from DEQAR (EQAR), ODC PDDL; adapted by FindMyUni."

## Steps

1. `node scripts/data/bg/build.mjs <raw folder>` (downloads the Europass zip and the DEQAR CSV into the folder when missing and unpacks the zip; no packages needed).
2. The source has no EQF level. The degree is written in the title of the linked `LearningAchievementSpecification`:
   "Придобиване на образователна квалификационна степен - Бакалавър" (bachelor), "- Професионален бакалавър" (professional bachelor) and
   "- Магистър след средно" (master entered after secondary school: the long integrated first degrees such as medicine, dental medicine, pharmacy, veterinary medicine,
   law, architecture, some arts). Everything else is dropped: "Магистър след висше" (master after a degree), teacher-qualification courses, school profiles and vocational qualifications.
3. Dropped as not a first degree entered from school:
   - titles that say the programme is for graduates of another degree: "(след ОКС "проф.бакалавър")", "(след проф.бакалавър)", "(след ПБ)", "(след ОКС "специалист")";
   - records whose own duration (`elm:duration`, in days) is below the legal minimum of the degree in the Bulgarian Higher Education Act (art. 42): bachelor 4 years,
     professional bachelor 3 years, master after secondary school 5 years (shortened or top-up variants, for example New Bulgarian University bachelors of 2 years).
4. Institutions are matched by hand to a DEQAR record (table `DEQAR` in `build.mjs`, checked on name, city, website). "Университет по застраховане и финанси" is matched to
   DEQAR's "Висше училище по застраховане и финанси" (VUZF). The rename is confirmed on the institution's own site (news of June 2025: the higher school "вече носи наименованието Университет по застраховане и финанси (УЗФ)", https://uzf.bg/novini/vissheto-uchilishte-stana-parviyat-spetsializiran-universitet-po-zastrahovane-i-finansi-v-balgariya), and DEQAR's website vuzf.bg now redirects to uzf.bg. Rows of an institution with no DEQAR record are dropped.
5. Language = the record's `defaultLanguage` (Romanian names: bulgară, engleză, rusă, franceză, germană, arabă, spaniolă, turcă). A record whose title names another
   teaching language than its language field (for example "(на английски език)" on a record marked Bulgarian) is dropped as unclear.
6. Rows: records with the same institution, programme name, degree, language and mode are merged (the source repeats a programme once per study form, full-time and
   part-time, without saying which is which). `form` = "distance" when the record's mode is the Europass concept "Online"; presential rows have no `form`
   (it can be full-time or part-time).
7. Fields: name = Bulgarian title as in the source; institution = provider legal name (Bulgarian); `status` = the degree in the source's words
   ("Бакалавър", "Професионален бакалавър", "Магистър след средно"); `years` = duration in days / 365.25 rounded to a half year, left out when the merged copies
   disagree; `domain` = "ISCED-F xxxx" from the specification's code and `domainId` = `iscedToDomain`; when the merged copies give different codes the domain is
   "ISCED-F (copies disagree)" and `domainId` is null. `search` uses the Bulgarian name transliterated to Latin (official 2009 system) plus the English title.
8. Existing sheets reused (`hasSheet: true`): `uni-sofia` (186 rows), `uni-plovdiv` (217), `swu-blagoevgrad` (161), `unwe-sofia` (120), `ue-varna` (66), `mu-plovdiv` (22), `uacg-sofia` (16).
   Technical University of Sofia (`tu-sofia`) and AUBG (`aubg-blagoevgrad`) have sheets but no records in the source.

## Filtered out (counts from the run)

27,387 records: 21,776 not a bachelor / professional bachelor / master-after-secondary record; 34 programmes for graduates ("(след ...)");
269 below the legal minimum duration (bachelor: 71 of 1 year, 98 of 2 years, 32 of 2.5 years, 34 of 3 years, 4 of 3.5 years, 2 others; master after secondary: 27 of 1 to 4.5 years;
professional bachelor: 1 of 1 year); 190 of institutions without a DEQAR seat ("Академия по национална и информационна сигурност" 157, "Висше училище по мениджмънт - Варна" 33);
17 with a title language that contradicts the language field; 2,699 merged copies. 2,402 rows remain (2,087 bachelor, 149 professional bachelor, 166 master after secondary school).

## Known limits

- No ECTS, faculty, capacity, programme web page or public/private flag in the source: no `credits`, `faculty`, `maxStudents`, `url`; `kind` is "unknown".
- City is the institution's seat from DEQAR, not the campus (programmes taught in branch towns are shown under the seat).
- Missing because the source has no records for them: Medical University Sofia, Medical University Varna, Technical University of Sofia, University of Ruse, AUBG and others.
- Current offering: every record is "released" with a period starting 2025-10-01 (the 2025/26 intake); the source has no separate accreditation status.
- 255 rows (11%) without an app domain: 151 where merged copies disagree on the ISCED code, 62 with code "000", the rest interdisciplinary (…88), 9999 or service codes without a mapping.
- 271 institution + name pairs appear on more than one row (Bulgarian and English versions, presential and online, or bachelor and professional bachelor of the same name).
- One row looked unusual and was checked on 2026-10-19: "Ветеринарна медицина" under Medical University - Pleven is confirmed by the university's own site (https://www.mu-pleven.bg lists a Faculty of Veterinary Medicine and the specialty Veterinary Medicine), so it is kept. No row was dropped for this check.
