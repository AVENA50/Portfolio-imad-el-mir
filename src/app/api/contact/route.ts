import { NextResponse } from "next/server";
import { Resend } from "resend";

import { serverEnv } from "@/config/env";
import { buildHtml, buildSubject, buildText } from "@/lib/contact/email";
import { clientKey, rateLimit } from "@/lib/contact/rate-limit";
import { collectErrors, contactSchema, isSpam } from "@/lib/contact/schema";

/**
 * POST /api/contact — riceve un messaggio dal form e lo spedisce (M9-T10).
 *
 * **Il principio che governa tutto il file: non fidarsi di chi chiama.**
 * La validazione che gira nel browser e cortesia verso l'utente, non
 * sicurezza: chiunque puo aprire i DevTools e mandare quello che vuole a
 * questo indirizzo. Qui si rivalida tutto da zero con lo stesso schema.
 *
 * **E il principio speculare: non raccontare troppo a chi chiama.** Se
 * Resend risponde con un errore, quel messaggio resta nei log del server.
 * Al browser va un codice generico. Un messaggio d'errore dettagliato dice
 * a un attaccante quale servizio c'e dietro, com'e configurato e cosa e
 * riuscito a rompere — informazioni che a un utente legittimo non servono
 * e a un altro servono moltissimo.
 */

/**
 * Il runtime deve essere Node e non Edge: l'SDK di Resend usa API che
 * l'ambiente Edge non espone. Scriverlo qui evita di scoprirlo in
 * produzione, dove il fallimento sarebbe silenzioso per l'utente e
 * visibile solo nei log.
 */
export const runtime = "nodejs";

/** Nessuna cache: ogni invio e un evento, non una lettura. */
export const dynamic = "force-dynamic";

type Failure =
  | "invalid" // i dati non passano lo schema
  | "rateLimited" // troppi tentativi
  | "serverError"; // qualunque cosa sia andata storta da questa parte

export async function POST(request: Request) {
  // 1 — Limite di frequenza, prima di tutto il resto.
  //     Va per primo di proposito: se qualcuno sta martellando la rotta,
  //     non ha senso spendere lavoro a leggere e validare il corpo.
  const limit = rateLimit(clientKey(request.headers));

  if (!limit.ok) {
    return NextResponse.json(
      { error: "rateLimited" satisfies Failure },
      {
        status: 429,
        // Header standard: dice al browser quando ha senso riprovare.
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  // 2 — Il corpo puo non essere JSON: arriva da fuori.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid" satisfies Failure },
      { status: 400 },
    );
  }

  // 3 — Validazione.
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    // La trappola antispam merita una risposta diversa: si finge il
    // successo. Un robot che riceve un errore capisce di essere stato
    // scoperto e prova un'altra strada; uno che riceve "ok" se ne va
    // convinto di aver funzionato, e non torna.
    if (isSpam(parsed.error.issues)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json(
      {
        error: "invalid" satisfies Failure,
        fields: collectErrors(parsed.error.issues),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 4 — Invio.
  try {
    const env = serverEnv();
    const resend = new Resend(env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: env.CONTACT_EMAIL_FROM,
      to: env.CONTACT_EMAIL_TO,
      subject: buildSubject(input),
      text: buildText(input),
      html: buildHtml(input),
      // Il pezzo che rende il form davvero utile: premendo "rispondi"
      // nella casella si scrive alla persona, non a se stessi. Il mittente
      // resta il dominio verificato, altrimenti la mail finisce nello spam.
      replyTo: `${input.name} <${input.email}>`,
    });

    if (error) {
      // Il dettaglio resta qui. Al browser va un codice generico.
      console.error("[contact] Resend ha rifiutato l'invio:", error);
      return NextResponse.json(
        { error: "serverError" satisfies Failure },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (cause) {
    // Ci finisce anche la configurazione incompleta: serverEnv() lancia se
    // manca una variabile. In sviluppo il messaggio in console dice quale.
    console.error("[contact] invio fallito:", cause);
    return NextResponse.json(
      { error: "serverError" satisfies Failure },
      { status: 500 },
    );
  }
}

/**
 * Qualunque altro metodo riceve un rifiuto esplicito.
 *
 * Senza, Next risponderebbe 405 da solo, ma senza l'header `Allow` che dice
 * quali metodi esistono. E anche un piccolo deterrente: chi sonda la rotta
 * con GET vede subito che non c'e niente da leggere.
 */
export function GET() {
  return NextResponse.json(
    { error: "Metodo non consentito" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
