import { beforeEach, describe, expect, it } from "vitest";

import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  clientKey,
  rateLimit,
  resetRateLimit,
} from "@/lib/contact/rate-limit";

/**
 * Il tempo si inietta invece di aspettarlo.
 *
 * Un test che verifica una finestra di dieci minuti dormendo dieci minuti
 * non e un test: e qualcosa che nessuno lancera mai piu. Passando `now`
 * come parametro il comportamento nel tempo si verifica in millisecondi,
 * ed e la ragione per cui `rateLimit` accetta quell'argomento.
 */

const T0 = 1_700_000_000_000;

beforeEach(() => {
  resetRateLimit();
});

describe("rateLimit", () => {
  it("lascia passare fino al limite e poi blocca", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      expect(rateLimit("1.2.3.4", T0).ok).toBe(true);
    }

    expect(rateLimit("1.2.3.4", T0).ok).toBe(false);
  });

  it("conta separatamente chiamanti diversi", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) rateLimit("1.2.3.4", T0);

    // Un visitatore che esaurisce il suo limite non deve bloccare gli altri.
    expect(rateLimit("5.6.7.8", T0).ok).toBe(true);
  });

  it("riapre quando il tentativo piu vecchio esce dalla finestra", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) rateLimit("1.2.3.4", T0);
    expect(rateLimit("1.2.3.4", T0).ok).toBe(false);

    const dopo = T0 + RATE_LIMIT_WINDOW_MS + 1;
    expect(rateLimit("1.2.3.4", dopo).ok).toBe(true);
  });

  it("scorre invece di azzerarsi a blocchi", () => {
    // Tentativi distribuiti nella finestra: uno all'inizio, gli altri dopo.
    rateLimit("1.2.3.4", T0);
    rateLimit("1.2.3.4", T0 + 60_000);
    rateLimit("1.2.3.4", T0 + 120_000);

    // Appena scaduto il primo si libera un posto solo, non tutti e tre:
    // e questa la differenza con un contatore a blocchi.
    const dopo = T0 + RATE_LIMIT_WINDOW_MS + 1;
    expect(rateLimit("1.2.3.4", dopo).ok).toBe(true);
    expect(rateLimit("1.2.3.4", dopo).ok).toBe(false);
  });

  it("dice quanti tentativi restano", () => {
    expect(rateLimit("1.2.3.4", T0).remaining).toBe(RATE_LIMIT_MAX - 1);
    expect(rateLimit("1.2.3.4", T0).remaining).toBe(RATE_LIMIT_MAX - 2);
  });

  it("dice fra quanto riprovare, e non e mai zero quando blocca", () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) rateLimit("1.2.3.4", T0);

    const bloccato = rateLimit("1.2.3.4", T0 + 1000);
    expect(bloccato.ok).toBe(false);
    expect(bloccato.retryAfter).toBeGreaterThan(0);
    expect(bloccato.retryAfter).toBeLessThanOrEqual(
      RATE_LIMIT_WINDOW_MS / 1000,
    );
  });
});

describe("clientKey", () => {
  it("prende il primo indirizzo della catena x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.9, 70.41.3.18, 150.172.238.178",
    });

    expect(clientKey(headers)).toBe("203.0.113.9");
  });

  it("ripiega su x-real-ip", () => {
    expect(clientKey(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9",
    );
  });

  it("senza header restituisce una chiave fissa invece di niente", () => {
    // Meglio un limite globale che nessun limite: succede solo in locale.
    expect(clientKey(new Headers())).toBe("sconosciuto");
  });
});
