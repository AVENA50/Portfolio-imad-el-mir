import { describe, expect, it } from "vitest";

import {
  CATEGORY_SLUGS,
  PROJECT_CATEGORIES,
  isCategorySlug,
} from "@/config/project-categories";
import { TECH_SLUGS, TECH_STACK, isTechSlug } from "@/config/tech-stack";
import { projectSchema } from "@/lib/content/schema";

/**
 * Frontmatter minimo valido.
 *
 * I test partono da qui e rompono un campo alla volta: cosi quando uno
 * fallisce si sa esattamente quale regola e saltata, invece di dover
 * confrontare due oggetti grandi.
 */
function validFrontmatter(overrides: Record<string, unknown> = {}) {
  return {
    title: "Arcadium 2.0",
    tagline: "Piattaforma di libreria giochi ispirata a Steam",
    category: "full-stack",
    startDate: "2025-01",
    cover: {
      src: "/images/projects/arcadium/cover.webp",
      alt: "Schermata principale di Arcadium",
    },
    ...overrides,
  };
}

describe("projectSchema", () => {
  it("accetta un frontmatter minimo valido", () => {
    const result = projectSchema.safeParse(validFrontmatter());
    expect(result.success).toBe(true);
  });

  it("applica i valori di default", () => {
    const result = projectSchema.parse(validFrontmatter());

    expect(result.status).toBe("completed");
    expect(result.type).toBe("personal");
    expect(result.featured).toBe(false);
    expect(result.tags).toEqual([]);
    expect(result.links).toEqual({});
  });

  describe("campi obbligatori", () => {
    it.each(["title", "tagline", "category", "startDate", "cover"])(
      "rifiuta un frontmatter senza %s",
      (field) => {
        const frontmatter = validFrontmatter();
        delete (frontmatter as Record<string, unknown>)[field];

        expect(projectSchema.safeParse(frontmatter).success).toBe(false);
      },
    );
  });

  describe("categoria", () => {
    it.each([...CATEGORY_SLUGS])("accetta la categoria %s", (category) => {
      expect(
        projectSchema.safeParse(validFrontmatter({ category })).success,
      ).toBe(true);
    });

    it("rifiuta una categoria inventata", () => {
      expect(
        projectSchema.safeParse(validFrontmatter({ category: "games" }))
          .success,
      ).toBe(false);
    });
  });

  describe("stack", () => {
    it("accetta solo slug presenti nel registro", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({ stack: ["python", "postgres", "dbt"] }),
      );

      expect(result.success).toBe(true);
    });

    it("rifiuta un refuso: e il caso che protegge la produzione", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({ stack: ["postgresq"] }),
      );

      expect(result.success).toBe(false);
    });
  });

  describe("date", () => {
    it.each(["2026-03", "2026-03-15"])("accetta %s", (startDate) => {
      expect(
        projectSchema.safeParse(validFrontmatter({ startDate })).success,
      ).toBe(true);
    });

    it.each(["03/2026", "2026", "marzo 2026", "2026-3"])(
      "rifiuta %s",
      (startDate) => {
        expect(
          projectSchema.safeParse(validFrontmatter({ startDate })).success,
        ).toBe(false);
      },
    );
  });

  describe("immagini", () => {
    it("rifiuta una cover senza alt", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({
          cover: { src: "/images/projects/x/cover.webp", alt: "" },
        }),
      );

      expect(result.success).toBe(false);
    });

    it("rifiuta un percorso che non parte da /", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({
          cover: { src: "images/x.webp", alt: "Copertina" },
        }),
      );

      expect(result.success).toBe(false);
    });
  });

  describe("link", () => {
    it("accetta URL assoluti", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({
          links: { repo: "https://github.com/AVENA50/arcadium" },
        }),
      );

      expect(result.success).toBe(true);
    });

    it("rifiuta un percorso relativo", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({ links: { repo: "/arcadium" } }),
      );

      expect(result.success).toBe(false);
    });
  });

  describe("architettura", () => {
    it("accetta la struttura completa", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({
          architecture: {
            summary: "Quattro stadi indipendenti e idempotenti.",
            layers: [
              {
                name: "Ingestion",
                description: "Scarica da API e CSV.",
                tech: ["python"],
              },
            ],
            decisions: [
              {
                choice: "ELT invece di ETL",
                why: "Le trasformazioni restano versionate in SQL.",
              },
            ],
          },
        }),
      );

      expect(result.success).toBe(true);
    });

    it("rifiuta un layer con una tecnologia sconosciuta", () => {
      const result = projectSchema.safeParse(
        validFrontmatter({
          architecture: {
            summary: "Riassunto",
            layers: [{ name: "X", description: "Y", tech: ["cobol"] }],
          },
        }),
      );

      expect(result.success).toBe(false);
    });
  });
});

/**
 * I registri sono la fonte di verita di mezzo progetto: un buco qui
 * si propaga ovunque senza che nessuno se ne accorga subito.
 */
describe("registri di configurazione", () => {
  it("ogni categoria dichiarata ha una voce con accento e ordine", () => {
    expect(PROJECT_CATEGORIES).toHaveLength(CATEGORY_SLUGS.length);

    for (const slug of CATEGORY_SLUGS) {
      const category = PROJECT_CATEGORIES.find((item) => item.slug === slug);
      expect(category, `categoria mancante: ${slug}`).toBeDefined();
    }
  });

  it("gli ordini delle categorie sono unici", () => {
    const orders = PROJECT_CATEGORIES.map((category) => category.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("ogni tecnologia ha nome, gruppo e colore esadecimale", () => {
    for (const slug of TECH_SLUGS) {
      const tech = TECH_STACK[slug];

      expect(tech.slug, `slug incoerente in ${slug}`).toBe(slug);
      expect(tech.name.length).toBeGreaterThan(0);
      expect(tech.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("i type guard riconoscono solo i valori dichiarati", () => {
    expect(isCategorySlug("full-stack")).toBe(true);
    expect(isCategorySlug("full stack")).toBe(false);

    expect(isTechSlug("nextjs")).toBe(true);
    expect(isTechSlug("next.js")).toBe(false);
  });
});
