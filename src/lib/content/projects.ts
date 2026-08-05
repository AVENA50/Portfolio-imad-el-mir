import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/config/i18n";
import type { CategorySlug } from "@/config/project-categories";
import { SHARED_FIELDS, projectSchema } from "@/lib/content/schema";
import type { AdjacentProjects, Project } from "@/types";

/**
 * Lettura dei progetti dal filesystem.
 *
 * I contenuti stanno in src/content/projects/<lingua>/<slug>.mdx e vengono
 * letti solo a build time: nessuna di queste funzioni finisce nel browser.
 *
 * Il principio: **un frontmatter non valido ferma la build**. Non si prova
 * a indovinare, non si salta il file in silenzio. L'errore riporta il
 * percorso e il campo sbagliato, perche il momento giusto per accorgersene
 * e adesso, non quando la pagina e online.
 */

const CONTENT_ROOT = path.join(process.cwd(), "src/content/projects");

/** Parole al minuto per la stima dei tempi di lettura. */
const WORDS_PER_MINUTE = 200;

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function localeDir(locale: Locale, root = CONTENT_ROOT): string {
  return path.join(root, locale);
}

/**
 * Legge e valida un singolo file.
 * @throws se il frontmatter non rispetta lo schema
 */
function readProjectFile(filePath: string, locale: Locale): Project {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const parsed = projectSchema.safeParse(data);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(
        (issue) =>
          `  - ${issue.path.join(".") || "(radice)"}: ${issue.message}`,
      )
      .join("\n");

    throw new Error(
      `Frontmatter non valido in ${path.relative(process.cwd(), filePath)}:\n${issues}`,
    );
  }

  return {
    ...parsed.data,
    slug: path.basename(filePath, ".mdx"),
    locale,
    content,
    readingTime: estimateReadingTime(content),
  };
}

/**
 * Tutti i progetti di una lingua, dal piu recente al piu vecchio.
 *
 * @param contentRoot cartella alternativa, usata solo dai test
 */
export function getAllProjects(
  locale: Locale = DEFAULT_LOCALE,
  contentRoot = CONTENT_ROOT,
): Project[] {
  const dir = localeDir(locale, contentRoot);

  // Cartella assente = nessun progetto. Durante lo sviluppo e normale.
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readProjectFile(path.join(dir, file), locale))
    .sort((a, b) => {
      // I progetti senza data di fine sono in corso: vanno in cima
      const left = a.endDate ?? "9999-99";
      const right = b.endDate ?? "9999-99";
      return right.localeCompare(left);
    });
}

export function getProjectBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
  contentRoot = CONTENT_ROOT,
): Project | null {
  return (
    getAllProjects(locale, contentRoot).find(
      (project) => project.slug === slug,
    ) ?? null
  );
}

/** Progetti in evidenza per la home, in ordine di `order` se presente. */
export function getFeaturedProjects(
  locale: Locale = DEFAULT_LOCALE,
  limit = 4,
  contentRoot = CONTENT_ROOT,
): Project[] {
  return getAllProjects(locale, contentRoot)
    .filter((project) => project.featured)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
    .slice(0, limit);
}

export function getProjectsByCategory(
  category: CategorySlug,
  locale: Locale = DEFAULT_LOCALE,
  contentRoot = CONTENT_ROOT,
): Project[] {
  return getAllProjects(locale, contentRoot).filter(
    (project) => project.category === category,
  );
}

/** Progetto precedente e successivo, per la navigazione del case study. */
export function getAdjacentProjects(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
  contentRoot = CONTENT_ROOT,
): AdjacentProjects {
  const all = getAllProjects(locale, contentRoot);
  const index = all.findIndex((project) => project.slug === slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
  };
}

/**
 * Tutti gli slug di una lingua, per generateStaticParams.
 * Non compila l'MDX: legge solo i nomi dei file.
 */
export function getAllSlugs(
  locale: Locale = DEFAULT_LOCALE,
  contentRoot = CONTENT_ROOT,
): string[] {
  const dir = localeDir(locale, contentRoot);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => path.basename(file, ".mdx"));
}

/**
 * Verifica che le traduzioni non siano divergenti.
 *
 * Un progetto esiste in due file, uno per lingua. Titolo e testi possono
 * differire — e il senso della traduzione — ma categoria, stack e date no:
 * se divergono, la pagina italiana e quella inglese diventano due progetti
 * diversi con lo stesso indirizzo.
 *
 * Restituisce l'elenco dei problemi trovati, vuoto se e tutto coerente.
 * Chiamata dai test (M5-T3) e dalla CI (M10-T9).
 */
export function findTranslationMismatches(
  contentRoot = CONTENT_ROOT,
): string[] {
  const problems: string[] = [];
  const [reference, ...others] = LOCALES;
  if (!reference) return problems;

  const referenceProjects = getAllProjects(reference, contentRoot);

  for (const locale of others) {
    const slugs = new Set(getAllSlugs(locale, contentRoot));

    for (const project of referenceProjects) {
      if (!slugs.has(project.slug)) {
        problems.push(
          `Manca la traduzione ${locale} di "${project.slug}" (atteso: ${locale}/${project.slug}.mdx)`,
        );
        continue;
      }

      const translated = getProjectBySlug(project.slug, locale, contentRoot);
      if (!translated) continue;

      for (const field of SHARED_FIELDS) {
        const a = JSON.stringify(project[field]);
        const b = JSON.stringify(translated[field]);

        if (a !== b) {
          problems.push(
            `"${project.slug}": il campo "${field}" differisce fra ${reference} (${a}) e ${locale} (${b})`,
          );
        }
      }
    }

    // Traduzioni orfane: esistono in una lingua ma non nella riferimento
    const referenceSlugs = new Set(referenceProjects.map((p) => p.slug));
    for (const slug of slugs) {
      if (!referenceSlugs.has(slug)) {
        problems.push(
          `"${slug}" esiste in ${locale} ma non in ${reference}: e una pagina orfana`,
        );
      }
    }
  }

  return problems;
}
