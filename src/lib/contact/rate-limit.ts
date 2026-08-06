/**
 * Limite di frequenza a finestra scorrevole (M9-T10).
 *
 * **A cosa serve davvero.** Il piano gratuito di Resend da tremila email al
 * mese. Un solo script che chiama la rotta in un ciclo le esaurisce in pochi
 * minuti, e da quel momento il form non funziona piu per nessuno finche non
 * scatta il mese nuovo. Non e un attacco sofisticato: e una riga di `curl`
 * dentro un `while`.
 *
 * **Finestra scorrevole e non a blocchi.** Un contatore che si azzera ogni
 * dieci minuti lascia passare il doppio del limite a cavallo dei due
 * blocchi: tre invii all'ultimo secondo del primo, tre al primo secondo del
 * secondo. Qui si tengono gli istanti dei tentativi e si contano quelli
 * dentro gli ultimi dieci minuti, quindi il limite vale in ogni momento.
 *
 * ---
 *
 * **IL LIMITE DI QUESTA IMPLEMENTAZIONE, detto chiaramente.**
 *
 * La memoria e quella del processo. Su Vercel ogni funzione serverless gira
 * in un'istanza che nasce e muore, e ne possono esistere diverse in
 * parallelo: due richieste possono finire su istanze diverse, ognuna con la
 * sua mappa vuota. Il limite reale e quindi *per istanza*, non globale, e
 * dopo qualche minuto di inattivita si azzera.
 *
 * Va bene lo stesso, perche l'obiettivo qui e fermare l'abuso banale — il
 * ciclo di `curl`, il robot generico, il doppio clic sul pulsante — e per
 * quello basta: le richieste ravvicinate finiscono quasi sempre sulla stessa
 * istanza calda.
 *
 * Non basterebbe contro un attacco distribuito e deliberato. Se un giorno
 * servisse, la sostituzione e circoscritta a questo file: si tiene la stessa
 * firma e si mette dietro un archivio condiviso — Upstash Redis ha un piano
 * gratuito ed e la scelta ovvia su Vercel. Nessun altro file cambia.
 */

/** Quante richieste sono ammesse dentro la finestra. */
export const RATE_LIMIT_MAX = 3;

/** Ampiezza della finestra, in millisecondi. Dieci minuti. */
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Oltre questo numero di chiavi la mappa viene ripulita.
 *
 * Senza, un flusso di indirizzi IP diversi la farebbe crescere finche il
 * processo non esaurisce la memoria — lo stesso abuso che il limite doveva
 * fermare, spostato dalla quota email alla RAM.
 */
const MAX_KEYS = 10_000;

const hits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  /** Quante richieste restano nella finestra corrente. */
  remaining: number;
  /** Fra quanti secondi si liberera un posto. Zero se ce n'e gia uno. */
  retryAfter: number;
}

/**
 * Registra un tentativo e dice se e ammesso.
 *
 * @param key      di norma l'indirizzo IP del chiamante
 * @param now      iniettabile per poter testare il passare del tempo senza
 *                 far aspettare dieci minuti alla suite di test
 */
export function rateLimit(key: string, now = Date.now()): RateLimitResult {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Si scartano i tentativi usciti dalla finestra prima di contare: e cosi
  // che la finestra "scorre" invece di azzerarsi di colpo.
  const recent = (hits.get(key) ?? []).filter((time) => time > windowStart);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);

    // Il posto si libera quando il piu vecchio dei tentativi esce dalla
    // finestra, non fra dieci minuti da adesso.
    const oldest = recent[0] ?? now;
    const waitMs = oldest + RATE_LIMIT_WINDOW_MS - now;

    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil(waitMs / 1000)),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) prune(now);

  return {
    ok: true,
    remaining: RATE_LIMIT_MAX - recent.length,
    retryAfter: 0,
  };
}

/** Toglie dalla mappa le chiavi che non hanno piu tentativi validi. */
function prune(now: number): void {
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  for (const [key, times] of hits) {
    const recent = times.filter((time) => time > windowStart);
    if (recent.length === 0) hits.delete(key);
    else hits.set(key, recent);
  }
}

/** Azzera tutto. Serve solo ai test, per partire da uno stato pulito. */
export function resetRateLimit(): void {
  hits.clear();
}

/**
 * Ricava una chiave dalla richiesta.
 *
 * Dietro un proxy — ed e sempre il caso su Vercel — l'indirizzo del
 * chiamante non e quello della connessione ma quello scritto negli header.
 * `x-forwarded-for` puo contenere una catena di indirizzi: il primo e il
 * client, gli altri sono i proxy attraversati.
 *
 * Se non c'e nessun header si torna una chiave fissa, e il limite diventa
 * globale invece che per visitatore. E la scelta prudente: meglio limitare
 * troppo che non limitare affatto, e succede solo in locale.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;

  return headers.get("x-real-ip")?.trim() || "sconosciuto";
}
