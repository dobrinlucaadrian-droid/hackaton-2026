# Catalogul de programe de licență — starea pe țări

Actualizat pe 2026-10-08, după verificarea de completitudine (fiecare țară a fost comparată cu liste oficiale independente și cu site-urile
câtorva universități) și după reparațiile făcute în urma ei. Regula folosită: doar date oficiale sau publicate cu licență deschisă,
construite cu un script care poate fi rulat din nou; niciun program inventat sau completat din memorie.

## Ce este în baza de date (dezvoltare)

| Țară | Instituții | Programe | Sursa | Licență | Cât de complet |
| --- | ---: | ---: | --- | --- | --- |
| România | 84 | 2.673 | Hotărârea Guvernului 606/2026 | act normativ publicat | complet: toate cele 84 de instituții se potrivesc cu lista ministerului; 3 programe nu au admitere în 2026–2027 (apar cu 0 locuri) |
| SUA | 2.053 | 65.202 | College Scorecard (plus IPEDS pentru 9 instituții) | fără licență scrisă pentru Scorecard; IES/NCES: domeniu public | universitățile de 4 ani de stat și private non-profit, cu campusurile secundare; 97,6% din domeniile raportate oficial în 2023–24 la instituțiile regăsite; numele sunt categorii de domenii, nu titlul exact |
| Polonia | 325 | 8.641 | registrul RAD-on / POL-on | CC0 | complet pentru instituțiile active; fără versiunile vechi ale programelor |
| Franța | 934 | 7.104 | Parcoursup 2026 + diplomele instituțiilor publice 2024-25 (MESR) | Licence Ouverte 2.0 | toate cele 65 de universități; cu licențele profesionale; fără BTS, clase pregătitoare, școli de asistente, artă, arhitectură și școlile cu admitere proprie |
| Spania | 91 | 4.302 | SIIU 2025-26 + registrul RUCT (ministerul spaniol) | aviz legal: reutilizare cu citarea sursei; fără licență deschisă numită | toate universitățile; la cele de stat oferta reală cu locuri; la cele private și UNED programele din registru (pot să nu fie deschise anul acesta) |
| Germania | 311 | 4.062 | DEQAR (registrul european de acreditări) | PDDL | **parțial, circa 35%**: oficial sunt aproximativ 11.700 de programe la 422 de instituții; lipsesc 42 de universități mari (RWTH Aachen, Heidelberg, KIT, TU Berlin…), Medicina și Dreptul |
| Italia | 92 | 3.181 | MUR – USTAT | IODL 2.0 | complet pentru oferta 2025/26 (cea mai nouă publicată); fără academiile de arte și muzică (AFAM) |
| Irlanda | 45 | 2.400 | Europass (date QQI) | CC BY 4.0 (Comisia Europeană) | toate instituțiile publice; lipsește St Patrick's Pontifical University (nu e în sursă) |
| Olanda | 95 | 1.568 | DUO – RIO open data | CC BY | complet: un rând pe program acreditat și oraș; la instituțiile finanțate de stat numărul se potrivește cu cel oficial |
| Belgia | 24 | 533 | Europass (date AHOVOKS) | CC BY 4.0 (Comisia Europeană) | **parțial**: Flandra circa 97% (14 programe lipsesc din sursă); partea franceză lipsește cu totul (40 de instituții) |
| Austria | 63 | 520 | Europass (date OeAD) | CC BY 4.0 (Comisia Europeană) | **parțial, slab**: 63 din 77 de instituții; la Universitatea din Viena 19 din 58 de programe |
| **Total** | **4.117** | **100.186** | | | 11 țări |

Fiecare țară are în `scripts/data/<cod>/` scriptul care a construit datele și un `README.md` cu adresele exacte, licența, filtrele și limitele.

## Ce a schimbat verificarea de completitudine

| Țară | Înainte | După | Ce s-a făcut |
| --- | ---: | ---: | --- |
| Spania | 481 | 4.302 | de la o singură regiune la toată țara (91 de universități) |
| Franța | 5.556 | 7.104 | oferta 2026, licențele profesionale, specializările ascunse în „portail” |
| SUA | 63.738 | 65.202 | 118 campusuri secundare adăugate; 7 instituții fără licență scoase |
| Olanda | 3.768 | 1.568 | scoase rândurile pe ani de studiu, dublurile și cele care nu erau licențe |
| Polonia | 9.083 | 8.641 | scoase 17 instituții închise și versiunile vechi ale programelor |
| Belgia | 643 | 533 | scoase diplomele „bachelor după bachelor” și dublurile |
| Italia | 3.258 | 3.181 | unite cursurile trecute de două ori (două clase de laurea) |
| Irlanda | 2.433 | 2.400 | adăugate programele integrate (Inginerie, Informatică la Trinity); scoase dublurile |
| România | 2.673 | 2.673 | verificată, neschimbată |

## Ce nu s-a putut, și de ce

| Țară | Motiv | Ce ar debloca |
| --- | --- | --- |
| Germania (restul de 65%) | Hochschulkompass (HRK) permite doar uz personal; baza Akkreditierungsrat nu permite preluarea automată | acordul scris al HRK sau al Akkreditierungsrat |
| Austria (restul) | studienwahl.at și uni:data cer acord prealabil pentru refolosire | acordul ministerului austriac (BMFWF) |
| Belgia, partea franceză | lista instituțiilor e deschisă (ARES, CC BY), dar catalogul de programe mesetudes.be permite doar uz privat | acordul ARES |
| Marea Britanie | Setul oficial „Discover Uni” (HESA) blochează descărcarea automată; termenii cer acord scris pentru refolosire comercială | un om descarcă fișierele din browser și citește licența lor |
| Danemarca | Portalul ug.dk are protecție împotriva roboților; statistica deschisă nu are numele programelor | o sursă oficială cu lista programelor, sau acordul ministerului |
| Suedia | Datele europene conțin cursuri de școli populare și profesionale, nu licențe universitare | o descărcare oficială de la UHR / antagning.se |
| Elveția | Doar statistici agregate; studyprogrammes.ch se poate doar consulta | acordul swissuniversities |
| Ungaria | felvi.hu se poate doar consulta; portalul de date deschise nu a răspuns | o nouă încercare pe data.gov.hu |

## De verificat de un om

- **Licența datelor din SUA**: pagina `nces.ed.gov/help` spune că informațiile de pe site-ul IES sunt în domeniul public, dar nu numește College Scorecard; pagina de drepturi a Departamentului Educației nu s-a putut deschide automat. De deschis o dată în browser înainte de lansare.
- **Licența datelor din Spania**: avizul legal al ministerului permite reutilizarea cu citarea sursei, dar registrul RUCT nu are o licență deschisă proprie. De recitit înainte de o lansare comercială.
- **Datele Europass** (Irlanda, Belgia, Austria): licența Comisiei acoperă conținutul ei; datele de bază vin de la agenții naționale, pentru care nu am găsit o licență separată.
- **Belgia**: lista celor 41 de diplome „bachelor după bachelor” scoase a fost stabilită comparând cu registrul flamand (fără licență scrisă); din registru nu a intrat niciun rând în datele noastre.
- **Franța**: a doua sursă scrie numele fără accente; accentele au fost puse la loc după ortografia din Parcoursup (doar ortografie).
- **România**: nota ministerului vorbește de 2.632 de programe, lista are 2.673; cel mai probabil nota descrie versiunea din aprilie a listei (HG 191/2026). Neverificat rând cu rând.
- **Legătura cu cele 40 de domenii** este a noastră. E solidă unde sursa are coduri de domeniu și aproximativă unde a fost dedusă din numele programului. Programele fără o legătură sigură rămân fără domeniu: apar în căutare, nu în recomandări.
- **Programele noi din 2026/27 în Italia** (de exemplu trei la Politecnico di Milano) lipsesc până când ministerul publică oferta nouă.

## Cum se reface sau se extinde

1. `node scripts/data/<cod>/build.mjs <dosar cu fișierele descărcate>` (pașii exacți sunt în README-ul țării).
2. `node scripts/data/validate.mjs <cod>` trebuie să scrie `VALID`.
3. Sursa și licența se trec în `scripts/data/sources.json` (fără asta țara nu e folosită).
4. `node scripts/data/index.mjs`, apoi `node scripts/data/import.mjs` (cu `--prod` pentru baza de producție).

Formatul comun este descris în `scripts/data/CONTRACT.md`.
