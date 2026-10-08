# Catalogue contract: institutions and bachelor programmes per country

Every country is built by its own script from an **official or openly licensed** dataset and produces two files in
`apps/web/data/catalog/`: `<cc>-institutions.json` and `<cc>-programs.json` (`<cc>` = lower-case ISO 3166-1 alpha-2 code).
A programmes file above 4.5 MB must be written as gzipped JSON Lines instead: `<cc>-programs.jsonl.gz` (the project gate refuses files over 5 MB).

Check with: `node scripts/data/validate.mjs <cc>` — it must print `VALID`.

## Rules

- Only real rows from the source. Never invent, estimate or fill from memory. A field the source does not have is left out.
- Bachelor level only (first cycle: ISCED 6, plus long first degrees such as medicine). No master, doctorate or short courses.
- Names stay in the source language, with correct characters; tidy spaces; no footnote marks.
- `language`, `kind` and `form` use the fixed vocabularies below; everything else is copied from the source.
- Keep the licence terms: note the licence name and the required attribution in the country's README.

## Institution

```
{
  "id": "nl-universiteit-leiden",   // "<cc>-" + slug; OR the id of an existing university sheet (see below) when it is the same institution
  "country": "NL",
  "source": "DUO RIO 2026-10",      // short name and date/version of the dataset
  "name": "Universiteit Leiden",     // display name
  "officialName": "Universiteit Leiden",
  "city": "Leiden",                  // seat; must not be empty
  "kind": "public",                  // public | private | unknown
  "hasSheet": false,                 // true only when "id" is one of the app's existing sheet ids
  "website": "https://…",            // optional
  "programs": 57                     // number of programme rows of this institution
}
```

Existing sheets: `apps/web/data/universities-abroad.json` has 57 universities abroad (fields `id`, `name`, `city`, `country` in Romanian).
When an institution in the dataset is clearly the same as one of them, use that sheet's `id` as the institution id and set `hasSheet: true`.

## Programme

```
{
  "key": "nl-universiteit-leiden--rechtsgeleerdheid--nl-full-time",  // unique, starts with "<cc>-", lower-case letters/digits/dashes
  "country": "NL",
  "institutionId": "nl-universiteit-leiden",
  "institutionName": "Universiteit Leiden",
  "city": "Leiden",                  // where the programme is taught; the institution's seat when the source does not say
  "faculty": "…",                    // optional: faculty/department/school, only when the source has it
  "domain": "Recht",                 // the source's own field-of-study label (or its classification label)
  "domainId": "drept",               // one of the app's 40 domains (scripts/data/isced.mjs: DOMAIN_IDS), or null when unsure
  "name": "Rechtsgeleerdheid",
  "language": "olandeză",            // Romanian lower-case names: română, engleză, olandeză, italiană, franceză, spaniolă, germană, poloneză, …; several joined with ", "
  "form": "full-time",               // optional: full-time | part-time | distance | dual
  "credits": 180,                    // optional (ECTS or the national equivalent)
  "years": 3,                        // optional
  "maxStudents": 120,                // optional: only when the source gives a capacity
  "status": "…",                     // optional: accreditation status in the source's words
  "url": "https://…",                // optional: official page of the programme
  "source": "DUO RIO 2026-10",
  "search": "rechtsgeleerdheid recht universiteit leiden leiden olandeza"  // lower-case ASCII (no diacritics), only a-z 0-9 and spaces: name + domain + faculty + institution + city + language
}
```

## Mapping to the app's 40 domains

- When the source has ISCED-F 2013 codes, use `iscedToDomain(code)` from `scripts/data/isced.mjs`.
- Otherwise map from the source's own classification (for example CIP in the USA) or from keywords in the programme name, in the build script.
- When no domain clearly fits, use `null`. A wrong domain is worse than none.

## What each country folder contains

`scripts/data/<cc>/build.mjs` (reads the downloaded raw files from a scratch folder given as the first argument, writes the two files) and
`scripts/data/<cc>/README.md` (source name and URL, licence and attribution, date downloaded, exact steps, what was filtered out, known limits,
row counts). Raw downloads are not committed.
