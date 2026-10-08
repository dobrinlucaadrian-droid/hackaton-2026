# Netherlands catalogue (cc = nl)

Builds `apps/web/data/catalog/nl-institutions.json` and `nl-programs.json` (one row per accredited bachelor programme, per institution and city, of universities "wo" and universities of applied sciences "hbo").

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

Node 24 built-ins only. "Current" means "not ended on the build day"; set `BUILD_DATE=YYYY-MM-DD` to reproduce an older build. `REPORT_NULL=40` prints the most frequent programme names left without a domain. `REPORT_UNMATCHED=40` prints the offer records that could not be attached to a licensed programme.

## What is kept and how rows are made

**One row = one accredited bachelor programme (ISAT/CROHO code) of one institution, per city where it is taught.**

1. **Backbone: the register of licences** (`ho_onderwijslicenties`). One licence = one recognised institution (`OIE_CODE`) x one recognised programme (`UNIEKE_ERKENDEOPLEIDINGSCODE`, whose `ERKENDEOPLEIDINGSCODE` is the ISAT/CROHO code). A licence is kept when all of these hold, all read from structured fields (no name matching):
   - the licence is current (`EINDDATUM` empty or in the future) and has started (`BEGINDATUM` not in the future);
   - its programme unit (`ho_opleidingen`, linked through `ho_relaties_opleidingseenheden_erkenningen`) has `SOORT = OPLEIDING`, `NIVEAU` `HBO-BA` or `WO-BA`, `GRAAD = BACHELOR` and is not ended — this leaves out masters, associate degrees, post-initial programmes and every "variant" unit (specialisations, years, tracks);
   - the institution is a Dutch higher-education institution (`oie.SOORT` in `UNIV`, `HBOS`, `ERK_HBOS`) — foreign partners of joint degrees are left out;
   - the latest accreditation decision (`ho_onderwijsaccreditaties`) is not phased out, withdrawn or expired (`AFBOUW_DATUM`, `INTREKKINGSDATUM`, `VERVALDATUM` not in the past);
   - the recognition is not ended and still admits new students (`ho_opleidingserkenningen.EINDDATUM`, `INSTROOM_EINDDATUM` not in the past).
2. **Offers only add detail.** The register of offers (`aangeboden_ho_opleidingen`) has one record per year, phase (propedeuse), specialisation, day/evening group and location — the cause of the 3,768 rows of the first build. It no longer creates rows. Each current offer is attached to the licensed programme of its institution with the same ISAT code (the offer's unit, or the programme that unit is a variant of). Offers of a few schools that register their own units without an ISAT link (Hogeschool Rotterdam, Hogeschool Leiden, Christelijke Hogeschool Ede, ...) are attached by the exact programme name inside the same institution (leading "B " removed). Ignored: ended offers, offers closed for intake, and offers whose name says they are not the degree itself (premaster, schakel, bootcamp, minor, educatieve module, bijvak, keuzedeel, kopopleiding). From the attached offers a programme gets:
   - `city`: one row per distinct place of the teaching locations (`onderwijslocaties.PLAATSNAAM`); with no offer, or no location, the seat of the institution;
   - `language`: the teaching languages of the offers in that city (Romanian lower case, joined with ", "); `nespecificată` when there is no offer or the offer has no language;
   - `url`: the web page of an offer in that city (an offer of the programme itself before one of a variant);
   - `faculty`: the offering unit, only for institutions that register offers under several units (the Radboud faculties).
3. **Other fields.** `name` = the official programme name of the register (`VOLLEDIGE_NAAM`), not the institution's marketing name; the English name is only in `search`. `credits` = ECTS of the programme. `form`: ONE value per row — the first of full-time, part-time, dual among the forms of the licence (`VORM`) that are offered in that city (all licensed forms when there is no offer); the other available forms are only in `search` (voltijd / deeltijd / duaal). `status` = the source's level code (`WO-BA` = university, `HBO-BA` = applied sciences), NOT an accreditation status. `domain` = DUO's own sector ("Taal en cultuur", "Techniek", ...). `years` is not filled (the source gives a length only for some offers). `key` = `nl-<institution>--<ISAT code>-<name>--<city>`. `search` also contains "wo universiteit" or "hbo hogeschool applied sciences", and "den haag"/"den bosch" for the two cities with official names starting with 's-.
4. **Institutions** = the recognised institution of the licence (OIE code), never the offering unit; this removed the second "HTF" entry (an offering unit without recognition). The two OIE codes of Viaa in Zwolle (`27VY` "Viaa", the private legal entity, and `22HH` "Stichting Hogeschool Viaa") are merged into `22HH` by an explicit table (`MERGE`). `name` drops a leading "Stichting" before "Hogeschool" and a trailing "B.V."; `officialName` is the register's name; ids are built from the official name. `kind`: `public` = state-funded (`BEKOSTIGD`), `private` = other recognised institutions, `unknown` = Politieacademie and the Defence academy. Website = web address of an offering unit or of its board, reduced to the site origin; not available for every institution. Ten institutions reuse existing sheet ids (`rug`, `uva`, `vu-amsterdam`, `tu-delft`, `tu-eindhoven`, `eur`, `maastricht`, `leiden`, `utrecht`, `twente`) with `hasSheet: true`.
   "Unknown University of Applied Sciences" is not an error: it is the official name in the register (OIE `32AZ`, a private school recognised since 2023, seat 's-Gravenhage) and is kept as it is.

## Mapping to the app's 40 domains

The data has no ISCED codes (only DUO's 10 broad sectors), so `domainId` comes from keyword rules on the programme name (Dutch and English), in `build.mjs` (`RULES`, first match wins, name checked before the English name), mapped to the ISCED-consistent app domains. Deliberate `null` for ambiguous names (liberal arts, business and languages, health management, biomedical technology, cognitive science).

## Counts (build of 2026-10-08)

- Current licences: 3,200. Not a bachelor programme (master, associate degree, ...): 1,732. Bachelor licences: 1,468, of which dropped: 11 foreign partners of joint degrees, 11 starting in the future (for example TU Delft "Health and Technology", 2027), 11 phased out/withdrawn, 57 closed for new students (for example all 16 of Saxion Next, Twente "Technology and Liberal Arts & Sciences").
- **Programmes kept: 1,378** (institution x ISAT code) = WO 448 + HBO 930. Of these, state-funded programmes at state-funded institutions: **WO 442, HBO 798** — the ministry (OCW) counts about 434 wo and 796 hbo bachelor programmes for 2025. The remaining 138 are programmes of private recognised institutions (LOI, NCOI, NTI, Capabel, Tio, ...) and of Nyenrode, the Politieacademie and the Defence academy, which the OCW figure for funded education does not include.
- **Rows: 1,568** (WO 453, HBO 1,115) in 50 cities = 1,378 programmes + 190 extra rows for programmes taught in more than one city (132 programmes; at most 10 cities: Schoevers "Executive Officemanagement"). Institutions: 95 (10 with an app sheet; 54 public, 39 private, 2 unknown).
- Offers: 3,913 bachelor-level offer records; 365 ended, 351 not a degree (bridging, modules, minors), 2,857 attached by ISAT code, 229 attached by name, 111 ignored because no kept licence matches (mostly offers of closed programmes, for example Capabel "SZ Arbeidsdeskundige" per year, or own units whose name matches no licensed programme). 1,187 programmes have at least one offer; 191 are known only from their licence.
- 240 rows have language `nespecificată`; 604 have a programme url; all have credits. Without app domain: 69 (4%).
- First build (before this clean-up): 100 institutions, 3,768 rows (one per offer record plus licence-only rows).

## Known limits

- The offer register is optional for HO institutions: programmes without an offer (191, among them most of the University of Twente) have no language and the seat as city. A programme whose offers name only some of its cities gets rows only for those cities.
- One `form` per row; a part-time or dual version of a programme is not a separate row (see point 3 above).
- City is DUO's place name (woonplaats), not always the municipality; `'s-Gravenhage` and `'s-Hertogenbosch` keep their official spelling. Private providers list study locations (for example LOI, Capabel, Schoevers), which gives several city rows per programme.
- Names are the official register names: Dutch even when taught in English ("Technische Informatica" for Computer Science and Engineering), sometimes formal ("Opleiding tot Verpleegkundige", "HBO - Rechten") and with "(joint degree)" where the register has it. Joint degrees appear once per participating Dutch institution.
- Teaching language is what the institution registered for its offers; it was not checked against the institutions' sites (some English-taught programmes are registered as Dutch).
- Only one pair of duplicated institution codes (Viaa) is merged, by an explicit table; Saxion and Saxion Next, or other funded/private pairs, are different institutions in the source and stay separate.
- Domain mapping is rule based; checked by sampling, not exhaustively. No scraped or remembered data is used.
