# UniPath data sources research (research date: 2026-10-08)

Method: every row below was opened during this session (HTTP fetch, API call, or file download and parse). "Verified how" says exactly what was done. Numbers come from files or API responses I read, not from memory; where a number was derived by a rough script it is marked "approx." Local copies of the downloaded files are in the same folder as this report (`dbresearch/`).

---

## (a) Tables

### Section 1 - Romania

| Source | URL | Format | Licence | Fields | Size | Year | Bulk download | Verified how |
|---|---|---|---|---|---|---|---|---|
| HG 606/2026 annexes 1-4 (latest consolidated text; replaces the annexes of HG 191/2026). Monitorul Oficial nr. 679 bis, 17 Aug 2026. Contains also HG 607/2026 (master) from p. 148 | https://edu.ro/sites/default/files/fisiere%20articole/HG_606_2026.pdf | PDF, text layer (selectable), 276 pages. HG 606 annexes = pp. 3-146 | No licence found (official act of the Government; see licence risks) | Annex 1: DFI/RSI/DSU/DL codes, specialization, ECTS, ISCED-F 2013 code and detailed field. Annex 2/3: institution, faculty, domain de licenta, programme name (language and location in the name/footnote), A/AP, form (IF/IFR/ID), ECTS, max students. Annex 4: programmes in liquidation | ~2,550 programme rows in annexes 2-4 (approx. count of lines ending in credits + students) | 2026-2027 (amended Aug 2026) | Single PDF download | Downloaded, ran pdftotext, read annex 1, 2, 3, 4 pages |
| HG 191/2026 annexes 1-5 (original 2026-2027 text). MO nr. 294 bis, 14 Apr 2026 | https://www.edu.ro/sites/default/files/fisiere%20articole/HG_191_2026_Anexe_Nomenclator_2026_2027.pdf | PDF with text layer, 145 pages (pp. 3-144) | No licence found | Same columns as above | Per the ministry's own explanatory note (draft stage): 52 state institutions with 2,290 bachelor programmes; 35 private accredited institutions with 339 programmes; 3 programmes in a provisionally authorised private institution; 39 programmes entering liquidation | 2026-2027 (superseded by HG 606/2026) | Single PDF | Downloaded and parsed |
| HG 412/2025 annexes 1-5 (previous year), MO nr. 396 bis, 5 May 2025 | https://www.ub.ro/storage/1751885533HG_412_250424_anexe.pdf (university mirror; the official MO PDF) | PDF with text layer, 135 pages | No licence found | Same | Same structure, ~10,800 lines of text | 2025-2026 (amended by HG 645/2025, https://www.ub.ro/storage/1759729934HG_645_250808_anexe.pdf) | Single PDF | Downloaded and parsed |
| Explanatory note of the 2026-2027 draft (contains annexes 1-5 of the draft, 158 pages) | https://www.ces.ro/newlib/PDF/proiecte/2026/NF_HG_LICENTA_2026_2027.pdf | PDF with text layer | No licence found | Same plus the narrative list of new, changed, liquidated programmes | See above | Draft, 2026-2027 | Single PDF | Downloaded and parsed |
| legislatie.just.ro (HG 412/2025 record) | https://legislatie.just.ro/public/DetaliiDocument/301338 | HTML page for the act text | No licence found | Act text; the annex tables are in the MO PDF | n/a | 2025-2026 | No | Only appeared in search results; I did not open it in this session (see "could not verify") |
| data.gov.ro "Invatamant superior" (RMU nomenclature of universities) | https://data.gov.ro/dataset/invatamant-superior | XLSX, 9 sheets (Toate, 2010..2017) | "License Not Specified" (CKAN metadata) | University name, RMU code (U01..), county, locality, year | ~78 KB; list of universities only, no programmes | 2010-2017 (created 2018) | XLSX download | CKAN API call and downloaded the XLSX, read sheet names and header |
| data.gov.ro search for universities / study programmes | https://data.gov.ro/dataset?q=universitati | n/a | n/a | Only 2 relevant hits for "universitati"; another dataset: number of bachelor students by language 2010-2021 (statistics, not programmes) | n/a | old | n/a | Fetched search page and CKAN search API |
| RNCIS (Registrul National al Calificarilor din Invatamantul Superior), run by ANC | https://anc.edu.ro/rnc/rncis (rncis.ro returns HTTP 410 Gone) | HTML register with a search and a "Descarca selectia" (download selection) button; formats of the download not stated on the page | No licence found | Qualification title, ISCED-F 2013 domain, EQF/CNC level, credits, learning outcomes, COR/ISCO occupations, provider, expiry date | Not stated | Updated continuously; methodology in force since 1 Jan 2023 | No documented bulk download; per-selection export only | Page opened through fetch (summary only); could not see the actual search UI, so the export format is unconfirmed |
| ARACIS | https://www.aracis.ro | HTML | n/a | No downloadable list of accredited programmes found on the home page; reports sit behind internal portals (rne.aracis.ro, cloud.aracis.ro) | n/a | n/a | No | Home page opened through fetch |
| Study in Romania portal | https://studyinromania.gov.ro | HTML search over programmes (filters: level, language, domain, city) | No terms found | Programme listing with filters, loaded dynamically | Not stated | Current | No export or API seen | Home page opened through fetch |

### Section 2 - Global registries of institutions

| Source | URL | Format | Licence | Fields | Size | Year | Bulk download | Verified how |
|---|---|---|---|---|---|---|---|---|
| ROR (Research Organization Registry) | https://api.ror.org/v2/organizations ; dump: https://zenodo.org/records/ (concept DOI 10.5281/zenodo.6347574), file `v2.14-2026-10-06-ror-data.zip` | JSON/CSV in a ZIP (38.5 MB), REST API v2 | CC0 (Zenodo metadata: "cc-zero") | Name(s) with language, type, country, city, geonames id, lat/lng, website, Wikipedia, external ids (Wikidata, ISNI, GRID), established year, status, parent/child relationships | 141,387 records, of which 30,174 type "education"; 109 education records in Romania | v2.14, 6 Oct 2026 | Yes (Zenodo ZIP) | Called the API and the Zenodo API |
| Wikidata | https://query.wikidata.org/sparql | SPARQL, JSON/CSV; full dumps at dumps.wikimedia.org | CC0 (Wikidata's stated licence; I did not open the licence page in this session) | Label in many languages, country, coordinates, website, founding date, many identifiers | 25,434 items that are instances (or subclass instances) of university (Q3918); 111 in Romania | Live | Yes (dumps) | Ran two SPARQL COUNT queries |
| OpenAlex institutions | https://api.openalex.org/institutions | JSON API; full snapshot on AWS S3 | CC0 (OpenAlex stated; not re-checked on a licence page) | Name, ROR, country, type, works counts, homepage, geo, lineage | 30,138 with type "education"; 109 in Romania | Live | Yes (S3 snapshot) | API calls |
| Hipolabs university-domains-list | https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json | JSON | MIT (stated on the GitHub repo page; the raw LICENSE URL at the path I tried returned 404, so check the exact file) | name, alpha_two_code, country, state-province, domains[], web_pages[] | 10,268 entries, 201 countries, 63 for Romania | Current master | Yes | Downloaded and counted |
| WHED (IAU World Higher Education Database) | https://whed.net | HTML search only | Proprietary: "the copying of all or substantial parts of the Portal is not allowed without prior consent of IAU" (search-result snippet of the IAU terms); advanced features need login | Institution, divisions, degrees, funding type | ~21,500 institutions (about page) | Current | No bulk download; scraping is not allowed | About page opened; terms seen only via search snippet |
| ETER (European Tertiary Education Register) | https://eter-project.com/data/data-for-download-and-visualisations/database/ (download tool); access description: https://national-policies.eacea.ec.europa.eu/eheso/micro-data-access | Download tool, country/variable selection (the format is not stated on the pages I read) | Handbook sec. 9.4: public data "can be freely downloaded ... under the condition that the source is mentioned"; some values coded 'c' (confidential) | Institution level: students and graduates by ISCED level and field, staff, finance, location, founding year, type | ~3,500 institutions, 41 countries, years 2011-2023/2024 | 2011-2023/24 | Yes via the web tool | Read ETER handbook PDF and the EACEA page; I could not open the data page itself (404 on two URLs) |
| DEQAR (EQAR) | https://backend.deqar.eu/webapi/v2/swagger/ ; CSV: https://www.eqar.eu/qa-results/download-data/ | CSV (4 files, refreshed nightly) and JSON API (API needs a login obtained by email, free) | ODC PDDL (Public Domain Dedication and Licence), attribution encouraged | Institutions (from ETER/OrgReg plus agency submissions), QA reports (agency, institution, date, validity), agencies, country info. Not a programme table | Not stated on pages | Nightly | Yes | Pages opened through fetch |

### Section 3 - Programme-level data by country

| Source | URL | Format | Licence | Fields | Size | Year | Bulk download | Verified how |
|---|---|---|---|---|---|---|---|---|
| **France - Cartographie des formations Parcoursup** | https://data.enseignementsup-recherche.gouv.fr/explore/dataset/fr-esr-cartographie_formations_parcoursup/ (API: .../api/explore/v2.1/catalog/datasets/fr-esr-cartographie_formations_parcoursup) | CSV, JSON, API (Opendatasoft); CSV export returned HTTP 200 | Licence Ouverte v2.0 (Etalab) | year, institution UAI and name, programme name, type of programme (tf), field(s) (fl), apprenticeship flag, public/private (tc), region, department, commune, GPS, Parcoursup link, official ids (rnd, code_formation), Paysage ids | 157,509 records across 2020-2025 and all programme types; for 2025 alone 3,919 records of type "Licence" | 2020-2025, updated daily | Yes | API metadata, filtered query, sample rows |
| France - Ideo "Formations initiales en France" (ONISEP) | https://www.data.gouv.fr/datasets/ideo-formations-initiales-en-france/ ; file: https://api.opendata.onisep.fr/downloads/5fa591127f501/5fa591127f501.csv | CSV, JSON, XLSX, ODS, XML | ODbL (data.gouv metadata "odc-odbl", share-alike) | Programme descriptions, duration, level, domain, institution links (field list not opened) | Not counted | Modified 2026-10-06 | Yes | data.gouv API metadata; file not downloaded |
| **Netherlands - DUO "Overzicht Erkenningen ho" (RIO)** | https://onderwijsdata.duo.nl/dataset/overzicht-erkenningen-ho ; CSV: https://onderwijsdata.duo.nl/dataset/bb07cc6e-00fe-4100-9528-a0c5fd27d2fb/resource/28a4d89b-c223-4dbc-8deb-9d02a533f215/download/ho_erkenningen_rio.csv | CSV (35 MB), updated daily | Creative Commons Attribution (CKAN metadata) | institution code and name, location, programme code (CROHO/RIO), name, international name, ECTS, level (HBO-BA, WO-BA, ...), degree, NLQF, EQF, ISCED rubric, mode (full/part-time), field (onderdeel), accreditation dates, status ACTUEEL/HISTORISCH | 74,162 rows; 6,733 current (ACTUEEL). Current bachelor rows: 3,021 HBO-BA + 538 WO-BA (rows per location and mode, not unique programmes) | Live (checked 2026-10) | Yes | Downloaded, read header and counted statuses |
| Netherlands - full RIO set | https://onderwijsdata.duo.nl/dataset/rio_nfo_po_vo_vavo_mbo_ho | Many CSVs (ho_opleidingen, ho_opleidingserkenningen, ho_onderwijsaccreditaties, ...) | Creative Commons Attribution | Normalised tables | n/a | Live | Yes | CKAN API |
| **Italy - MUR Ustat open data** | https://dati-ustat.mur.gov.it/dataset/metadati ; CSV: https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/c0e63906-7190-4568-892b-0cf399f56071/download/03_offertaformativa-corsidilaurea_2010-2025.csv | CSV (semicolon, 16.9 MB) | Italian Open Data License v2.0 (IODL 2.0; CKAN metadata). Note: search snippets also said "Pubblico Dominio" on individual resources | ANNO, Ateneo, Area, GruppoDisciplinare, TipoCorso, Classe, NomeClasse, Corso, SedeCorso province and comune, ACCESSO (free/limited), DIDATTICA (in presenza/online), LINGUA | 82,100 rows 2010-2025; 2025: 2,848 Laurea (bachelor), 2,737 Laurea Magistrale, 410 single-cycle; 92 universities with bachelor programmes in 2025 | 2010-2025 | Yes | Downloaded, counted by awk |
| Italy - Universitaly | https://www.universitaly.it | HTML | not checked | | | | | Not opened (see could not verify) |
| **United States - College Scorecard "Field of Study"** | https://collegescorecard.ed.gov/data/ ; file: https://ed-public-download.scorecard.network/downloads/Most-Recent-Cohorts-Field-of-Study_06102026.zip | CSV (17 MB zip, 153 MB CSV). Also institution file and 470 MB raw archive | No licence statement found on the page (US federal data) | UNITID, OPEID, institution name, control (public/private), CIP code (4 digit) and title, credential level (3 = bachelor), completer counts, debt and earnings (many suppressed as "PS") | 227,980 lines; ~6,100 institutions; ~20,000 bachelor rows (approx., naive column count) | Updated 10 Jun 2026 | Yes | Downloaded, read header, counted |
| United States - IPEDS | https://nces.ed.gov/ipeds/ | CSV | not checked | Completions by CIP per institution | | | Yes (known) | Not opened, only CIP file checked |
| **Poland - RAD-on / POL-on API "Kierunki studiow"** | https://radon.nauka.gov.pl/opendata/polon/courses?resultNumbers=2 (open, no key needed for this call); catalogue entry: https://api.dane.gov.pl/1.4/datasets/1892 | JSON REST API with paging token | CC0 1.0 (dane.gov.pl metadata) | course name, code, level (first/second cycle), profile, status (running/liquidated), institution (uuid, name, kind), city, voivodeship, ISCED code and name, disciplines, co-leading institutions, language (philological), dates | 11,674 course records (all statuses and levels) | Live; refresh timestamp Oct 2026 | Yes (page through the API) | Called the API: got records and `maxCount` |
| United Kingdom - Discover Uni dataset (HESA) | https://www.hesa.ac.uk/data-and-analysis/discover-uni-dataset (HESA blocked automated requests: HTTP 403 / Cloudflare) | ZIP with XML and CSV files (per OfS and search description) | Open licence with attribution to HESA (name of the licence NOT confirmed) | Course-level data, NSS, Graduate Outcomes, LEO | Not found | 2026 dataset for courses running 2027-28, updated weekly | Yes per OfS | Only the OfS page was opened; HESA page was blocked |
| Ireland - HEA student and graduate data | https://data.gov.ie/dataset/hea-higher-education-student-and-graduate-data | CSV/dashboards (resource link points to hea.ie page) | CC-BY-4.0 | Aggregated statistics, not a course catalogue | n/a | modified 2024-08 | Aggregated only | CKAN API |
| Austria / Belgium / Germany / Spain / Sweden / Denmark / Switzerland / Hungary / Canada | see "Could not verify" and section (c) | | | | | | | No programme-level bulk dataset confirmed |
| **EU - Europass QDR (learning opportunities and qualifications) on the EU Data Portal** | https://data.europa.eu/data/datasets/european-learning-data | TTL, JSON-LD, SPARQL; download by country and dataset type | EU open data conditions (exact licence name not seen) | European Learning Model: location, length, EQF level, thematic area, learning outcomes | Coverage differs by country; "not available for all countries" | Current | Yes, per country | Europass news page opened; the dataset page itself not opened |
| EU - DEQAR | see Section 2 | | PDDL | institutions and reports, no programmes | | | | |

### Section 4 - Classifications

| Source | URL | Format | Licence | Fields | Size | Year | Bulk download | Verified how |
|---|---|---|---|---|---|---|---|---|
| ISCED-F 2013 machine-readable (broad / narrow / detailed with codes) as published by Italian MUR | https://dati-ustat.mur.gov.it/dataset/bed0c71e-9f86-4a0f-a266-963b6f7bbbd2/resource/8b0ed448-1172-426b-81c2-98ef6805d738/download/isced_f_2013.xlsx | XLSX (19 KB) | IODL 2.0 (dataset-level) - UNESCO's own terms for the classification not checked | Broad, Broad_cod, Narrow, Narrow_cod, Detailed, Detailed_cod | one sheet | ISCED-F 2013 | Yes | Downloaded and read header |
| ISCED-F 2013 original (UNESCO UIS PDF) | https://uis.unesco.org/... (the exact PDF URL I tried returned 404) | PDF | not checked | | | | | FAILED, see could not verify |
| CIP 2020 (US NCES) | https://nces.ed.gov/ipeds/cipcode/Files/CIPCode2020.csv | CSV, 1.1 MB, Last-Modified 16 Jul 2021 | No licence found on the file; US government publication | CIPFamily, CIPCode, Action, TextChange, CIPTitle, CIPDefinition, CrossReferences, Examples | all 2-, 4-, 6-digit codes | 2020 | Yes | Downloaded, read header |
| Romanian DFI / DL codes mapped to ISCED-F 2013 | Annex 1 of HG 606/2026 (same PDF as Section 1) | PDF table | no licence found | DFI, RSI, DSU (doctorate/master) and DL (bachelor) codes, specialisation code, ECTS, ISCED-F code and detailed field | ~1,500 lines in annex 1 | 2026-2027 | Same PDF | Read pages |
| Eurostat ISCED-F code list via SDMX API | tried https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/codelist/ESTAT/ISCED13F | n/a | n/a | n/a | n/a | n/a | n/a | FAILED: "not available for dissemination" |

---

## (b) Romania: recommended source and parsing notes

**Best single source: the annexes of the Government Decision for the academic year 2026-2027 in their latest form, HG 606/2026 (Monitorul Oficial 679 bis, 17 Aug 2026), PDF at https://edu.ro/sites/default/files/fisiere%20articole/HG_606_2026.pdf.** It is the official, newest, complete list: for every state and private accredited university, each faculty, bachelor domain, programme, accreditation status, study form, credits, maximum students. It replaces the annexes of HG 191/2026. Next year the same decision is published around April (HG 412/2025 appeared on 5 May 2025, HG 191/2026 on 14 Apr 2026), with amendments in August.

Layout of the PDF (verified):
- Pages: the file has 276 pages; HG 606 annexes are pp. 3-146 and the rest (from p. 148) is HG 607/2026 for master programmes (a second useful source for masters, not examined in detail).
- The text layer is real (not scanned) and `pdftotext -layout` works. Total of about 1,500 text lines for annex 1, ~7,700 for annex 2 (state), ~1,500 for annex 3 (private), ~500 for annex 4 (liquidation).
- Annex 1: nomenclature with ISCED-F 2013 codes (DFI, domain, DL, specialisation, ECTS, ISCED code and detailed field).
- Annex 2: state institutions (numbered list, each with a table). Annex 3: private accredited institutions. Annex 4: programmes entering liquidation (max students 0).
- Table columns for annexes 2-3: Nr. crt. | Facultatea | Domeniul de licenta | Specializarea/Programul (location and teaching language in the name or footnote) | Acreditare A / AP | Forma de invatamant IF/IFR/ID | Credite | Nr. maxim de studenti.

Parsing difficulties (real):
1. **Diacritics are lost in extraction.** In the extracted text there are zero occurrences of a, s, t with diacritics (ă ș ț): "Matematica" (Matematică) comes out as "Matematic", "stiinte" as "tiin...". The letters â and î come out as odd characters. The PDF uses a font mapping that pdftotext cannot decode. Names must be repaired afterwards (for example by matching against the known list of domains and universities, or by OCR of the pages).
2. **Merged cells.** Faculty and domain are vertically merged cells, wrapped over several lines, and the text order does not follow rows; the form "IF" is repeated on lines that do not belong to the same row (see the sample below). A line-based parser will mis-assign faculties and domains; a layout-aware extractor (pdfplumber with word coordinates, or a table detector) is needed, or a coordinate-based column split.
3. Programme names wrap over 2-4 lines; language ("in limba engleza"), city branch ("Municipiul X") and footnotes (`*1)`, `*2)`, `%)`) are inside the name.
4. Institution headings are lines like "1. UNIVERSITATEA NATIONALA DE STIINTA SI TEHNOLOGIE POLITEHNICA BUCURESTI" (with the diacritic problem).
Estimated difficulty: medium-high. Realistic path: coordinate-based extraction with pdfplumber or similar, then a manual check of a sample; about 2,500 rows.

Sample rows copied from the extracted text of HG 606/2026 (raw, diacritics missing as in the output):
```
Nr. Facultatea   Domeniul de   Specializarea/ Programul de studii  Acreditare (A)/  Forma  Numar de  Numar
crt.             licenta       universitare de licenta ...         Autorizare (AP)  de inv. credite   maxim de studenti
...
                                Electronic de putere i acionri     A   IF   240   120
                                electrice
                                Instrumentaie i achiziii de date   A   IF   240    75
                                Inginerie electric i calculatoare  AP  IF   240    60
                                (in limba englez)
                                Calculatoare                       A   IF   240   500
                                Tehnologia informaiei              A   IF   240   100
```
(That is the first state university in the list, Politehnica Bucuresti, faculty cells omitted by the extractor: this shows the mis-alignment.) A few lines from another page of annex 2:
```
Muzic (domain: Muzic)  ...   A   IF   240   150
Medicin*1)                   A   IF   360   150
Limba i literatura chinez - Limba i literatura rom�n/ ...   A   ID   180   100
Contabilitate i informatic de gestiune                       A   IFR  180    60
```
and from annex 3 (private, Universitatea Crestina "Dimitrie Cantemir"): `Drept A IF 240 250`, `Drept AP ID 240 100`, `Administratie publica A IF 180 100`.
The form column does contain IF, IFR and ID (verified with grep: IFR rows exist, ID rows exist). Credits seen: 180, 240, 300, 360. Domain classification: the domain-of-licence names plus DFI/DL codes (annex 1, mapped to ISCED-F 2013 with detailed field).

Other Romanian sources, ranked:
- HG PDFs above: only complete source of programme/faculty/capacity.
- RNCIS (anc.edu.ro/rnc/rncis): likely the cleanest structured register (qualification, ISCED-F, EQF level, credits), searchable with export of a selection, but it lists qualifications, not faculty or capacity, and I could not confirm the export format.
- data.gov.ro: only an old list of universities (2010-2017), no programmes.
- ARACIS and studyinromania.gov.ro: web search UIs only.
- Not examined: HG 607/2026 (master) and the master/other decisions of the same year (HG 192/2026).

---

## (c) Realistic coverage

Programme-level, open licence, bulk download, verified in this session:
- **France** (Parcoursup map data, Licence Ouverte 2.0; 3,919 licence records in 2025; ONISEP Ideo under ODbL for descriptions).
- **Netherlands** (DUO RIO, CC BY; ~3,560 current bachelor rows).
- **Italy** (MUR Ustat, IODL 2.0; 2,848 bachelor courses in 2025 across 92 universities, with language and access type).
- **United States** (College Scorecard field-of-study, US government data; ~6,100 institutions with CIP fields).
- **Poland** (RAD-on / POL-on API, CC0; 11,674 course records).
- **Romania** (official PDF only, no machine-readable version; the work is parsing).

Likely but not confirmed programme-level: **United Kingdom** (Discover Uni dataset exists and is described as an open dataset with attribution; HESA blocked me, so licence name and current file are unconfirmed), **EU Europass QDR** (partial, country coverage uneven).

Institution-level only (verified): worldwide registries (ROR, Wikidata, OpenAlex, Hipolabs) and ETER (aggregated institutions for 41 countries); DEQAR (institution and QA reports, not programmes); Ireland (HEA statistics aggregated, no course catalogue found in open data).

Nothing usable found or not verified: Germany (Hochschulkompass is a portal; I found no open data or terms of reuse), Spain (RUCT is a register on the ministry's electronic office; no bulk open dataset found), Austria (uni:data statistics and data.gv.at; nothing confirmed at programme level), Belgium (Flemish higher education register mentioned only in search results), Denmark (UddannelsesGuiden has data flows but no open dataset found), Sweden (antagning.se / studera.nu; no open API found), Switzerland (opendata.swiss search returned 0 results), Hungary (felvi.hu publishes statistics, no confirmed dataset), Canada (not researched in depth).

Practical plan: Romania from the HG PDF; France, Netherlands, Italy, Poland, USA from the CSV/API sources above; everything else as institution-level only (ROR + Wikidata + Hipolabs, which the app already uses) until a country-specific source is confirmed.

---

## (d) Could not verify

- UK Discover Uni dataset: HESA site returns HTTP 403 (Cloudflare challenge) to automated requests; licence name, file list, size not confirmed. The OfS page says the 2026 dataset is live (for courses running 2027-28) and updated weekly.
- UCAS: not researched.
- legislatie.just.ro: record 301338 appeared in search results; I did not open it, so I do not know whether it holds the annexes as text or only the act.
- RNCIS: search UI and download format not seen (only a text summary of the page); rncis.ro returned HTTP 410.
- WHED terms: seen only as a search-result snippet; the actual terms page was not opened.
- ETER data page (eter-project.com/data/...) returned 404 on two URLs; I could only read the handbook and the EACEA description. Download format is not confirmed.
- Germany Hochschulkompass: redirected to a 404; no data access info.
- Spain RUCT: page failed with a certificate error ("unable to verify the first certificate").
- Austria data.gv.at and Belgium opendata.vlaanderen.be: API returned HTML pages instead of JSON; no dataset confirmed.
- Switzerland: opendata.swiss search for "studienangebot" returned 0 results.
- Hungary, Sweden, Denmark, Canada, Ireland CAO/Qualifax: only web search summaries, no dataset opened.
- UNESCO ISCED-F 2013 original PDF URL returned 404; Eurostat SDMX code list not available.
- Wikidata, OpenAlex, ROR licences: ROR's CC0 is from Zenodo metadata (verified); Wikidata and OpenAlex CC0 are their publicly stated licences, not re-read on a licence page in this session.
- ONISEP Ideo formations: field list and size not inspected (file not downloaded).
- Hipolabs licence file: GitHub page says MIT; my request for the raw LICENSE file got 404.

---

## (e) Licence risks

- **Romania HG/Monitorul Oficial PDFs:** no licence is printed. Official normative acts are generally not protected by copyright in Romania (Law 8/1996, art. 9 - from general knowledge, NOT verified in this session), but the PDF files are hosted on edu.ro and university sites; keep a source citation and the Monitorul Oficial reference. Confirm with a lawyer before publishing a derived database commercially.
- **France ONISEP:** ODbL is share-alike for databases; mixing it into a UniPath database and publishing that database may require releasing the derived database under ODbL. Parcoursup map data is Licence Ouverte 2.0 (attribution only), safer.
- **Netherlands DUO:** CC BY, attribution needed.
- **Italy MUR:** IODL 2.0, attribution ("MIUR, Statistics and Studies Office"); sharing of derived data under compatible terms is encouraged (check the full text).
- **Poland:** CC0 per dane.gov.pl metadata for the dataset; check the radon.nauka.gov.pl terms separately.
- **US Scorecard / CIP:** no licence statement found; US federal government works are generally public domain, but some Scorecard values come from third parties, so check the documentation page.
- **UK Discover Uni:** open licence with attribution to HESA per OfS description; exact licence name not confirmed.
- **WHED:** proprietary, copying all or a substantial part not allowed; do not scrape.
- **ETER:** free use with source credit; the "restricted" tier needs an NDA; some values are suppressed.
- **ROR, Wikidata, OpenAlex:** CC0, no obligation. **DEQAR:** PDDL (public domain). **Hipolabs:** MIT (keep the copyright notice).
- **Scraping portals** (Studyinromania, Hochschulkompass, Studera, Qualifax, Universitaly) without a published open licence: do not copy programme lists without written permission.
