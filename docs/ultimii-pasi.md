# UniPath — ultimii pași înainte de lansare

Hotărât de echipă pe 2026-10-08: pașii de mai jos sunt **cam ultimii**. Se fac abia după ce
proiectul este cât se poate de bun pe partea tehnică. Până atunci nu e nevoie de nicio cheie
reală: totul se construiește și se verifică local, pe baza de date de dezvoltare.

## Ordinea de lucru

| Etapă | Ce | Stare |
| --- | --- | --- |
| 1 | Baza de date completă: universități, facultăți, programe de studii | România făcută (2.673 de programe din lista oficială); urmează universitățile lumii și alte țări |
| 2 | Calitate tehnică: viteza paginilor, verificări, curățenie în cod | după etapa 1 |
| 3 | Ultimii pași (acest document): chei reale, domeniu, administratori, lansare | la final |

Ce e deja făcut și verificat local (ramura `production`): conturi fără parolă, „Contul meu”,
formularul de păreri cu aprobare, antetele de securitate, scanările automate de pe GitHub,
pagina de confidențialitate. Detalii în `docs/production-plan.md` și `docs/LEDGER.md`.

## Ultimii pași, în ordine

Fiecare pas spune cine îl face. Claude nu creează conturi și nu vede chei: echipa le pune
direct în servicii, iar Claude verifică doar că setarea există.

### 1. Cheia Resend (emailul cu linkul de conectare) — echipa

Cheia lipită în conversație pe 2026-10-06 nu a fost folosită, dar a apărut în scris, deci
trebuie înlocuită.

1. Deschide https://resend.com/api-keys și conectează-te.
2. În dreptul cheii vechi apasă pe cele trei puncte, apoi **Delete** (sau **Remove**) și confirmă.
3. Apasă **Create API Key**. Nume: `unipath`. Permisiune: **Sending access**. Apasă **Add**.
4. Apasă pe butonul de copiere de lângă cheia nouă. Nu o lipi în conversație.
5. Cu cheia copiată, rulează în terminalul proiectului:

   ```
   cd C:\CODING\HACKATON_2026\apps\web; Get-Clipboard | npx convex env set AUTH_RESEND_KEY
   ```

   Pentru baza de producție se adaugă `--prod` la sfârșit.
6. Spune-i lui Claude „am pus cheia”. El verifică numele setării (nu și valoarea) și face proba.

### 2. Domeniu pentru email — echipa

Fără un domeniu verificat, Resend trimite emailuri doar către adresa contului Resend.

1. Cumpără un domeniu (de exemplu `unipath.ro`).
2. În Resend: **Domains** → **Add Domain** → urmează pașii (se adaugă câteva rânduri în setările domeniului).
3. După ce apare „Verified”, în Convex se pune setarea `AUTH_EMAIL_FROM`, de exemplu `UniPath <conectare@unipath.ro>`.

### 3. Administratorii — echipa hotărăște, Claude setează

Adresele de email ale celor care aprobă părerile, despărțite prin virgulă, în setarea
`ADMIN_EMAILS` din Convex. Nu este un secret. Rolul se primește la următoarea conectare.

### 4. Verificarea anti-robot (Cloudflare Turnstile) — echipa

Pe dezvoltare se folosesc cheile publice de probă, care trec mereu.

1. Cont pe https://dash.cloudflare.com → **Turnstile** → **Add widget**, cu domeniul site-ului.
2. **Site key** (publică) se pune în Vercel ca `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. **Secret key** se pune în Convex ca `TURNSTILE_SECRET_KEY`, la fel ca la pasul 1.5 (din clipboard).

### 5. „Continuă cu Google” — echipa (opțional)

Se poate lansa și fără. Cere un proiect în Google Cloud, un ecran de consimțământ și un
„OAuth client”; rezultă `AUTH_GOOGLE_ID` și `AUTH_GOOGLE_SECRET`, puse în Convex.

### 6. Confidențialitate — un adult care se pricepe la partea juridică

- verifică textul paginii `/confidentialitate` (minori, acordul părinților, vârsta de acord);
- adresa de contact pentru date (se pune în pagină);
- unde ține Convex datele și acordurile cu furnizorii (Convex, Resend, Cloudflare, Vercel).

După verificare se scoate nota „Versiune de lucru” din pagină.

### 7. Baza de date de producție — Claude, cu cheile puse de echipă

1. Claude creează baza de producție Convex și generează chei noi de semnare a sesiunilor.
2. Echipa repetă pașii 1, 3 și 4 pentru producție (cu `--prod`).
3. În producție **nu** se pune `AUTH_DEV_LOG_LINKS` (comutatorul de probă pentru linkuri).
4. Se încarcă și catalogul de instituții și programe în baza de producție (comenzile sunt în `scripts/data/README.md`, cu `--prod`).
5. `SITE_URL` devine adresa reală a site-ului.

### 8. Adresa de probă, apoi lansarea — Claude publică, echipa hotărăște

1. Publicare pe o adresă de probă Vercel, legată de baza de producție.
2. Verificare pe adresa de probă: conectare cu email real, salvare, ștergere de cont, o părere
   trimisă și aprobată, antetele de securitate pe conexiune securizată, pe un telefon real.
3. Când echipa spune, versiunea nouă înlocuiește site-ul public.

## De măsurat și de hotărât înainte de pasul 8

- viteza paginilor (acum sunt generate la fiecare vizită, din cauza conectării);
- ce se întâmplă cu cele 4 semnalări CodeQL din scripturile de lucru;
- dacă formularul de păreri primește și poze.
