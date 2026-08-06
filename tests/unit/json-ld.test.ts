import { describe, expect, it } from "vitest";

import {
  breadcrumbJsonLd,
  personJsonLd,
  projectJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import type { ProjectSummary } from "@/types";

/**
 * Perche testare del JSON che nessun utente vedra mai.
 *
 * Proprio per questo. Un dato strutturato sbagliato non rompe niente: la
 * pagina si apre, il sito funziona, e l'unico effetto e che Google smette
 * di capire chi sei. E il tipo di errore che resta in produzione per anni,
 * perche non ha sintomi.
 *
 * I test qui sotto guardano le tre cose che schema.org pretende e che si
 * sbagliano piu facilmente: che gli `@id` combacino fra documenti diversi,
 * che le date abbiano il giorno, e che gli URL siano assoluti.
 */

function project(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    slug: "arcadium",
    locale: "it",
    title: "Arcadium",
    tagline: "Piattaforma per la libreria di videogiochi",
    category: "full-stack",
    tags: ["etl", "rest-api"],
    featured: true,
    status: "in-progress",
    type: "academic",
    startDate: "2025-01",
    links: {},
    cover: { src: "/images/projects/arcadium/cover.webp", alt: "copertina" },
    readingTime: 8,
    ...overrides,
  };
}

/** Tutti gli URL dentro un oggetto, comunque annidati. */
function urlsIn(value: unknown): string[] {
  if (typeof value === "string") {
    return value.startsWith("http") || value.startsWith("/") ? [value] : [];
  }
  if (Array.isArray(value)) return value.flatMap(urlsIn);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, v]) =>
      // `@context` e `@type` sono identificatori di schema.org, non link.
      key.startsWith("@") && key !== "@id" ? [] : urlsIn(v),
    );
  }
  return [];
}

describe("personJsonLd", () => {
  it("dichiara una Person con nome e ruolo", () => {
    const data = personJsonLd("it");
    expect(data["@type"]).toBe("Person");
    expect(data.name).toBe("Imad El Mir");
  });

  it("elenca i profili in sameAs", () => {
    // E il campo che collega GitHub, LinkedIn e il sito alla stessa persona.
    const sameAs = personJsonLd("it").sameAs as string[];
    expect(sameAs.length).toBeGreaterThan(0);
    expect(sameAs.every((url) => url.startsWith("https://"))).toBe(true);
  });

  it("non espone l'indirizzo di casa", () => {
    const address = personJsonLd("it").address as Record<string, unknown>;
    expect(address.streetAddress).toBeUndefined();
    expect(address.postalCode).toBeUndefined();
    expect(address.addressLocality).toBe("Torino");
  });

  it("usa solo URL assoluti", () => {
    const relativi = urlsIn(personJsonLd("it")).filter((u) =>
      u.startsWith("/"),
    );
    expect(relativi).toEqual([]);
  });
});

describe("webSiteJsonLd", () => {
  it("punta alla stessa Person del layout", () => {
    // Se i due `@id` divergono, per Google l'autore del sito e uno
    // sconosciuto invece della persona descritta due righe sopra.
    const person = personJsonLd("it");
    const site = webSiteJsonLd("it");
    expect(site.author).toEqual({ "@id": person["@id"] });
  });

  it("dichiara la lingua giusta", () => {
    expect(webSiteJsonLd("it").inLanguage).toBe("it-IT");
    expect(webSiteJsonLd("en").inLanguage).toBe("en-US");
  });
});

describe("projectJsonLd", () => {
  it("dichiara un CreativeWork attribuito alla Person", () => {
    const data = projectJsonLd(project(), "it");
    expect(data["@type"]).toBe("CreativeWork");
    expect(data.author).toEqual({ "@id": personJsonLd("it")["@id"] });
  });

  it("completa le date con il giorno", () => {
    // schema.org rifiuta `2025-01`: vuole una data ISO completa.
    const data = projectJsonLd(project({ endDate: "2025-06" }), "it");
    expect(data.dateCreated).toBe("2025-01-01");
    expect(data.datePublished).toBe("2025-06-01");
  });

  it("omette datePublished se il progetto e ancora in corso", () => {
    expect(projectJsonLd(project(), "it").datePublished).toBeUndefined();
  });

  it("traduce gli slug dello stack in nomi leggibili", () => {
    const data = projectJsonLd(
      project({ stack: ["postgres", "nextjs"] }),
      "it",
    );
    expect(data.about).toEqual(["PostgreSQL", "Next.js"]);
  });

  it("omette lo stack invece di dichiararlo vuoto", () => {
    expect(projectJsonLd(project(), "it").about).toBeUndefined();
  });

  it("rende assoluto l'URL della copertina", () => {
    const image = projectJsonLd(project(), "it").image as string;
    expect(image.startsWith("http")).toBe(true);
    expect(image.endsWith("/images/projects/arcadium/cover.webp")).toBe(true);
  });
});

describe("breadcrumbJsonLd", () => {
  it("numera i passi da uno e non da zero", () => {
    const data = breadcrumbJsonLd("it", [
      { name: "Home", path: "/" },
      { name: "Progetti", path: "/projects" },
    ]);

    const items = data.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });

  it("non lascia uno slash finale sulla home", () => {
    // `/it/` e `/it` sarebbero due URL diversi per un crawler.
    const data = breadcrumbJsonLd("it", [{ name: "Home", path: "/" }]);
    const items = data.itemListElement as { item: string }[];
    expect(items[0]?.item.endsWith("/it")).toBe(true);
  });
});
