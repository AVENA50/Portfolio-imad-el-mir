import { describe, expect, it } from "vitest";

import {
  CONTACT_LIMITS,
  collectErrors,
  contactSchema,
  isSpam,
} from "@/lib/contact/schema";

/**
 * Questo schema e l'unica cosa fra il form e la casella di posta.
 *
 * I test non verificano zod — quello funziona — ma le **decisioni**: quali
 * indirizzi accettare, quanto lungo deve essere un messaggio perche valga
 * la pena leggerlo, e che la trappola antispam scatti. Sono scelte, e una
 * scelta senza test e un'opinione che qualcuno cambiera per sbaglio.
 */

function valido(overrides: Record<string, unknown> = {}) {
  return {
    name: "Imad El Mir",
    email: "imad@example.com",
    subject: "Proposta di collaborazione",
    message: "Ciao Imad, ti scrivo perche vorrei parlarti di un progetto.",
    ...overrides,
  };
}

describe("contactSchema", () => {
  it("accetta un messaggio ben formato", () => {
    expect(contactSchema.safeParse(valido()).success).toBe(true);
  });

  it("toglie gli spazi ai bordi invece di rifiutare", () => {
    const parsed = contactSchema.parse(valido({ name: "  Imad  " }));
    expect(parsed.name).toBe("Imad");
  });

  it("rifiuta un nome di una lettera", () => {
    const result = contactSchema.safeParse(valido({ name: "I" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectErrors(result.error.issues).name).toBe("nameTooShort");
    }
  });

  it("rifiuta un messaggio troppo corto per dire qualcosa", () => {
    const result = contactSchema.safeParse(valido({ message: "ciao" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectErrors(result.error.issues).message).toBe(
        "messageTooShort",
      );
    }
  });

  it("rifiuta un messaggio piu lungo del limite", () => {
    const result = contactSchema.safeParse(
      valido({ message: "a".repeat(CONTACT_LIMITS.messageMax + 1) }),
    );
    expect(result.success).toBe(false);
  });

  describe("email", () => {
    // Indirizzi legittimi che le regex scritte in fretta rifiutano.
    it.each([
      "nome.cognome@example.com",
      "imad+portfolio@example.com",
      "imad@sotto.dominio.example.co.uk",
      "imad@e-x-a-m-p-l-e.com",
      "imad@example.technology",
    ])("accetta %s", (address) => {
      expect(contactSchema.safeParse(valido({ email: address })).success).toBe(
        true,
      );
    });

    it.each([
      "senzachiocciola.com",
      "@example.com",
      "imad@",
      "imad@example",
      "imad @example.com",
      "",
    ])("rifiuta %s", (address) => {
      expect(contactSchema.safeParse(valido({ email: address })).success).toBe(
        false,
      );
    });
  });

  describe("trappola antispam", () => {
    it("accetta il campo vuoto o assente", () => {
      expect(contactSchema.safeParse(valido()).success).toBe(true);
      expect(contactSchema.safeParse(valido({ website: "" })).success).toBe(
        true,
      );
    });

    it("rifiuta se il campo e stato compilato", () => {
      const result = contactSchema.safeParse(
        valido({ website: "http://spam.example" }),
      );
      expect(result.success).toBe(false);
      if (!result.success) expect(isSpam(result.error.issues)).toBe(true);
    });
  });
});

describe("collectErrors", () => {
  it("tiene un errore solo per campo", () => {
    const result = contactSchema.safeParse({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = collectErrors(result.error.issues);
      expect(Object.keys(errors).sort()).toEqual([
        "email",
        "message",
        "name",
        "subject",
      ]);
    }
  });

  it("non espone la trappola fra gli errori del form", () => {
    // Se comparisse, il robot capirebbe quale campo lo ha tradito.
    const result = contactSchema.safeParse(valido({ website: "spam" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(collectErrors(result.error.issues)).toEqual({});
    }
  });
});
