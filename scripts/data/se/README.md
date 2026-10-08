# Sweden (SE): NOT POSSIBLE NOW

No catalogue files were built for Sweden. Checked on 2026-10-08.

## Sources opened

| Source | What it offers | Result |
| --- | --- | --- |
| Europass QDR Sweden, https://europa.eu/europass/qdr/open-data/dcat (file `.../downloadable/country/swe/ttl/swe-ttl_1.zip`, 1.2 GB unpacked, 262 Turtle files) | Open Turtle data under the European Commission reuse notice (Decision 2011/833/EU; Commission legal notice: CC BY 4.0, credit and indicate changes). 253,812 learning opportunities, 4,652 qualifications. | Downloaded and parsed. The content is NOT university programmes: the learning opportunities are folk high school courses (folkhögskola, for example "Allmän kurs på distans") and vocational higher education (yrkeshögskola, qualification identifiers under https://www.myh.se/kvalifikationer). Qualifications by EQF level: 2: 2, 3: 13, 4: 250, 5: 4,284, 6: 103. The 103 EQF 6 ones are vocational "kvalificerad yrkeshögskoleexamen" titles (for example "Bergsskoleingenjör", "Hotel Management", "Agrotekniker"), not bachelor programmes of universities and högskolor (no Lund, KTH, Uppsala, Stockholm...). |
| UHR (Universitets- och högskolerådet) admission statistics, https://statistik.uhr.se and https://www.uhr.se/studier-och-antagning/antagningsstatistik/ | Interactive statistics of applicants and admitted per programme and higher education institution. | HTML application; no download, API or reuse terms found. A UHR webinar deck mentions the two statistics services but no API or licence. |
| antagning.se / studera.nu | Official application portals with programme search. | Search portals only; the start page URL tried returned 404; no open data or terms found. |
| UKÄ (Swedish Higher Education Authority) statistics, https://www.uka.se/vara-resultat/statistik/ | Statistics by institution and field. | The statistics database address tried (statistik.uka.se) redirects to a page; no programme-level bulk file found. |
| dataportal.se (national data portal) | Catalogue of public data. | Search page answered "Upgrade Required" to automated requests; the admin API returned HTML. Nothing confirmed. |
| data.europa.eu search for Swedish higher-education datasets | EU data portal. | Only unrelated Swedish statistics (SCB, Kolada). |

## Why none could be used

The only bulk open file (Europass) contains no university or högskola bachelor programmes. UHR and UKÄ publish interactive statistics without a documented open licence or bulk download. Filling the list from memory is forbidden.

## If it is needed later

Ask UHR whether antagning.se has a data export (the admission statistics at statistik.uhr.se are the natural source: programme, institution, applicants), or use the Europass yrkeshögskola data (EQF 5-6) only if vocational programmes are wanted.
Existing sheets for Sweden: lund, kth.
