import "server-only";

import type { ContactInput } from "@/lib/contact/schema";

/**
 * Il corpo dell'email che arriva nella casella.
 *
 * **Perche l'escaping e obbligatorio qui.** Il messaggio arriva da uno
 * sconosciuto e finisce dentro dell'HTML. Se contenesse `<img
 * src=x onerror=...>` o un tag `<style>`, il client di posta lo
 * interpreterebbe: nella migliore delle ipotesi la mail si vede storta,
 * nella peggiore diventa un vettore di attacco contro chi la legge — cioe
 * te. Ogni valore passa da `escape`, senza eccezioni.
 *
 * Si mandano **due versioni**, HTML e testo semplice. Non e pignoleria:
 * i filtri antispam guardano con sospetto le email di solo HTML, e la
 * versione testuale e quella che si vede nell'anteprima delle notifiche.
 */

/** Rende inerte qualunque cosa arrivi dal form. */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Gli a capo del textarea diventano `<br>`, dopo l'escaping. */
function paragraphs(value: string): string {
  return escape(value).replace(/\r?\n/g, "<br />");
}

/**
 * L'oggetto dell'email.
 *
 * Prefissato, cosi in casella si distingue a colpo d'occhio dal resto e si
 * puo filtrare con una regola. Il testo scritto dal mittente viene dopo.
 */
export function buildSubject(input: ContactInput): string {
  return `[Portfolio] ${input.subject}`;
}

export function buildText(input: ContactInput): string {
  return [
    `Da: ${input.name} <${input.email}>`,
    `Oggetto: ${input.subject}`,
    "",
    input.message,
    "",
    "—",
    "Inviato dal form di contatto del portfolio.",
  ].join("\n");
}

export function buildHtml(input: ContactInput): string {
  // Stili in linea e tabelle non sono cattivo gusto: i client di posta
  // ignorano i fogli di stile esterni e molti ignorano anche `<style>`.
  return `<!doctype html>
<html lang="it">
  <body style="margin:0;padding:24px;background:#0b0d18;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#12142a;border:1px solid #2a2d4a;border-radius:16px;padding:28px;">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8b5cf6;">
        Nuovo messaggio dal portfolio
      </p>
      <h1 style="margin:0 0 24px;font-size:20px;line-height:1.3;color:#f8fafc;">
        ${escape(input.subject)}
      </h1>

      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#94a3b8;width:64px;">Nome</td>
          <td style="padding:6px 0;font-size:14px;color:#f8fafc;">${escape(input.name)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#94a3b8;">Email</td>
          <td style="padding:6px 0;font-size:14px;">
            <a href="mailto:${escape(input.email)}" style="color:#c4b5fd;text-decoration:none;">${escape(input.email)}</a>
          </td>
        </tr>
      </table>

      <div style="padding:18px;background:#0b0d18;border-radius:12px;border:1px solid #2a2d4a;font-size:14px;line-height:1.6;color:#e2e8f0;">
        ${paragraphs(input.message)}
      </div>

      <p style="margin:24px 0 0;font-size:12px;color:#64748b;">
        Rispondi a questa email per scrivere direttamente a ${escape(input.name)}.
      </p>
    </div>
  </body>
</html>`;
}
