# Building the Romanian catalogue (institutions and bachelor programmes)

Source: Government Decision (HG) 606/2026, Monitorul Oficial 679 bis / 17 Aug 2026, annexes 2 (state) and 3 (private),
academic year 2026–2027: <https://edu.ro/sites/default/files/fisiere%20articole/HG_606_2026.pdf>

Steps (run in a scratch folder that has `pdfjs-dist` installed and the PDF saved as `HG606.pdf` next to the scripts):

1. `node dump.mjs 1 150` — reads the PDF and writes `raw.json`: every text item with its position, plus the table rules of each page.
2. `node parse.mjs` — uses the rules to find each table cell and writes `rows.json`: one row per programme (institution, faculty, domain, programme, status, form, credits, places).
3. `node build.mjs` (or, from the repository, `node scripts/data/ro/build.mjs <scratch folder with rows.json and raw.json>`) — cleans the names, finds language and place, links institutions to the app's university sheets, maps each official
   domain to one of the app's 40 domains, runs the checks and writes `apps/web/data/catalog/ro-institutions.json` and `apps/web/data/catalog/ro-programs.json`.
4. Check with `node scripts/data/validate.mjs ro`, then load every country into Convex with `node scripts/data/import.mjs` (see `scripts/data/CONTRACT.md`).

Checks done by `build.mjs` and by `apps/web/lib/catalog.test.ts`: the number of programmes equals the number of A/AP status cells in the
PDF, every field is filled and valid, every faculty number maps to a single faculty name, and a few rows are compared with the printed list.

What is ours, not the document's: the mapping to the 40 domains, the city of a few faculties that belong to a centre in another city
(POLITEHNICA București at Pitești, the Technical University of Cluj-Napoca at Baia Mare), and the length in years (credits / 60).

Licence: the source is a published legal act (Monitorul Oficial); no licence is printed on it. Attribution used in the app: „Hotărârea Guvernului nr. 606/2026, Monitorul Oficial nr. 679 bis/17.08.2026”.

## Counts (2026-10-08)

84 institutions (52 state, 32 private) and 2,673 bachelor programmes: 2,327 in annex 2 (state) and 346 in annex 3 (private). The PDF has 2,681
A/AP rows in the two annexes; 8 are master level and left out (6 MBA programmes of ASE marked "**) Programe de studii universitare de masterat",
2 rows of the Institutul de Administrare a Afacerilor din București). Annex 4 of HG 606/2026 ("Specializări/Programe de studii universitare care
intră în lichidare începând cu anul universitar 2026 – 2027", pages 142–146) is not read at all.

The ministry's substantiation note NF_HG_LICENTA_2026_2027 gives 2,290 state + 339 private + 3 = 2,632. That note describes the first form of
the list (HG 191/2026, April 2026, five annexes: annex 4 = Universitatea "Tomis" with 3 programmes, annex 5 = liquidation). HG 606/2026 (August)
replaced those annexes and moved "Tomis" into annex 3, so the two totals are for different versions of the list; the 41 extra rows are not
explained by any footnote mark. HG 191/2026 was not parsed row by row, so the note's figures were not re-counted.

## Footnote marks in annexes 2 and 3

The marks are removed from the names. What each one means (text of the footnotes), and how many of the 2,681 parsed rows carry it:

- `*)` in the capacity cell — 3 rows: „Specializări/programe de studii universitare de licență pentru care nu se organizează admitere în anul
  universitar 2026 – 2027.” The rows are POLITEHNICA București: Inginerie medicală; UNATC: Teatrologie (Management cultural) and Teatrologie
  (Jurnalism teatral). The list prints capacity 0 for exactly these three. They are **kept**, with `maxStudents: 0` (the source's own value),
  which the app already shows as „fără locuri anul acesta”; `build.mjs` reports a problem if a marked row has another capacity or a row with
  capacity 0 has no mark. `status` stays „acreditat”, because the contract defines it as the accreditation status and these are accredited.
- `*)` next to a programme name — 1 row (UMF Cluj-Napoca, Medicină): „Specializare evaluată de The Independent Agency for Accreditation and
  Rating din Kazakhstan (IAAR)”. Next to an institution title (Universitatea „Danubius”): „Programele de studii universitare de licență din
  structura instituției se organizează la Galați.”
- `*1)` — 128 rows: „Specializări reglementate sectorial în cadrul Uniunii Europene.”
- `*2)` — 68 rows: „Învățământ superior dual”.
- `*3)` — 5 rows: „Program de studii universitare de licență didactică cu dublă specializare”.
- `**)` — its meaning changes with the institution: next to a faculty (93 rows) „Funcționează în cadrul Centrului Universitar din Pitești” /
  „… Centrului Universitar Nord din Baia Mare (CUNBM)” / „… Centrului Universitar al UBB din Reșița”; next to a programme (38 rows) „Se
  școlarizează și la cererea Ministerului Apărării Naționale.”, „Programe de studii universitare de masterat.” (the 6 ASE rows left out),
  „Specializări evaluate de către Agenția de Acreditare în Domeniul Sănătății și Științelor Sociale din Germania AHPGS.”, or (Universitatea de
  Arte din Târgu Mureș) „Se școlarizează alternativ în cadrul Facultății de Arte în Limba Română, respectiv în cadrul Facultății de Arte în
  Limba Maghiară.”
- `***)` and `****)` — 1 row each (UMFST Târgu Mureș): „Linia de studii română-90 și linia de studii maghiară-50.” / „… maghiară-60.”
- `ε)` — 3 rows and two institution titles (Sapientia, Partium): „Activitatea didactică la specializările instituției se desfășoară în limba
  maghiară …” (used by `build.mjs` for the language). `Ω)` — 1 row: „A funcționat și înainte de 1989.”

None of these marks means "in liquidation": programmes in liquidation are only in annex 4.
