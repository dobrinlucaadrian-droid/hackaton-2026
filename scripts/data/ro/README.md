# Building the Romanian catalogue (institutions and bachelor programmes)

Source: Government Decision (HG) 606/2026, Monitorul Oficial 679 bis / 17 Aug 2026, annexes 2 (state) and 3 (private),
academic year 2026–2027: <https://edu.ro/sites/default/files/fisiere%20articole/HG_606_2026.pdf>

Steps (run in a scratch folder that has `pdfjs-dist` installed and the PDF saved as `HG606.pdf` next to the scripts):

1. `node dump.mjs 1 150` — reads the PDF and writes `raw.json`: every text item with its position, plus the table rules of each page.
2. `node parse.mjs` — uses the rules to find each table cell and writes `rows.json`: one row per programme (institution, faculty, domain, programme, status, form, credits, places).
3. `node build.mjs` — cleans the names, finds language and place, links institutions to the app's university sheets, maps each official
   domain to one of the app's 40 domains, runs the checks and writes `apps/web/data/catalog/ro-institutions.json` and `apps/web/data/catalog/ro-programs.json`.
4. Check with `node scripts/data/validate.mjs ro`, then load every country into Convex with `node scripts/data/import.mjs` (see `scripts/data/CONTRACT.md`).

Checks done by `build.mjs` and by `apps/web/lib/catalog.test.ts`: the number of programmes equals the number of A/AP status cells in the
PDF, every field is filled and valid, every faculty number maps to a single faculty name, and a few rows are compared with the printed list.

What is ours, not the document's: the mapping to the 40 domains, the city of a few faculties that belong to a centre in another city
(POLITEHNICA București at Pitești, the Technical University of Cluj-Napoca at Baia Mare), and the length in years (credits / 60).

Licence: the source is a published legal act (Monitorul Oficial); no licence is printed on it. Attribution used in the app: „Hotărârea Guvernului nr. 606/2026, Monitorul Oficial nr. 679 bis/17.08.2026”.
