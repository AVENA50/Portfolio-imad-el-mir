import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import matter from "gray-matter";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { extractHeadings } from "@/lib/content/headings";
import {
  findTranslationMismatches,
  getAdjacentProjects,
  getAllProjects,
  getAllSlugs,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectsByCategory,
} from "@/lib/content/projects";

/**
 * Il content layer si testa su una cartella finta, non su quella vera.
 *
 * Cosi i test restano stabili mentre i contenuti reali cambiano: aggiungere
 * un case study non deve far fallire una suite che parla di ordinamento.
 * Per questo tutte le funzioni accettano un `contentRoot` opzionale.
 */

let root: string;

/** Frontmatter minimo valido, come oggetto. */
function baseFrontmatter(overrides: Record<string, unknown> = {}) {
  return {
    title: "Progetto",
    tagline: "Una riga di presentazione",
    category: "full-stack",
    startDate: "2025-01",
    cover: {
      src: "/images/projects/x/cover.webp",
      alt: "Copertina",
    },
    ...overrides,
  };
}

/**
 * Scrive un MDX di prova.
 *
 * Il frontmatter viene serializzato da gray-matter invece che concatenato
 * a mano: comporre YAML con i template literal porta a chiavi duplicate e
 * righe attaccate, e il test finisce per verificare i propri bug invece
 * del codice.
 */
function writeProject(
  locale: string,
  slug: string,
  data: Record<string, unknown>,
  body = "Corpo del progetto.",
) {
  const dir = path.join(root, locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${slug}.mdx`),
    matter.stringify(body, data),
    "utf8",
  );
}

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-"));

  writeProject(
    "it",
    "arcadium",
    baseFrontmatter({
      endDate: "2025-06",
      featured: true,
      order: 1,
      stack: ["nextjs", "spring", "postgres"],
    }),
    "## Panoramica\n\nTesto.\n\n### Dettaglio\n\nAltro testo.",
  );

  writeProject(
    "it",
    "beewatch",
    baseFrontmatter({
      category: "ai-ml",
      endDate: "2024-09",
      stack: ["python", "scikit"],
    }),
  );

  // In corso: senza endDate, deve finire in cima
  writeProject("it", "chess-ai", baseFrontmatter({ category: "algorithms" }));

  writeProject(
    "en",
    "arcadium",
    baseFrontmatter({
      endDate: "2025-06",
      featured: true,
      order: 1,
      stack: ["nextjs", "spring", "postgres"],
    }),
  );
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("getAllProjects", () => {
  it("legge tutti gli MDX di una lingua", () => {
    expect(getAllProjects("it", root)).toHaveLength(3);
  });

  it("restituisce un array vuoto se la lingua non ha contenuti", () => {
    expect(getAllProjects("en", path.join(root, "vuota"))).toEqual([]);
  });

  it("mette i progetti in corso in cima, poi i piu recenti", () => {
    const slugs = getAllProjects("it", root).map((project) => project.slug);
    expect(slugs).toEqual(["chess-ai", "arcadium", "beewatch"]);
  });

  it("calcola slug, lingua e tempo di lettura", () => {
    const project = getProjectBySlug("arcadium", "it", root);

    expect(project?.slug).toBe("arcadium");
    expect(project?.locale).toBe("it");
    expect(project?.readingTime).toBeGreaterThanOrEqual(1);
  });

  it("ferma tutto se un frontmatter e invalido", () => {
    // Scritto a mano apposta: qui l'MDX rotto e il soggetto del test
    fs.writeFileSync(
      path.join(root, "it", "rotto.mdx"),
      `---\ntitle: "Senza gli altri campi"\n---\n\nCorpo.\n`,
      "utf8",
    );

    expect(() => getAllProjects("it", root)).toThrowError(/rotto\.mdx/);

    fs.rmSync(path.join(root, "it", "rotto.mdx"));
  });
});

describe("selezioni", () => {
  it("getFeaturedProjects filtra e limita", () => {
    const featured = getFeaturedProjects("it", 4, root);

    expect(featured).toHaveLength(1);
    expect(featured[0]?.slug).toBe("arcadium");
  });

  it("getProjectsByCategory filtra per categoria", () => {
    expect(getProjectsByCategory("ai-ml", "it", root)).toHaveLength(1);
    expect(getProjectsByCategory("data-bi", "it", root)).toHaveLength(0);
  });

  it("getAllSlugs non compila nulla e restituisce i nomi dei file", () => {
    expect(getAllSlugs("it", root).sort()).toEqual([
      "arcadium",
      "beewatch",
      "chess-ai",
    ]);
  });

  it("getProjectBySlug restituisce null se lo slug non esiste", () => {
    expect(getProjectBySlug("inesistente", "it", root)).toBeNull();
  });
});

describe("getAdjacentProjects", () => {
  it("trova precedente e successivo nell'ordine di lista", () => {
    const { prev, next } = getAdjacentProjects("arcadium", "it", root);

    expect(prev?.slug).toBe("chess-ai");
    expect(next?.slug).toBe("beewatch");
  });

  it("il primo non ha precedente, l'ultimo non ha successivo", () => {
    expect(getAdjacentProjects("chess-ai", "it", root).prev).toBeNull();
    expect(getAdjacentProjects("beewatch", "it", root).next).toBeNull();
  });

  it("uno slug sconosciuto non rompe la navigazione", () => {
    expect(getAdjacentProjects("boh", "it", root)).toEqual({
      prev: null,
      next: null,
    });
  });
});

describe("coerenza fra traduzioni", () => {
  it("segnala le traduzioni mancanti", () => {
    const problems = findTranslationMismatches(root);

    expect(problems.some((problem) => problem.includes("beewatch"))).toBe(true);
    expect(problems.some((problem) => problem.includes("chess-ai"))).toBe(true);
  });

  it("segnala i campi strutturali divergenti", () => {
    writeProject(
      "en",
      "beewatch",
      baseFrontmatter({
        // In italiano e ai-ml: qui divergono, e il test deve accorgersene
        category: "full-stack",
        endDate: "2024-09",
        stack: ["python", "scikit"],
      }),
    );

    const problems = findTranslationMismatches(root);
    expect(
      problems.some((problem) => problem.includes('"category" differisce')),
    ).toBe(true);

    fs.rmSync(path.join(root, "en", "beewatch.mdx"));
  });
});

describe("extractHeadings", () => {
  it("estrae titoli di secondo e terzo livello con i loro id", () => {
    const headings = extractHeadings(
      "# Titolo\n\n## Architettura del sistema\n\n### Livello dati\n",
    );

    expect(headings).toEqual([
      {
        level: 2,
        text: "Architettura del sistema",
        id: "architettura-del-sistema",
      },
      { level: 3, text: "Livello dati", id: "livello-dati" },
    ]);
  });

  it("ignora i titoli finti dentro i blocchi di codice", () => {
    const headings = extractHeadings(
      "## Vero\n\n```bash\n## non e un titolo\n```\n",
    );

    expect(headings).toHaveLength(1);
    expect(headings[0]?.text).toBe("Vero");
  });
});
