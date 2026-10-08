# Denmark (DK): NOT POSSIBLE NOW

No catalogue files were built for Denmark. Checked on 2026-10-08.

## Sources opened

| Source | What it offers | Result |
| --- | --- | --- |
| UddannelsesGuiden, https://www.ug.dk (data pages `/data`, `/om-ug/open-data`) | The official programme portal. A spec from STIL (stil.dk, "graenseflade til indberetning af uddannelsesudbud til uddannelsesguiden") describes how institutions upload offers INTO ug.dk by CSV after logging in; it is not a public export. | Automated requests receive a bot-protection script page (no content). No open dataset or terms of reuse found. Not worked around. |
| Uddannelseszoom, https://www.uddannelseszoom.dk and the ministry page on ufm.dk | Ministry (Uddannelses- og Forskningsministeriet) comparison tool. | uddannelseszoom.dk did not answer (connection failed); the ufm.dk page returned 404. No bulk file found. |
| optagelse.dk (KOT admission statistics) | Search site for the admission numbers per programme. | HTML search only, no download or API; no reuse terms found. |
| opendata.dk CKAN API (https://admin.opendata.dk/api/3/action/package_search?q=uddannelse) | Municipal open data. | 3 hits, all municipal (Aarhus Kommune budget data), nothing on higher education. |
| Europass QDR (Europass Learning Opportunities and Qualifications, https://europa.eu/europass/qdr/open-data/dcat) | Per-country open data. | The catalogue lists datasets for AT, BE, BGR, CZE, DEU, EST, FIN, FRA, GRC, IRL, ISL, LTU, LVA, MLT, NLD, NOR, POL, SRB, SVN, SWE: Denmark is not in the list. |
| Statistics Denmark StatBank API, https://api.statbank.dk/v1 (tables INST16, INST17, INST18, INST19, INST20, INST25 "Universiteter / Professionshøjskoler / Erhvervsakademier ... efter institution, uddannelse, ...") | Open JSON API. Number of students on 1 October per institution and per education group (for example "H603930 Law, BACH"), with the bachelor groups H50 (professional bachelor) and H60 (bachelor). About 418 institution x education-group rows with students in 2025. Terms (https://www.dst.dk/en/Statistik/hjaelp-til-statistikbanken/api): "free of charge for commercial as well as non-commercial purposes, as long as you include a source reference. This corresponds to the licence named Creative Commons, CC 4.0 BY." | Downloaded and inspected, but NOT used (see below). |
| Statistics Denmark institution register (INSTNR, address, municipality) | Institution addresses. | Documented at dst.dk but only for research access, no public file; the page states the institution number no longer encodes the municipality. |

## Why none could be used

- The only open, bulk, reusable source with institution and programme level is StatBank. It lists statistical education groups (about 100 labels such as "Law, BACH", "Pædagog, MVU", "Sygepleje og sundhedspleje, MVU"), not the programmes students apply to
  ("Bachelor i jura" at one university has no name or language in it). It has no city, no language, no study form, no url and no accreditation fields.
  The contract requires a city and a language per row; both would have to be invented (institution seats and "daneză" from memory, although many Danish bachelors are taught in English), which the rules forbid.
- The official programme catalogue (ug.dk) is behind bot protection and has no published open licence; scraping it is not allowed by the task rules.

## If it is needed later

- Ask STIL / Styrelsen for IT og Laering whether ug.dk offers an export or API, or use the StatBank groups as a coarse "what can I study where" table: build rows from the six INST tables
  (variables `FSTATUS=B`, `HERKOMST=TOT`, `KØN=10`, `ALDER=TOT`, newest `Tid`; keep education codes H50xxxx and H60xxxx that have no children and a value above 0) and take city and website from another open register such as ROR (CC0).
  Attribution would be "Danmarks Statistik, StatBank Denmark (CC BY 4.0)".
- Existing sheets for Denmark that a future catalogue should reuse: ku, aarhus, dtu, aalborg, sdu.
