import "server-only";

import { z } from "zod";

/**
 * Variabili d'ambiente del server, validate all'avvio.
 *
 * **Perche non leggerle direttamente da `process.env`.** In TypeScript
 * `process.env.RESEND_API_KEY` ha tipo `string | undefined`, e quel
 * `undefined` si propaga fino a diventare un errore a runtime — nel punto
 * peggiore, cioe quando un visitatore preme "invia". Qui il controllo
 * avviene una volta, al primo import, e il messaggio dice esattamente
 * quale variabile manca e dove metterla.
 *
 * **`import "server-only"` non e decorativo.** E una guardia del bundler:
 * se un giorno qualcuno importa questo file da un componente client, la
 * build fallisce con un errore esplicito invece di spedire la chiave API
 * di Resend dentro il JavaScript del browser. E l'errore piu costoso che
 * si possa fare in un file come questo, e vale la pena renderlo impossibile
 * invece che improbabile.
 */

const serverEnvSchema = z.object({
  /** Chiave di Resend. Senza, il form non puo spedire. */
  RESEND_API_KEY: z
    .string()
    .min(1, "RESEND_API_KEY mancante: mettila in .env.local"),

  /**
   * Mittente. Deve essere un indirizzo su un dominio verificato su Resend,
   * oppure `onboarding@resend.dev` finche il dominio non c'e.
   */
  CONTACT_EMAIL_FROM: z
    .string()
    .min(1, "CONTACT_EMAIL_FROM mancante: mettila in .env.local"),

  /** Dove arrivano i messaggi del form. */
  CONTACT_EMAIL_TO: z
    .string()
    .min(1, "CONTACT_EMAIL_TO mancante: mettila in .env.local"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

/**
 * Legge e valida le variabili, una volta sola.
 *
 * E una funzione e non una costante esportata perche il modulo viene
 * importato anche quando la rotta non e in uso: validare all'import
 * farebbe fallire la build sulle macchine di chi non ha ancora messo la
 * chiave, e una build non dovrebbe rompersi per una funzione che nessuno
 * sta usando in quel momento.
 */
export function serverEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM,
    CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.message).join("\n  ");
    throw new Error(`Configurazione incompleta:\n  ${missing}`);
  }

  cached = parsed.data;
  return cached;
}
