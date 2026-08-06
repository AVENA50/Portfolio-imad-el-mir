import { z } from "zod";

import { CONTACT_LIMITS } from "@/lib/contact/limits";

/**
 * Schema del messaggio di contatto (M9-T8).
 *
 * **Uno solo, usato da due parti.** Il browser lo usa per dire subito
 * all'utente cosa manca; la rotta API lo usa per non fidarsi del browser.
 * Non e ridondanza: la validazione nel browser e cortesia — si puo
 * disattivare con dieci secondi di DevTools — quella sul server e l'unica
 * che protegge davvero. Scriverle in due file significherebbe che prima o
 * poi divergono, e la falla si apre proprio nella differenza.
 *
 * **Perche i messaggi sono codici e non frasi.** Il sito e bilingue. Se lo
 * schema dicesse "Il nome e troppo corto", quella frase sarebbe italiana
 * anche per chi naviga in inglese, e tradurla vorrebbe dire duplicare lo
 * schema. Qui ogni errore ha un codice stabile — `nameTooShort` — che il
 * dizionario trasforma in testo nella lingua giusta. Lo schema resta uno,
 * le lingue restano due.
 */

/**
 * I limiti vivono in `limits.ts`, che non dipende da zod.
 *
 * Ri-esportati qui perche chi valida li vuole insieme allo schema, e
 * perche il server e i test li hanno sempre presi da questo file. Chi
 * invece deve solo leggere i numeri — il form, per gli attributi
 * `maxLength` — importa direttamente `limits.ts` e non si porta dietro
 * zod nel browser.
 */
export { CONTACT_LIMITS };

/**
 * Email valida senza inventarsi un'espressione regolare.
 *
 * Le regex per le email sono un classico errore: quella "giusta" secondo
 * l'RFC 5322 e lunga quattrocento caratteri e accetta cose che nessun
 * server accetterebbe, mentre quelle corte rifiutano indirizzi legittimi —
 * i domini con trattini, i `+` per le sottocaselle, i nuovi TLD lunghi.
 * Qui si controlla la forma minima e il resto lo dira il tentativo di
 * consegna, che e l'unico giudice affidabile.
 */
const email = z
  .string()
  .trim()
  .min(1, { message: "emailRequired" })
  .max(CONTACT_LIMITS.emailMax, { message: "emailTooLong" })
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
    message: "emailInvalid",
  });

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.nameMin, { message: "nameTooShort" })
    .max(CONTACT_LIMITS.nameMax, { message: "nameTooLong" }),

  email,

  subject: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.subjectMin, { message: "subjectTooShort" })
    .max(CONTACT_LIMITS.subjectMax, { message: "subjectTooLong" }),

  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.messageMin, { message: "messageTooShort" })
    .max(CONTACT_LIMITS.messageMax, { message: "messageTooLong" }),

  /**
   * Trappola per i robot.
   *
   * Nel form e un campo di testo vero, nascosto agli occhi e tolto dal
   * percorso della tastiera. Una persona non lo vede e non lo raggiunge
   * col Tab; un robot compila tutti i campi che trova nel markup, quindi
   * se qui arriva qualcosa il mittente non e una persona.
   *
   * Si chiama `website` e non `honeypot` di proposito: il nome deve
   * sembrare un campo desiderabile da riempire.
   *
   * Costa zero, non chiede nulla all'utente e non ha falsi positivi come
   * un captcha. Non ferma un robot scritto apposta per questo sito — per
   * quello c'e il limite di frequenza — ma ferma tutti quelli generici,
   * che sono la quasi totalita.
   */
  website: z
    .string()
    .max(0, { message: "spamDetected" })
    .optional()
    .or(z.literal("")),
});

/** Il tipo deriva dallo schema: non puo divergere da quello che valida. */
export type ContactInput = z.infer<typeof contactSchema>;

/** I codici che lo schema puo restituire, per tradurli nel dizionario. */
export type ContactErrorCode =
  | "nameTooShort"
  | "nameTooLong"
  | "emailRequired"
  | "emailInvalid"
  | "emailTooLong"
  | "subjectTooShort"
  | "subjectTooLong"
  | "messageTooShort"
  | "messageTooLong"
  | "spamDetected";

/** I campi che il form mostra, in ordine. Esclude la trappola. */
export type ContactField = "name" | "email" | "subject" | "message";

/**
 * I codici che l'utente puo davvero leggere.
 *
 * `spamDetected` ne resta fuori: quando scatta la trappola il server finge
 * il successo e non mostra niente, quindi quel codice non ha — e non deve
 * avere — una traduzione. Esprimerlo nel tipo invece che in un commento
 * significa che se un giorno qualcuno provasse a mostrarlo, il compilatore
 * lo fermerebbe chiedendo la stringa mancante nel dizionario.
 */
export type ContactFieldError = Exclude<ContactErrorCode, "spamDetected">;

export type ContactErrors = Partial<Record<ContactField, ContactFieldError>>;

/**
 * Trasforma il risultato di zod in una mappa campo -> codice.
 *
 * Solo il **primo** errore per campo: mostrarne tre sotto la stessa casella
 * non aiuta nessuno a correggerla, e chi usa uno screen reader se li sente
 * leggere tutti a ogni battuta.
 */
export function collectErrors(issues: z.ZodIssue[]): ContactErrors {
  const errors: ContactErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    if (field === "website") continue;
    if (!isContactField(field)) continue;
    if (errors[field]) continue;

    errors[field] = issue.message as ContactFieldError;
  }

  return errors;
}

function isContactField(value: string): value is ContactField {
  return (
    value === "name" ||
    value === "email" ||
    value === "subject" ||
    value === "message"
  );
}

/** Dice se fra gli errori c'e la trappola scattata. */
export function isSpam(issues: z.ZodIssue[]): boolean {
  return issues.some((issue) => issue.path[0] === "website");
}
