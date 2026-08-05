import { isCategorySlug, type CategorySlug } from "@/config/project-categories";
import type {
  ProjectFilters,
  ProjectSort,
  ProjectSummary,
  ProjectView,
} from "@/types";

/**
 * Filtro e ordinamento dei progetti.
 *
 * Funzioni pure: prendono un array e restituiscono un array nuovo, senza
 * toccare React ne la URL. Sono qui e non dentro il componente perche cosi
 * si testano da sole (tests/unit/projects-filter.test.ts) — e perche la
 * regola "un progetto in corso viene prima di uno finito" e una decisione
 * di prodotto, non un dettaglio di rendering.
 *
 * Nessuna funzione modifica l'array ricevuto: `sort()` altera l'originale,
 * quindi si copia sempre prima. Ordinare in-place un array che arriva dalle
 * props significa cambiare i dati sotto i piedi di React.
 */

export const SORT_OPTIONS = ["newest", "oldest", "featured"] as const;
export const VIEW_OPTIONS = ["grid", "list"] as const;

export const DEFAULT_FILTERS: ProjectFilters = {
  category: "all",
  sort: "newest",
  view: "grid",
};

/** Type guard: i valori arrivano dalla URL, quindi sono `string | null`. */
export function isSort(value: string | null): value is ProjectSort {
  return value !== null && (SORT_OPTIONS as readonly string[]).includes(value);
}

export function isView(value: string | null): value is ProjectView {
  return value !== null && (VIEW_OPTIONS as readonly string[]).includes(value);
}

export function isCategoryFilter(
  value: string | null,
): value is CategorySlug | "all" {
  return value !== null && (value === "all" || isCategorySlug(value));
}

/**
 * Chiave di ordinamento temporale.
 *
 * I progetti senza data di fine sono in corso e devono stare in cima:
 * "9999" li spinge oltre qualsiasi data reale. I pianificati usano la data
 * di inizio prevista, che e l'unica che hanno.
 */
function timeKey(project: ProjectSummary): string {
  if (project.status === "in-progress") return "9999-99";
  return project.endDate ?? project.startDate;
}

export function filterByCategory(
  projects: readonly ProjectSummary[],
  category: CategorySlug | "all",
): ProjectSummary[] {
  if (category === "all") return [...projects];
  return projects.filter((project) => project.category === category);
}

export function sortProjects(
  projects: readonly ProjectSummary[],
  sort: ProjectSort,
): ProjectSummary[] {
  const copy = [...projects];

  if (sort === "featured") {
    // In evidenza per primi, nel loro ordine dichiarato; gli altri restano
    // in ordine cronologico, cosi la lista non sembra rimescolata a caso.
    return copy.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.featured && b.featured) {
        return (a.order ?? 99) - (b.order ?? 99);
      }
      return timeKey(b).localeCompare(timeKey(a));
    });
  }

  return copy.sort((a, b) =>
    sort === "newest"
      ? timeKey(b).localeCompare(timeKey(a))
      : timeKey(a).localeCompare(timeKey(b)),
  );
}

/** Filtro e ordinamento in un passaggio solo. */
export function applyFilters(
  projects: readonly ProjectSummary[],
  filters: Pick<ProjectFilters, "category" | "sort">,
): ProjectSummary[] {
  return sortProjects(
    filterByCategory(projects, filters.category),
    filters.sort,
  );
}

/**
 * Quanti progetti ci sono per categoria.
 *
 * Serve a mostrare il numero accanto a ogni filtro. Si calcola sull'elenco
 * completo e non su quello filtrato: altrimenti, scelta una categoria,
 * tutte le altre mostrerebbero zero e sembrerebbero vuote.
 */
export function countByCategory(
  projects: readonly ProjectSummary[],
): Record<string, number> {
  const counts: Record<string, number> = { all: projects.length };

  for (const project of projects) {
    counts[project.category] = (counts[project.category] ?? 0) + 1;
  }

  return counts;
}
