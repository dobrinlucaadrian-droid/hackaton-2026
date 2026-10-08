# Catalogul de programe de licență — starea pe țări

Actualizat pe 2026-10-08, după lucrul autonom de peste noapte. Regula folosită: doar date oficiale sau publicate cu licență deschisă,
construite cu un script care poate fi rulat din nou; niciun program inventat sau completat din memorie.

## Ce este în baza de date (dezvoltare)

| Țară | Instituții | Programe | Sursa | Licență | Cât de complet |
| --- | ---: | ---: | --- | --- | --- |
| România | 84 | 2.673 | Hotărârea Guvernului 606/2026 | act normativ publicat | complet (toate programele de licență acreditate sau autorizate, 2026–2027) |
| SUA | 1.942 | 63.738 | College Scorecard (Departamentul Educației) | nu am găsit o licență scrisă | universitățile de 4 ani de stat și private non-profit; numele sunt categorii de domenii, nu titlul exact al programului; date până în 2019–2020 |
| Polonia | 342 | 9.083 | registrul RAD-on / POL-on | CC0 | complet (ciclul întâi și studii magistrale unitare în desfășurare) |
| Franța | 831 | 5.556 | Parcoursup 2025 | Licence Ouverte 2.0 | programele care recrutează prin Parcoursup (Licence, BUT, PASS, școli de inginerie și afaceri); fără BTS și clase pregătitoare |
| Germania | 311 | 4.062 | DEQAR (registrul european de acreditări) | PDDL | **parțial**: doar programele cu raport de acreditare valabil; lipsesc Medicina și Dreptul; limba de predare nespecificată |
| Olanda | 100 | 3.768 | DUO – RIO open data | CC BY | complet (universități și școli de științe aplicate) |
| Italia | 92 | 3.258 | MUR – USTAT | IODL 2.0 | complet (lauree de 3 ani și cu ciclu unic, 2025) |
| Irlanda | 45 | 2.433 | Europass (date QQI) | CC BY 4.0 (Comisia Europeană) | registrul irlandez; „orașul” e zona administrativă |
| Belgia | 24 | 643 | Europass (date AHOVOKS) | CC BY 4.0 (Comisia Europeană) | **parțial**: doar Flandra |
| Austria | 63 | 520 | Europass (date OeAD) | CC BY 4.0 (Comisia Europeană) | **parțial**: mai puține programe decât oferta reală |
| Spania | 9 | 481 | Generalitat Valenciana | CC BY | **parțial**: doar Comunitatea Valenciană |
| **Total** | **3.843** | **96.215** | | | 11 țări |

Fiecare țară are în `scripts/data/<cod>/` scriptul care a construit datele și un `README.md` cu adresele exacte, licența, filtrele și limitele.

## Ce nu s-a putut, și de ce

| Țară | Motiv | Ce ar debloca |
| --- | --- | --- |
| Marea Britanie | Setul oficial „Discover Uni” (HESA) blochează descărcarea automată; termenii site-ului cer acord scris pentru refolosire comercială | un om descarcă fișierele din browser și citește licența lor; apoi scriptul se poate scrie în aceeași zi |
| Spania (restul țării) | Registrul național RUCT se poate doar consulta; fișierul ministerului (SIIU) acoperă doar universitățile publice și nu are orașul | combinarea fișierului SIIU cu o sursă oficială pentru orașul fiecărui centru |
| Danemarca | Portalul ug.dk are protecție împotriva roboților; statistica oficială deschisă are doar numere de studenți, fără numele programelor | o sursă oficială cu lista programelor, sau acordul ministerului |
| Suedia | Datele europene pentru Suedia conțin cursuri de școli populare și profesionale, nu licențe universitare | o descărcare oficială de la UHR / antagning.se |
| Elveția | Doar statistici agregate; catalogul studyprogrammes.ch se poate doar consulta | acordul swissuniversities |
| Ungaria | felvi.hu se poate doar consulta; portalul de date deschise nu a răspuns | o nouă încercare pe data.gov.hu |

## De verificat de un om

- **Licența datelor din SUA**: sunt date federale de pe un site `.gov`, dar pe pagina de descărcare nu scrie o licență. De confirmat înainte de lansare.
- **Datele Europass** (Irlanda, Belgia, Austria): licența Comisiei acoperă conținutul ei; datele de bază vin de la agenții naționale, pentru care nu am găsit o licență separată.
- **Legătura cu cele 40 de domenii** este a noastră. E solidă unde sursa are coduri de domeniu (Polonia, Irlanda, Austria, SUA) și aproximativă unde a fost dedusă din numele programului (Germania, Olanda, Franța, Belgia, Spania, Italia). Programele fără o legătură sigură rămân fără domeniu: apar în căutare, nu în recomandări.
- **Niciun rând nu a fost comparat cu site-ul unei universități.** Verificările făcute: numărători față de totalurile surselor și câte 3–6 rânduri pe țară comparate cu fișierul brut.

## Cum se reface sau se extinde

1. `node scripts/data/<cod>/build.mjs <dosar cu fișierele descărcate>` (pașii exacți sunt în README-ul țării).
2. `node scripts/data/validate.mjs <cod>` trebuie să scrie `VALID`.
3. Sursa și licența se trec în `scripts/data/sources.json` (fără asta țara nu e folosită).
4. `node scripts/data/index.mjs`, apoi `node scripts/data/import.mjs` (cu `--prod` pentru baza de producție).

Formatul comun este descris în `scripts/data/CONTRACT.md`.
