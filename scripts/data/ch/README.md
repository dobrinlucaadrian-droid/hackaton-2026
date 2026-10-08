# Switzerland (CH): NOT POSSIBLE NOW

No catalogue files were built for Switzerland. Checked on 2026-10-08.

## Sources opened

| Source | What it offers | Result |
| --- | --- | --- |
| opendata.swiss CKAN API (https://ckan.opendata.swiss/api/3/action/package_search), queries "studiengang", "studienangebot", "swissuniversities", "studyprogrammes", "bachelor", "hochschule studienfach" | Federal and cantonal open data portal. | 0 hits for "studienangebot" and "studyprogrammes". The hits are Federal Statistical Office (BFS) statistics only: "Eintritte auf Stufen Diplom und Bachelor der Fachhochschulen / universitären Hochschulen nach Jahr, Fachbereich ...", "Tertiärstufe, universitäre Hochschulen: Studierende nach Hochschule und Fachbereich", "Bildungsabschlüsse nach Hochschule und Fachbereich". Licence field of these datasets is empty in the API (`license_id: null`). |
| studyprogrammes.ch (swissuniversities) | Official programme search for Swiss universities, universities of applied sciences and teacher colleges. | Web search tool only; no open-data download, API or reuse terms found. Not crawled (the task forbids scraping search-only sites). |
| Europass QDR (https://europa.eu/europass/qdr/open-data/dcat) | Per-country open data. | Switzerland is not among the country datasets (AT, BE, BGR, CZE, DEU, EST, FIN, FRA, GRC, IRL, ISL, LTU, LVA, MLT, NLD, NOR, POL, SRB, SVN, SWE). |
| docs/db-sources.md earlier research | opendata.swiss search for "studienangebot" gave 0 results. | Confirmed above. |

## Why none could be used

The BFS tables are aggregated statistics (students and entrants per institution and broad field of study, "Fachbereich"), not lists of programmes with names, and carry no stated licence in the portal metadata. The only programme-level source (studyprogrammes.ch) is a search site without a published open licence.
Programme names, cities and languages would have to be invented or scraped.

## If it is needed later

Ask swissuniversities whether the studyprogrammes.ch data can be licensed for reuse, or use the BFS "Fachbereich" tables only as a coarse institution x field map (check the BFS terms of use first).
Existing sheets for Switzerland: eth-zurich, epfl.
