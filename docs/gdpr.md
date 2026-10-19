# GDPR — lista de verificare FindMyUni

> **Nu este un sfat juridic.** Este lista de lucru a echipei. Un avocat verifică totul (pagina `/confidentialitate`, această listă și procedurile) înainte de lansare.
>
> Structura tabelelor de mai jos este preluată din
> [bellu/privacy-audit — gdpr-checklist.md](https://github.com/bellu/privacy-audit/blob/HEAD/skills/privacy-audit/references/gdpr-checklist.md)
> (licență MIT). Conținutul este scris pentru FindMyUni.

Ultima actualizare: 20 octombrie 2026 (ramura `production`).

Legendă: ✅ făcut · ⚠️ parțial / de completat · ❌ lipsește · ⚖️ pentru avocat · N/A nu se aplică

Unde e textul pentru vizitatori: `apps/web/app/confidentialitate/page.tsx` (datele operatorului se completează în constanta `OPERATOR` de la începutul fișierului).

---

## Informare și transparență (art. 12–14)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 1 | Identitatea și datele de contact ale operatorului | ❌ | Constanta `OPERATOR` e goală; pagina arată „[de completat de echipă]”. Trebuie un adult/o organizație care răspunde legal. ⚖️ |
| 2 | Responsabil cu protecția datelor (DPO) | N/A ⚖️ | Probabil nu e obligatoriu la un proiect mic; avocatul confirmă. |
| 3 | Scopurile prelucrării | ✅ | Cont, păreri, statistici, siguranță. |
| 4 | Temeiul legal pentru fiecare scop (art. 6) | ✅ ⚖️ | Cont: art. 6(1)(b); păreri: 6(1)(a); statistici și limite: 6(1)(f). |
| 5 | Interesul legitim explicat (dacă se folosește 6(1)(f)) | ⚠️ | Explicat pe scurt în pagină; lipsește testul de echilibru scris (LIA). ⚖️ |
| 6 | Destinatari / categorii de destinatari | ✅ | Convex, Resend, Cloudflare, Vercel; părerile aprobate sunt publice. |
| 7 | Transferuri în afara UE + garanții | ⚠️ | Scris după DPA-urile oficiale (vezi tabelul de mai jos). Regiunea Convex de verificat. |
| 8 | Perioade de păstrare (sau criteriile) | ⚠️ | Contul: până la ștergere. Statistici, păreri respinse, contoare de încercări: echipa trebuie să decidă. |
| 9 | Sursa datelor (dacă nu vin de la persoană) | N/A | Toate datele vin direct de la utilizator. Țara vine din antetul Vercel `x-vercel-ip-country`. |

## Drepturile persoanelor (art. 15–22)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 10 | Dreptul de acces (art. 15) | ✅ | Pagina „Datele mele” (`/cont/datele-mele`, link mic din „Contul meu” și din pagina de confidențialitate): datele pe ecran și o copie de descărcat (`api.account.exportMine`). Pentru păreri: cerere pe email. |
| 11 | Dreptul la rectificare (art. 16) | ⚠️ | Numele se schimbă din cont; emailul și numele de utilizator doar prin cerere. |
| 12 | Dreptul la ștergere (art. 17) | ⚠️ | Contul se șterge singur din `/cont`. Părerile nu au încă funcție de ștergere (doar prin panoul Convex). Contoarele de încercări nu se șterg odată cu contul. |
| 13 | Dreptul la restricționare (art. 18) | ⚠️ | Descris; se face manual, la cerere. |
| 14 | Dreptul la portabilitate (art. 20) | ✅ | Fișier JSON `findmyuni-datele-mele.json`. |
| 15 | Dreptul la opoziție (art. 21) | ⚠️ | Descris. Statisticile nu au identificator, deci practic nu se pot lega de o persoană. ⚖️ |
| 16 | Decizii automate / profilare (art. 22) | ✅ ⚖️ | Chestionarul e o recomandare fără efect juridic; spus în pagină. |
| 17 | Cum își exercită drepturile — contact | ❌ | Depinde de emailul operatorului (punctul 1). |
| 18 | Termen de răspuns | ✅ | O lună, prelungire posibilă cu două luni (art. 12(3)). |
| 19 | Plângere la autoritate | ✅ | ANSPDCP, https://www.dataprotection.ro |

## Consimțământ (art. 7, art. 8)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 20 | Consimțământ liber, specific, informat, clar | ✅ | Căsuță separată în formularul de păreri; serverul refuză fără ea. |
| 21 | Retragerea e la fel de ușoară ca acordul | ⚠️ | Retragerea se face pe email, nu dintr-un buton. ⚖️ |
| 22 | Acord separat pentru fiecare scop | ✅ | Contul nu folosește consimțământul; părerile au acordul lor. |
| 23 | Vârsta / acordul părinților (art. 8) | ⚠️ ⚖️ | Cont doar de la 16 ani (căsuța „Am cel puțin 16 ani”, verificată și pe server — făcut); păreri doar de la 18 ani. De confirmat vârsta consimțământului digital în România (vezi „Puncte deschise”). |

## Date sensibile (art. 9)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 24 | Date sensibile identificate | ✅ | Nu cerem. Atenție: textul liber al unei păreri poate conține date sensibile — se verifică la aprobare. |
| 25 | Temei din art. 9(2) | N/A | |

## Obligațiile operatorului (art. 24–34)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 26 | Protecția datelor din proiectare și implicit | ✅ | Date minime, statistici fără IP/cookie/id, reguli de acces pe server (`convex/access.ts`). |
| 27 | Registrul activităților de prelucrare (art. 30) | ⚠️ | Tabelul de mai jos; de revizuit cu avocatul. |
| 28 | Procedura pentru incidente (art. 33/34) | ❌ | Vezi „Puncte deschise”. Pagina promite: ANSPDCP în 72 de ore când e cazul, persoanele afectate când riscul e mare. |
| 29 | Contract (DPA) cu fiecare împuternicit (art. 28) | ⚠️ | Vezi tabelul DPA. |
| 30 | Măsuri de securitate descrise | ✅ | Pagina le descrie simplu (HTTPS, scrypt, coduri de 15 min, limite, Turnstile, CSP). |

## Cookie-uri și urmărire (ePrivacy + GDPR)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 31 | Categoriile de cookie-uri | ✅ | Doar strict necesare. |
| 32 | Acord înainte de cookie-uri neesențiale | N/A ⚖️ | Nu avem cookie-uri neesențiale; avocatul confirmă că nu e nevoie de banner. |
| 33 | Retragerea acordului pentru cookie-uri | N/A | |
| 34 | Cookie-uri / unelte ale terților | ⚠️ | Turnstile (Cloudflare) doar pe `/studenti/parere`; dacă pune cookie-uri — de verificat. |
| 35 | Durata cookie-urilor | ✅ | Vezi tabelul „Ce stă în browser”. |

## Transferuri internaționale (art. 44–49)

| # | Cerință | Stare | Note |
|---|---|---|---|
| 36 | Țările de transfer | ⚠️ | SUA (Convex, Resend, Vercel); Cloudflare: centre de date în toată lumea. Regiunea exactă a bazei Convex — de verificat. |
| 37 | Mecanismul de transfer | ✅ | Clauze contractuale standard (toți), plus EU-U.S. DPF (Resend, Cloudflare). |
| 38 | Garanții după Schrems II | ⚖️ | Evaluarea transferului (TIA) — pentru avocat. |

---

## Ce stă în browser

| Ce | Unde | Cât timp | Rol |
|---|---|---|---|
| `__convexAuthJWT`, `__convexAuthRefreshToken` | cookie-uri `httpOnly`, `SameSite=Lax`, `Secure` (pe https), fără dată de expirare setată | până la deconectare sau închiderea browserului; sesiunea pe server expiră după cel mult 30 de zile (valoarea implicită Convex Auth) | conectarea |
| `__convexAuthJWT_<adresa Convex>` și un `__convexAuthRefreshToken_…` cu valoarea „dummy” | `localStorage` | până la deconectare | conectarea (codul `@convex-dev/auth/nextjs`) |
| `unipath-pending-result` | `localStorage` | până se termină conectarea | rezultat de salvat în cont |
| chestionarul în lucru, semnul „deja numărat” | `sessionStorage` | până se închide fila | chestionarul și statisticile |
| Turnstile (Cloudflare) | de verificat | de verificat | anti-robot, doar pe formularul de păreri |

---

## Registrul activităților de prelucrare (art. 30)

| Scop | Date | Temei legal | Cine primește | Țară | Cât păstrăm |
|---|---|---|---|---|---|
| Contul (conectare, coduri pe email, parolă nouă) | nume de utilizator, nume complet, email, data confirmării, amprenta parolei (scrypt), sesiuni (început, expirare), coduri de 6 cifre (15 min) | contract, art. 6(1)(b) | Convex (bază de date), Resend (email + cod), Vercel (găzduire) | SUA (de verificat regiunea Convex) | până la ștergerea contului; sesiunea expiră după cel mult 30 de zile |
| Rezultatul salvat | profil de liceu, răspunsuri, unde/orașe, 3 domenii, data salvării | contract, art. 6(1)(b) | Convex, Vercel | SUA | până îl șterge utilizatorul sau își șterge contul |
| Păreri ale studenților | nume, universitate, facultate, an, text, acord, data trimiterii, cine a moderat și când | consimțământ, art. 6(1)(a) | Convex, Cloudflare (Turnstile, la trimitere), public după aprobare | SUA / global (Cloudflare) | aprobate: până la retragerea acordului; respinse/în așteptare: **de decis** |
| Statistici de vizite | zi, pagină, la prima pagină: țară (2 litere) și site-ul de proveniență (doar numele) — fără IP, cookie, id | interes legitim, art. 6(1)(f) | Convex, Vercel (citește țara din IP) | SUA | **de decis** (acum nu se șterg) |
| Statistici chestionar | zi, profil, unde/orașe, răspunsuri, 3 domenii — fără nume, cont sau id (tabelul `quizRuns` + contoare `quizStats`) | interes legitim, art. 6(1)(f) | Convex | SUA | **de decis** (acum nu se șterg) |
| Siguranță și limite | contoare de încercări pe email / nume de utilizator / pe tot site-ul (`convex/authLimits.ts`, Convex Auth `authRateLimits`), rezultatul verificării Turnstile | interes legitim, art. 6(1)(f) | Convex, Cloudflare | SUA / global | limita se golește în ≤ 1 oră; rândurile nu se șterg — **de decis** |

---

## Împuterniciți și DPA

Ce scrie în paginile oficiale (verificat pe 20 octombrie 2026). Restul este „de verificat”.

| Firmă | Rol | DPA | Unde prelucrează | Garanția de transfer declarată | Se aplică automat? |
|---|---|---|---|---|---|
| Convex | baza de date, funcțiile serverului | https://www.convex.dev/legal/dpa | DPA-ul autorizează transferul din SEE în SUA. Adresa noastră de deployment nu are regiune UE în nume — **regiunea de verificat** în panoul Convex. | Clauzele contractuale standard (decizia 2021/914), incluse prin trimitere | da, „forms part of” contractul; obligatoriu de la data contractului |
| Resend | trimite emailurile cu cod | https://resend.com/legal/dpa | „primary processing operations” în SUA | EU-U.S. DPF + clauze contractuale standard | da, la acceptarea termenilor |
| Cloudflare | Turnstile (anti-robot) | https://www.cloudflare.com/cloudflare-customer-dpa/ | centre de date în toată lumea, inclusiv în afara SEE | EU-U.S. DPF; clauze contractuale standard dacă DPF cade | **de verificat** pentru contul gratuit (DPA-ul vorbește de data la care a fost „signed or otherwise agreed”) |
| Vercel | găzduirea site-ului | https://vercel.com/legal/dpa | în principal SUA, plus țările subprocesatorilor | clauze contractuale standard 2021 (DPF nu e menționat) | da, „forms part of” contractul |

Datele colectate de Turnstile (după https://www.cloudflare.com/turnstile-privacy-policy/): adresa IP, amprenta TLS, User-Agent, cheia site-ului și originea. Pagina nu spune unde sunt prelucrate și nu spune clar dacă pune cookie-uri.

---

## Puncte deschise

### De făcut de echipă
- [ ] **Operatorul:** cine răspunde legal (un adult sau o asociație), email de contact, adresă poștală → completat în `OPERATOR` din `apps/web/app/confidentialitate/page.tsx`. Recomandat un email dedicat (de exemplu pe domeniul propriu).
- [ ] **DPA-uri:** de citit și acceptat/semnat cu Convex, Resend, Cloudflare, Vercel (linkuri în tabelul de mai sus); de păstrat o copie. La Cloudflare de confirmat că DPA-ul acoperă contul folosit.
- [ ] **Regiunea Convex:** de verificat în panoul Convex unde stă baza de producție; dacă se poate, de ales regiunea UE.
- [ ] **Perioade de păstrare:** de decis pentru statistici (`dailyStats`, `quizRuns`, `quizStats`), păreri respinse și în așteptare, contoarele de încercări (componenta rate-limiter, `authRateLimits`). Apoi o curățare automată (job programat în Convex) și pagina actualizată.
- [ ] **Ștergerea unei păreri:** funcție de administrator pentru ștergere (acum doar „respinsă” sau prin panoul Convex).
- [ ] **Ștergerea contului:** de verificat dacă trebuie șterse și contoarele de încercări legate de email/nume de utilizator.
- [ ] **Procedura pentru incidente:** cine află, cine decide, cine anunță ANSPDCP (formularul de pe dataprotection.ro) în 72 de ore, cine anunță utilizatorii (prin email), un registru intern al incidentelor (art. 33(5)) — chiar și pentru cele care nu se raportează.
- [x] **Căsuța „Am cel puțin 16 ani”** la crearea contului, verificată și pe server; pagina de confidențialitate o descrie.
- [ ] **Jurnalele furnizorilor:** cât păstrează Vercel și Convex adresele IP în jurnalele tehnice; dacă Resend păstrează conținutul emailurilor (codul).
- [ ] **Turnstile:** de verificat în browser (Unelte pentru dezvoltatori → Application) ce cookie-uri sau date pune pe `/studenti/parere`, apoi pagina actualizată.

### Pentru avocat ⚖️
- [ ] Vârsta consimțământului digital în România: GDPR art. 8 (între 13 și 16 ani, implicit 16) și Legea 190/2018 — confirmat dacă România a ales altă vârstă; noi am pus 16 ani pentru cont.
- [ ] Temeiul pentru cont: contractul (art. 6(1)(b)) e potrivit pentru utilizatori de 16–17 ani?
- [ ] Testul de echilibru pentru interesul legitim (statistici, limite) și dacă statisticile sunt date personale.
- [ ] Transferurile în SUA: sunt suficiente clauzele/DPF; e nevoie de o evaluare a transferului (TIA)?
- [ ] Nu e nevoie de banner de cookie-uri (doar cookie-uri strict necesare, art. 5(3) ePrivacy / Legea 506/2004)?
- [ ] DPO: e nevoie sau nu.
- [ ] Textul complet al paginii `/confidentialitate` și al formularului de păreri (acordul pentru publicare, 18+).
- [ ] E nevoie de termeni și condiții separați pentru cont?
