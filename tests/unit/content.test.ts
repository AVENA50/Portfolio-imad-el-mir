import { describe, expect, it } from "vitest";

import { LOCALES } from "@/config/i18n";
import {
  findTranslationMismatches,
  getAllProjects,
  getAllSlugs,
} from "@/lib/content/projects";

/**
 * Verifica dei contenuti veri.
 *
 * A differenza di projects.test.ts, che lavora su una cartella finta, questa
 * suite guarda src/content/projects. E la rete di sicurezza per chi scrive:
 * un frontmatter sbagliato o una traduzione dimenticata fanno fallire
 * `npm run check` prima del push, invece di rompere la build in produzione.
 */

describe("contenuti reali", () => {
  it.each([...LOCALES])(
    "tutti gli MDX in %s hanno un frontmatter valido",
    (locale) => {
      // getAllProjects lancia con percorso e campo se qualcosa non torna
      expect(() => getAllProjects(locale)).not.toThrow();
    },
  );

  it("ogni progetto esiste in tutte le lingue, senza campi divergenti", () => {
    const problems = findTranslationMismatches();
    expect(problems, problems.join("\n")).toEqual([]);
  });

  it("gli slug non contengono maiuscole o spazi", () => {
    for (const locale of LOCALES) {
      for (const slug of getAllSlugs(locale)) {
        expect(slug, `slug non valido: ${slug}`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it("ogni cover punta a un percorso dentro /images/projects", () => {
    for (const project of getAllProjects()) {
      expect(project.cover.src, `cover fuori posto in ${project.slug}`).toMatch(
        /^\/images\/projects\//,
      );
    }
  });
});
