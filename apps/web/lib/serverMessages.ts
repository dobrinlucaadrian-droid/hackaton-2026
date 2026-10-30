// English versions of the Romanian messages the Convex functions send to the forms: serverMessage(text, lang) returns the English text on English pages and the original otherwise.
import type { Lang } from "./i18n";

const EN: Record<string, string> = {
  "Trebuie să fii conectat.": "You need to be signed in.",
  "Nu ai drept de administrator.": "You do not have administrator rights.",
  "Administrarea este blocată: confirmă cu codul primit pe email.": "Administration is locked: confirm with the code sent to your email.",
  "Prea multe încercări într-un timp scurt. Încearcă din nou peste o oră.": "Too many attempts in a short time. Try again in an hour.",
  "Scrie numele tău complet (prenume și nume).": "Write your full name (first name and surname).",
  "Parola trebuie să aibă cel puțin 8 caractere.": "The password must have at least 8 characters.",
  "Numele de utilizator trebuie să aibă 3–20 de caractere: litere fără diacritice, cifre, punct sau _.":
    "The username must have 3–20 characters: letters without accents, digits, a dot or _.",
  "Scrie o adresă de email corectă.": "Write a valid email address.",
  "Contul se poate face de la 16 ani. Până atunci poți folosi tot site-ul fără cont.": "You can make an account from the age of 16. Until then you can use the whole site without one.",
  "Acest nume de utilizator este deja folosit. Alege altul.": "This username is already taken. Choose another one.",
  "Există deja un cont cu acest email. Conectează-te cu numele de utilizator sau folosește „Am uitat parola”.":
    "An account with this email already exists. Sign in with your username or use “I forgot my password”.",
  "Date nevalide.": "Invalid data.",
  "Părerea nu mai există.": "This opinion no longer exists.",
  "Este nevoie de acordul tău pentru publicare.": "We need your agreement to publish.",
  "Numele este prea scurt sau prea lung.": "The name is too short or too long.",
  "Facultatea este prea scurtă sau prea lungă.": "The faculty is too short or too long.",
  "Universitatea este prea lungă.": "The university name is too long.",
  "Textul despre an este prea lung.": "The text about your year is too long.",
  "Părerea este prea scurtă sau prea lungă.": "The opinion is too short or too long.",
  "Am primit foarte multe păreri în ultima oră. Te rugăm să încerci din nou mai târziu.": "We received a lot of opinions in the last hour. Please try again later.",
  "Verificarea anti-robot nu este încă pornită.": "The robot check is not switched on yet.",
  "Verificarea anti-robot lipsește. Bifează căsuța „Nu sunt robot” sau reîncarcă pagina.": "The robot check is missing. Tick the “I am not a robot” box or reload the page.",
  "Verificarea anti-robot nu a trecut. Reîncarcă pagina și încearcă din nou.": "The robot check did not pass. Reload the page and try again.",
  "Codul a expirat sau nu a fost cerut. Cere un cod nou.": "The code has expired or was not requested. Ask for a new code.",
  "Prea multe coduri greșite. Cere un cod nou.": "Too many wrong codes. Ask for a new code.",
  "Codul nu este corect.": "The code is not correct.",
  "Poza nu este bună. Alege altă poză sau trimite părerea fără poză.": "The photo is not right. Choose another photo or send your opinion without one.",
};

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Poți avea cel mult (\d+) universități favorite\. Scoate una ca să adaugi alta\.$/, (m) => `You can have at most ${m[1]} favourite universities. Remove one to add another.`],
  [/^Emailul nu a putut fi trimis \(Resend (\d+)\)\.$/, (m) => `The email could not be sent (Resend ${m[1]}).`],
];

/** The message in the page language: English on English pages when we know it, the original text otherwise. */
export function serverMessage(text: string, lang: Lang): string {
  if (lang !== "en") return text;
  const exact = EN[text];
  if (exact) return exact;
  for (const [re, fn] of PATTERNS) {
    const m = text.match(re);
    if (m) return fn(m);
  }
  return text;
}
