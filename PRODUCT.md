# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Romanian high-school students in grades 11 and 12 (17–19 years old) who do not yet know which faculty to choose. They arrive mostly on a phone, often from TikTok or Instagram, and decide in seconds whether the site is for them. Parents and foreign students (English pages under /en) also visit, but the pages are designed for the student.

## Product Purpose

FindMyUni (https://findmyuni.ro) helps a student go from "I don't know what to study" to a short list of real programmes and universities. Success: the student finishes the questionnaire, sees three study domains that fit, and opens the sheets of universities where those domains are taught.

## Positioning

- Official data: bachelor programmes and Romanian admission averages come from official national lists, each with its source (page /surse).
- The questionnaire: 18 short questions, about 5 minutes, three matching study domains with a match percentage; rule-based, runs in the browser.
- Real student opinions: named students with photos, shown only after the team approves them.

## Operating Context

Free public site, Romanian at the plain addresses and English under /en. Accounts (username and password) are optional and only needed to save a result or favourite universities. The team promotes it on TikTok and Instagram.

## Capabilities and Constraints

- Pages: home, questionnaire (/test, /quiz, /rezultat), university search (/universitati) and sheets, faculty sheets, study fields (/specializari), programme search (/programe), student opinions (/studenti, form /studenti/parere), country guides (/ghiduri), data sources (/surse), account (/cont), privacy.
- Catalogue: 84 Romanian universities with full sheets; institutions and programmes from 18 countries' official datasets.
- Next.js on Vercel, Tailwind CSS v4, Convex database. No long-running server.
- Romanian first; every page also exists in English unless marked Romanian-only (country guides).

## Brand Commitments

- Name "FindMyUni" and the graduation-cap logo (`apps/web/public/logo-cap.png`) stay.
- Burgundy (#61122d) and gold (#c8962e) stay as the brand colours.
- Voice: plain, simple Romanian, speaking to the student as "tu".

## Evidence on Hand

- University photos: 520 freely licensed photos in `apps/web/public/photos` (Wikimedia Commons, author and licence must be shown).
- Student opinions: `apps/web/data/testimonials.json` with photos in `apps/web/public/studenti`; quotes may be shortened but never invented or reworded.
- Numbers that may be shown: 84 Romanian universities, 18 countries, 18 questions. No other statistics are confirmed; do not invent user counts, ratings or programme totals.

## Product Principles

- Truth over hype: every fact has an official source; leave out what is uncertain.
- Help the student decide, quickly: the questionnaire and search are always one tap away.
- Real people, real places: real student voices and real photos of the universities, never stock or invented ones.
- Made for a phone first.
