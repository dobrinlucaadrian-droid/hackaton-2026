# Netherlands catalogue (cc = nl)

Builds `apps/web/data/catalog/nl-institutions.json` and `nl-programs.json` (bachelor programmes of universities "wo" and universities of applied sciences "hbo").

## Source

- Name: **DUO "RIO" open data** (Register Instellingen en Opleidingen), dataset "RIO nfo, po, vo, vavo, mbo en ho", published by DUO (Dienst Uitvoering Onderwijs) on onderwijsdata.duo.nl.
- Dataset page: https://onderwijsdata.duo.nl/dataset/rio_nfo_po_vo_vavo_mbo_ho
- Metadata (API): https://onderwijsdata.duo.nl/api/3/action/package_show?id=rio_nfo_po_vo_vavo_mbo_ho (licence `cc-by`, "Creative Commons Attribution", metadata last modified 2026-10-07)
- Licence: **Creative Commons Attribution (CC BY)**, http://www.opendefinition.org/licenses/cc-by
- Required attribution (suggested text): "Source: DUO (Dienst Uitvoering Onderwijs), RIO open data, licence CC BY. Processed by UniPath (selection, name tidying and domain mapping); not an official DUO product."
- Downloaded: **2026-10-08** (data labelled `DUO RIO 2026-10` in the files).

Files used (all CSV, base `https://onderwijsdata.duo.nl/dataset/c416acd1-e083-4ec6-9203-3b20f98fe143/resource/<id>/download/<name>.csv`); save each under the local name in brackets in one folder:

| Local name | Resource id | DUO name |
| --- | --- | --- |
| aangeboden_ho_opleidingen | c0e73372-076d-46ac-b5fd-9d27e9f154f6 | aangeboden_ho_opleidingen |
| ho_opleidingen | 94152b85-14ed-4107-adae-f9b3634e2c1d | ho_opleidingen |
| ho_opleidingserkenningen | f25db392-dad0-449a-b09a-ab5cb3f6063d | ho_opleidingserkenningen |
| ho_rel_oe | 4b07dbfb-6f23-450d-9df3-1b82aca2d037 | ho_relaties_opleidingseenheden |
| ho_rel_oe_erk | eab71488-fa39-458d-90be-510a62194e76 | ho_relaties_opleidingseenheden_erkenningen |
| ho_licenties | a20cef1d-173d-403c-86c0-91f22f45877b | ho_onderwijslicenties |
| ho_onderwijsaccreditaties | e89f7588-8646-45fc-96f9-7987681353c6 | ho_onderwijsaccreditaties |
| onderwijsaanbieders | 5cd58c3c-e44e-4840-a8e9-b029e7aa06e2 | onderwijsaanbieders |
| rel_aanb_inst | 6aac8002-8458-42fd-8e4b-604387b56273 | relaties_onderwijsaanbieders_onderwijsinstellingserkenningen |
| oie | f78b0e96-0876-442b-ac14-a704616ad7fa | onderwijsinstellingserkenningen |
| onderwijslocaties | a7e3f323-6e46-4dca-a834-369d9d520aa8 | onderwijslocaties |
| formeel | 6496afbc-867b-4a3d-9ec4-0ae01235966d | formele_instellingsadressen |
| contact | 3fe23e7b-6671-4667-aa0b-ec7079feada5 | contactadressen |
| rel_bestuur_aanb | 0a44fd74-5e18-4156-9d6c-d87cb01cd0be | relaties_onderwijsbesturen_onderwijsaanbieders |

The resource ids can change; if a URL fails, read the current list from the metadata URL above (`result.resources`).

## Rebuild

```
# 1. download the 14 files above into one folder (curl -L <url> -o <local name>.csv)
# 2. from the repository root:
node scripts/data/nl/build.mjs <folder>
node scripts/data/validate.mjs nl        # must print VALID
```

Node 24 built-ins only. "Current" means "not ended on the build day"; set `BUILD_DATE=YYYY-MM-DD` to reproduce an older build. `REPORT_NULL=40` prints the most frequent programme names left without a domain.

## What is kept and how rows are made

1. **Offered programmes** (`aangeboden_ho_opleidingen`, latest period of each record): level `HBO-BA` or `WO-BA` (from `ho_opleidingen.NIVEAU`), offer and programme not ended. One row per offer = programme x institution x location x form x language x offered name (this keeps separate entries such as "Avond"/"Dag", years, specialisations as variants). Exact duplicates are dropped. Name = the offered name (`EIGENNAAM`), else the official programme name. Credits (ECTS) come from the programme, or from its parent programme for a variant. `years` only when the offer states a deviating length. City = place name of the teaching location (`onderwijslocaties.PLAATSNAAM`), else the seat of the institution. `url` = the offer's own website when present.
2. **Licence-only rows**: many universities register only a few offers (for example the University of Twente has 5 offers but 21 licensed bachelors). Every current bachelor licence (`ho_onderwijslicenties`) with no matching offer at that institution gets one row per form of study (`VORM`); language is `nespecificată`, city = seat of the institution, no url. Licences whose latest accreditation decision is phased out, withdrawn or expired are skipped; institutions with no Dutch seat (foreign partners of joint degrees) are skipped.
3. **Dropped**: non-bachelor levels; bridging/bootcamp/minor entries that DUO files under bachelor level (names with premaster, schakelprogramma, bootcamp, minor); ended offers; the suffix ` (o1234)` on a few names.
4. **Institutions**: grouped by the recognised institution (OIE code), not by the offering unit (so the eight Radboud faculties are one institution; the faculty/academy name goes into `faculty` when an institution has several offering units). `kind`: `public` = state-funded (`BEKOSTIGD`), `private` = other recognised institutions, `unknown` = Politieacademie, Defensie academy, and entries without a recognised institution. Website = web address of the offering unit or of its board, reduced to the site origin; not available for every institution. Ten institutions reuse existing sheet ids (`rug`, `uva`, `vu-amsterdam`, `tu-delft`, `tu-eindhoven`, `eur`, `maastricht`, `leiden`, `utrecht`, `twente`) with `hasSheet: true`.
5. **Fields**: `status` holds the source's level code (`WO-BA` = university, `HBO-BA` = applied sciences), NOT an accreditation status. `domain` = DUO's own sector ("Taal en cultuur", "Techniek", ...; "Niet ingedeeld" when the programme has no recognition record). `language` Romanian lower case; `nespecificată` when the source has none. `search` also contains "wo universiteit" or "hbo hogeschool applied sciences", and "den haag"/"den bosch" for the two cities with official names starting with 's-.

## Mapping to the app's 40 domains

The data has no ISCED codes (only DUO's 10 broad sectors), so `domainId` comes from keyword rules on the programme name (Dutch and English), in `build.mjs` (`RULES`, first match wins, name checked before the English name), mapped to the ISCED-consistent app domains. Deliberate `null` for ambiguous names (liberal arts, business and languages, health management, biomedical technology, cognitive science).

## Counts (build of 2026-10-08)

- Institutions: 100 (10 with an app sheet); programmes: 3,768 (WO 674, HBO 3,094) in 51 cities.
- Of the programmes, 3,177 come from registered offers (3,624 current bachelor-level offer records minus bridging/bootcamp/minor entries and duplicates) and 591 from licences without an offer. 714 rows have language `nespecificată`.
- Without app domain: 121 (3.2%). 3,495 rows have credits, 686 have years, 1,456 have a programme url.

## Known limits

- The offer register is optional for HO institutions: some programmes appear only as licence rows (no language, no real location); a few offers of joint degrees (e.g. Twente "Bachelor Civil Engineering") have no link to their licence and appear both as an offer row and a licence row.
- City is DUO's place name (woonplaats), not always the municipality; `'s-Gravenhage` and `'s-Hertogenbosch` keep their official spelling.
- Names are the offered names: some carry the institution's own labels ("HBO Bachelor ... (HBO Voltijd) - jaar 2", "B Sportkunde"); per-year and per-evening entries are separate rows. Programme names are Dutch even when taught in English (the English name is only in `search`).
- Two licence OIE codes of the same school can create two institutions (for example Viaa).
- Domain mapping is rule based; checked by sampling, not exhaustively. Some names (instruments in conservatoires, teacher training specialisations) follow broad rules.
- Not checked against institutions' own sites; no scraped or remembered data is used.
