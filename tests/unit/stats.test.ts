import { describe, expect, it } from "vitest";

import { primaryLanguage } from "@/lib/stats";
import type { ProjectSummary } from "@/types";

/**
 * "Python — linguaggio principale" e una frase che compare sulla pagina
 * "Chi sono", e questo test e cio che la tiene vera.
 *
 * Quello che protegge non e l'aritmetica ma la regola: si contano solo i
 * progetti costruiti, e solo le voci del registro marcate come linguaggio.
 * Senza un test, fra sei mesi qualcuno — magari io — toglie il filtro per
 * far salire un numero e nessuno se ne accorge.
 */

function project(
  slug: string,
  overrides: Partial<ProjectSummary> = {},
): ProjectSummary {
  return {
    slug,
    locale: "it",
    title: slug,
    tagline: "riga",
    category: "full-stack",
    tags: [],
    featured: false,
    status: "completed",
    type: "personal",
    startDate: "2024-01",
    endDate: "2024-06",
    links: {},
    cover: { src: "/images/projects/x/cover.webp", alt: "copertina" },
    readingTime: 1,
    ...overrides,
  };
}

describe("primaryLanguage", () => {
  it("sceglie il linguaggio piu ricorrente", () => {
    const tech = primaryLanguage([
      project("uno", { stack: ["python", "java"] }),
      project("due", { stack: ["python", "docker"] }),
    ]);

    expect(tech?.name).toBe("Python");
  });

  it("ignora cio che non e un linguaggio", () => {
    // Docker compare due volte, Java una: se il filtro sul gruppo saltasse,
    // la pagina direbbe "Docker, linguaggio principale".
    const tech = primaryLanguage([
      project("uno", { stack: ["docker", "java"] }),
      project("due", { stack: ["docker", "postgres"] }),
    ]);

    expect(tech?.name).toBe("Java");
  });

  it("non conta lo stack dei progetti pianificati", () => {
    const tech = primaryLanguage([
      project("costruito", { status: "in-progress", stack: ["python"] }),
      project("futuro-1", { status: "planned", stack: ["java"] }),
      project("futuro-2", { status: "planned", stack: ["java"] }),
    ]);

    expect(tech?.name).toBe("Python");
  });

  it("restituisce null se non c'e ancora niente di costruito", () => {
    expect(
      primaryLanguage([
        project("futuro", { status: "planned", stack: ["java"] }),
      ]),
    ).toBeNull();
  });

  it("restituisce null sui progetti senza stack dichiarato", () => {
    expect(primaryLanguage([project("senza-stack")])).toBeNull();
  });

  it("a parita di conteggio da sempre la stessa risposta", () => {
    const projects = [project("uno", { stack: ["python", "java"] })];

    const first = primaryLanguage(projects);
    const second = primaryLanguage([...projects]);

    expect(first?.slug).toBe(second?.slug);
  });
});
