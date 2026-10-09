# Austria (AT) catalogue

Result: BUILT. `node scripts/data/validate.mjs at` prints VALID (63 institutions, 520 programme rows, 41 cities, 15% of rows without an app domain).

## Source

- Europass "Learning Opportunities and Qualifications" open data (QDR, European Learning Model), Austrian country dataset.
  Catalogue entry: https://data.europa.eu/data/datasets/european-learning-data (publisher: European Commission DG EMPL).
  DCAT catalogue: https://europa.eu/europass/qdr/open-data/dcat
  File: `https://europa.eu/europass/qdr/open-data/dcat/download?url=http://data.europa.eu/snb/data/downloadable/country/aut/ttl/aut-ttl_1.zip` (Turtle, 17 MB zip, files dated 2026-10-04).
- The Austrian programme records inside it are provided by studienwahl.at (OeAD, the Austrian agency for education and internationalisation); the file says
  "Datenquelle des Lernangebots: studienwahl.at". Every programme row links back to its studienwahl.at page.
- Downloaded on 2026-10-08.

## Licence and attribution

- data.europa.eu lists the distributions under "European Commission reuse notice" (http://data.europa.eu/eli/dec/2011/833/oj, Commission Decision 2011/833/EU).
  The Commission legal notice (https://commission.europa.eu/legal-notice_en) says EU-owned content "is licensed under the Creative Commons Attribution 4.0 International" licence,
  reuse allowed "provided appropriate credit is given and changes are indicated"; content not owned by the EU may need separate permission.
- Attribution to use: "Europass Qualifications Dataset Register (European Commission), Austrian data from studienwahl.at / OeAD, retrieved 2026-10-08; reformatted by UniPath."
- Caveat: the underlying records are third-party (OeAD) data republished by the Commission. We did not find a separate OeAD licence text; ask OeAD if the catalogue is ever published commercially.

## Steps

1. `node scripts/data/at/build.mjs <raw folder>` (downloads the zip into the folder if it is missing, unpacks it with a built-in reader, no packages needed).
2. The script parses the Turtle graph and keeps a `LearningOpportunity` when: status is "released"; its qualification has EQF level 6; the qualification title contains "Bachelor" or "Bakk".
3. Fields: name = programme title in the programme's default language (German, English for 23 rows); institution = `providedBy` legal name; ECTS from the credit point text ("8 Semester / 240 ECTS");
   years from the ISO duration (P3Y); url = studienwahl.at page (German version); language = `defaultLanguage`.
4. domain = the ISCED-F code the source gives, written as "ISCED-F 0223" (the file has codes, not labels). domainId = `iscedToDomain` on the first 4-digit code, otherwise null.
5. Existing sheets reused: univie (Universität Wien, 29 rows), tu-wien (Technische Universität Wien, 15), wu-wien (Wirtschaftsuniversität Wien, 1), uni-graz (Universität Graz, 24), tu-graz (Technische Universität Graz, 17), uni-innsbruck (Universität Innsbruck, 31), uni-salzburg (Universität Salzburg, 28), jku-linz (Universität Linz, 16), boku-wien (Universität für Bodenkultur Wien, 6), uni-klagenfurt (Universität Klagenfurt, 12), imc-krems (IMC Krems University of Applied Sciences, 12), montanuni-leoben (Montanuniversität Leoben, 6), fh-technikum-wien (Fachhochschule Technikum Wien, 11), mci-innsbruck (MCI – Die Unternehmerische Hochschule, 11), fh-oberoesterreich (FH OÖ Studienbetriebs GmbH, 30), fh-joanneum (FH JOANNEUM GmbH, 26), modul-university-vienna (MODUL University Vienna Private University, 3).

## Filtered out (counts from the run)

790 programmes not "released" (withdrawn), 5,094 with another EQF level (apprenticeships, school courses, Meisterprüfung, master, PhD), 544 EQF 6 but not a bachelor
(Meisterprüfung, Befähigungsprüfung, certificates, other first-cycle courses without "Bachelor" in the degree title).

## Known limits

- Partial coverage: the dataset has only 520 bachelor rows (e.g. WU Wien has 1, Universität Wien 29). It is what the OeAD feed exposes to Europass, not the full Austrian offer.
- No city field: the source has only a NUTS region. The city is the study location taken from the end of the studienwahl.at link (e.g. `...-2-3-salzburg.de.html`), spelled as in the link without umlauts
  (for example "St. Poelten"); for links with several places the first one is used. The institution's city is the most frequent programme city.
- No public/private flag in the source: `kind` is "unknown". No faculty, form, capacity or accreditation text.
- Language is the programme's default language, not a list of all teaching languages.
- Domain: 15% of rows have no app domain (ISCED codes with 3 digits, interdisciplinary or unmapped fields).
- Degrees "Bachelor of Education" (teacher training) are included; each school subject combination is its own row.
