# Gata de producție: conturi sigure, copii de rezervă, atacuri, scurgeri de date

Ghid pentru echipă, în ordinea în care se face. Ce scrie „(voi)” faceți voi, din conturile voastre: Claude nu are voie să schimbe
setările de securitate ale conturilor. Ce scrie „(făcut)” e deja în cod. Unde nu am putut verifica ceva, scrie „de verificat”.

## 1. Să nu vă poată bloca nimeni (voi)

Un atacator nu „sparge” de obicei site-ul, ci contul cuiva din echipă. Pentru fiecare serviciu de mai jos:

| Serviciu | La ce folosește | Ce faceți |
| --- | --- | --- |
| Emailul cu care v-ați făcut conturile | primește linkurile de resetare pentru toate celelalte | 2FA (verificare în doi pași) cu aplicație de autentificare, nu SMS; codurile de recuperare tipărite și puse la loc sigur |
| GitHub | codul site-ului | 2FA; codurile de recuperare salvate; încă un om din echipă ca membru cu drepturi de administrator |
| Vercel | găzduirea site-ului | 2FA; încă un membru în echipa Vercel |
| Convex | baza de date | conectare prin GitHub (care are 2FA) sau 2FA proprie; încă un membru în echipa Convex |
| Resend | trimite emailurile cu cod | 2FA; cheia API doar în setările Convex. Domeniul `findmyuni.ro` e adăugat (Irlanda), cu cele 4 înregistrări DNS puse în Cloudflare pe 2026-10-20; urmărirea clicurilor e oprită |
| Romarg (domeniul findmyuni.ro, cumpărat pe 2026-10-20) | adresa site-ului | 2FA (are cod pe email la conectare); reînnoire automată pornită pe 5 ani; un al doilea om cu acces |
| Cloudflare (DNS-ul lui findmyuni.ro, din 2026-10-20) | spune unde e site-ul și emailul; protecție la atacuri | 2FA; încă un membru; nameserverele `dax.ns.cloudflare.com` și `tia.ns.cloudflare.com` sunt puse la Romarg. Transferul complet al unui `.ro` la Cloudflare nu e posibil, domeniul rămâne plătit la Romarg. Site-ul: `findmyuni.ro` și `www` sunt CNAME spre Vercel, fără proxy (2026-10-21) |
| Cloudflare (verificarea anti-robot) | căsuța „Nu sunt robot” | 2FA |

Reguli:
- **Cel puțin doi oameni** au acces la fiecare cont. Dacă unul își pierde telefonul, celălalt vă scoate din încurcătură.
- **Nicio parolă refolosită** între servicii. Un manager de parole (Bitwarden, 1Password) vă ajută.
- **Cheile secrete** (Resend, Turnstile, cheile de semnare din Convex) stau doar în setările Convex sau Vercel, niciodată în cod sau în chat.
  Dacă o cheie a ajuns undeva unde nu trebuia, o înlocuiți imediat (ștergerea mesajului nu ajunge).
- **Administratorii site-ului** sunt cei din setarea `ADMIN_EMAILS` din Convex. Rolul se dă doar unui email confirmat cu cod (făcut).

## 2. Copii de rezervă (făcut, de rulat de voi)

`node scripts/backup.mjs --prod` face o copie a întregii baze de producție (tabele și fișiere), **criptată cu o parolă** pe care o
alegeți voi, într-un dosar din afara proiectului (`~/FindMyUni-backups`). Proiectul nu păstrează niciodată copia, pentru că are date personale.

- Rulați-o săptămânal și înainte de orice schimbare mare (de exemplu o încărcare nouă a catalogului).
- Păstrați parola copiei separat de copie (de exemplu în managerul de parole). Fără ea, copia nu se poate deschide.
- Păstrați doar ultimele câteva copii; ștergeți-le pe cele vechi (au aceleași date personale ca baza).
- Refacerea: `node scripts/backup.mjs --decrypt <fișier>.enc`, apoi `npx convex import` după ghidul Convex (de citit înainte; înlocuiește datele).
- Probat pe baza de dezvoltare: copia se face și se deschide la loc.
- Convex mai are și copii proprii, pe planurile plătite (de verificat pe pagina lor de prețuri).

## 3. Dacă site-ul e „bombardat” cu cereri

Ce există deja (făcut):
- Toate funcțiile publice ale bazei de date citesc un număr limitat de rânduri.
- Limite la conturi noi, coduri pe email, conectări, păreri, statistici și verificarea „nume liber” (`convex/authLimits.ts`, `convex/reviews.ts`, `convex/analytics.ts`).
- Căsuța „Nu sunt robot” la crearea contului, la „Am uitat parola” și la formularul de păreri: un robot nu poate consuma limitele generale fără să treacă de ea.
- Vercel are protecție automată împotriva atacurilor mari din multe locuri deodată (DDoS) pentru site.

Ce faceți dacă site-ul e atacat (voi):
1. **Vercel → proiectul → Firewall → Attack Challenge Mode: pornit.** Fiecare vizitator trece printr-o verificare înainte să vadă site-ul. Opriți-l după atac.
2. În Firewall puteți bloca o țară sau o adresă IP care trimite foarte multe cereri (le vedeți în graficul de trafic).
3. Uitați-vă în Convex → Logs dacă vreo funcție e apelată anormal de des și spuneți-i lui Claude care.
4. Notați ce s-a întâmplat în `docs/LEDGER.md`.

Limită cunoscută: browserul vorbește direct cu Convex, deci un atacator poate apela funcțiile publice ale bazei fără să treacă prin
Vercel. Limitele de mai sus îl încetinesc, dar pe planul gratuit Convex un atac lung poate consuma cota lunară (de verificat pe pagina
de prețuri ce se întâmplă atunci: pauză sau cost). Pentru lansare, planul plătit Convex dă cote mai mari.

## 4. Limite de cheltuieli (voi)

Ca un atac să nu vă aducă o factură mare:
- **Vercel → Settings → Billing → Spend Management** (pe planul plătit): o sumă maximă pe lună și oprirea proiectului la depășire.
- **Convex → Settings → Usage / Billing**: alertă la apropierea de limită; pe planul plătit, o limită de cheltuieli (de verificat exact unde).
- **Resend**: planul gratuit are o limită de emailuri pe zi; limitele noastre de coduri (5 pe oră pentru același email, 200 pe oră pe site) o protejează.

## 5. Dacă datele scapă (procedura GDPR, art. 33–34)

O „încălcare a securității datelor” înseamnă că date personale au fost văzute, copiate, schimbate sau șterse de cine nu trebuia
(de exemplu o cheie scăpată, un cont de administrator spart, o funcție care arăta date fără cont).

1. **Opriți scurgerea**: schimbați cheia sau parola, scoateți accesul, opriți funcția (Claude vă ajută).
2. **Notați** imediat: ce s-a întâmplat, când ați aflat, ce date și câte persoane, ce ați făcut.
3. **În 72 de ore** de când ați aflat: dacă există un risc pentru oameni, anunțați **ANSPDCP** (dataprotection.ro, formularul de notificare a încălcării).
   Dacă nu sunt toate informațiile, se anunță ce se știe și se completează apoi.
4. Dacă riscul pentru oameni e **mare** (de exemplu emailuri și nume ajunse publice), îi anunțați și pe ei, pe email, în cuvinte simple.
5. Păstrați notițele chiar dacă nu a fost nevoie de anunț (legea cere evidența tuturor încălcărilor).

Cine face asta e operatorul (de completat la final, împreună cu pagina de confidențialitate). Nu e sfat juridic: juristul confirmă procedura.

## 6. Înainte de lansare — lista scurtă

- [ ] 2FA și al doilea om pe toate conturile (secțiunea 1)
- [ ] Prima copie de rezervă a producției, după ce baza e completă (secțiunea 2)
- [ ] Limite de cheltuieli (secțiunea 4)
- [ ] Chei reale în setările de producție: Resend, Turnstile, `ADMIN_EMAILS`; `AUTH_DEV_LOG_LINKS` **nu** se pune în producție
- [ ] Funcțiile Convex publicate în producție (`npx convex deploy`) și catalogul încărcat (`node scripts/data/import.mjs --prod`), doar la cererea echipei
- [ ] Scanarea ZAP rulată o dată pe GitHub (după ce versiunea ajunge pe `main`) și încercările manuale din `docs/securitate.md`
- [ ] Pagina de confidențialitate: datele operatorului și citirea de către un jurist (`docs/gdpr.md`)
