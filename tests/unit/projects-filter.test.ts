import { describe, expect, it } from "vitest";

import {
  applyFilters,
  countByCategory,
  filterByCategory,
  isCategoryFilter,
  isSort,
  isView,
  sortProjects,
} from "@/lib/projects-filter";
import type { ProjectSummary } from "@/types";

/**
 * Filtro e ordinamento sono funzioni pure, quindi si testano senza React,
 * senza DOM e senza URL. E il motivo per cui vivono in lib/ e non dentro
 * il componente: la regola "un progetto in corso viene prima di uno finito"
 * e una decisione di prodotto, e va protetta da un test.
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

const PROJECTS: ProjectSummary[] = [
  project("vecchio", { endDate: "2023-01" }),
  project("recente", { endDate: "2025-06" }),
  project("in-corso", { status: "in-progress", endDate: undefined }),
  project("ai", { category: "ai-ml", endDate: "2024-03" }),
  project("scelto", {
    featured: true,
    order: 1,
    category: "algorithms",
    endDate: "2022-01",
  }),
];

describe("filterByCategory", () => {
  it("con 'all' restituisce tutto", () => {
    expect(filterByCategory(PROJECTS, "all")).toHaveLength(PROJECTS.length);
  });

  it("filtra sulla categoria richiesta", () => {
    const result = filterByCategory(PROJECTS, "ai-ml");

    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("ai");
  });

  it("non modifica l'array ricevuto", () => {
    const original = [...PROJECTS];
    filterByCategory(PROJECTS, "ai-ml");

    expect(PROJECTS).toEqual(original);
  });
});

describe("sortProjects", () => {
  it("mette i progetti in corso in cima con 'newest'", () => {
    expect(sortProjects(PROJECTS, "newest")[0]?.slug).toBe("in-corso");
  });

  it("ordina dal piu recente al piu vecchio", () => {
    const slugs = sortProjects(PROJECTS, "newest").map((p) => p.slug);

    expect(slugs).toEqual(["in-corso", "recente", "ai", "vecchio", "scelto"]);
  });

  it("'oldest' e l'esatto contrario", () => {
    const newest = sortProjects(PROJECTS, "newest").map((p) => p.slug);
    const oldest = sortProjects(PROJECTS, "oldest").map((p) => p.slug);

    expect(oldest).toEqual([...newest].reverse());
  });

  it("'featured' porta in cima i progetti in evidenza", () => {
    const result = sortProjects(PROJECTS, "featured");

    expect(result[0]?.slug).toBe("scelto");
    // Gli altri restano in ordine cronologico, non rimescolati
    expect(result.slice(1).map((p) => p.slug)).toEqual([
      "in-corso",
      "recente",
      "ai",
      "vecchio",
    ]);
  });

  it("non ordina in-place l'array ricevuto", () => {
    const original = PROJECTS.map((p) => p.slug);
    sortProjects(PROJECTS, "oldest");

    expect(PROJECTS.map((p) => p.slug)).toEqual(original);
  });
});

describe("applyFilters", () => {
  it("filtra e poi ordina", () => {
    const result = applyFilters(PROJECTS, {
      category: "full-stack",
      sort: "newest",
    });

    expect(result.map((p) => p.slug)).toEqual([
      "in-corso",
      "recente",
      "vecchio",
    ]);
  });
});

describe("countByCategory", () => {
  it("conta per categoria e tiene il totale sotto 'all'", () => {
    const counts = countByCategory(PROJECTS);

    expect(counts.all).toBe(5);
    expect(counts["full-stack"]).toBe(3);
    expect(counts["ai-ml"]).toBe(1);
    expect(counts["data-bi"]).toBeUndefined();
  });
});

describe("type guard sui valori della URL", () => {
  it("accetta solo i valori dichiarati", () => {
    expect(isSort("newest")).toBe(true);
    expect(isSort("a-caso")).toBe(false);
    expect(isSort(null)).toBe(false);

    expect(isView("list")).toBe(true);
    expect(isView("tabella")).toBe(false);

    expect(isCategoryFilter("all")).toBe(true);
    expect(isCategoryFilter("ai-ml")).toBe(true);
    expect(isCategoryFilter("inventata")).toBe(false);
  });
});
