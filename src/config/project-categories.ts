import type { Accent } from "@/types/ui";

/**
 * Categorie dei progetti.
 *
 * `as const` rende CATEGORY_SLUGS una tupla di literal: da li nasce il tipo
 * CategorySlug, che lo schema zod riutilizza. Aggiungere una categoria
 * significa toccare una riga sola — tipo, enum zod, filtri della pagina
 * Progetti e badge delle card si aggiornano da soli.
 *
 * Le etichette non sono qui: essendo bilingue, arrivano dai dizionari
 * tramite lo slug (dictionary.categories[slug]).
 */
export const CATEGORY_SLUGS = [
  "algorithms",
  "data-bi",
  "full-stack",
  "ai-ml",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface ProjectCategory {
  slug: CategorySlug;
  accent: Accent;
  /** Ordine nei filtri della pagina Progetti. */
  order: number;
}

export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  { slug: "full-stack", accent: "indigo", order: 1 },
  { slug: "ai-ml", accent: "cyan", order: 2 },
  { slug: "algorithms", accent: "violet", order: 3 },
  { slug: "data-bi", accent: "blue", order: 4 },
];

export function getCategory(slug: string): ProjectCategory | null {
  return PROJECT_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

/** Type guard: la categoria arriva dalla URL (?category=...), quindi e string. */
export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

/** Accento di una categoria, con ripiego neutro se lo slug e ignoto. */
export function getCategoryAccent(slug: string): Accent {
  return getCategory(slug)?.accent ?? "violet";
}
