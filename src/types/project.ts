import type { CategorySlug } from "@/config/project-categories";
import type { TechSlug } from "@/config/tech-stack";
import type { Locale } from "@/config/i18n";
import type { ProjectFrontmatter } from "@/lib/content/schema";

/**
 * Tipi dei progetti.
 *
 * Nessuno di questi tipi e scritto a mano: derivano tutti dallo schema zod.
 * Cambiare un campo nello schema fa diventare rossi tutti i componenti che
 * usavano il campo vecchio — che e esattamente cio che serve.
 */

/** Il progetto completo, come lo usano i componenti. */
export interface Project extends ProjectFrontmatter {
  slug: string;
  locale: Locale;
  /** Corpo MDX grezzo, compilato dal content layer (M5-T1). */
  content: string;
  /** Minuti di lettura stimati sul corpo. */
  readingTime: number;
}

export type ProjectStatus = ProjectFrontmatter["status"];
export type ProjectType = ProjectFrontmatter["type"];
export type ProjectLinks = ProjectFrontmatter["links"];

/**
 * Estrarre il tipo dell'elemento con `NonNullable<...>[number]` significa
 * che ogni componente riceve esattamente il tipo del suo pezzo:
 *
 *   function MetricBadge({ metric }: { metric: ProjectMetric }) { ... }
 */
export type ProjectMetric = NonNullable<ProjectFrontmatter["metrics"]>[number];
export type ProjectFeature = NonNullable<
  ProjectFrontmatter["features"]
>[number];
export type ProjectLearning = NonNullable<
  ProjectFrontmatter["learnings"]
>[number];
export type ProjectScreenshot = NonNullable<
  ProjectFrontmatter["screenshots"]
>[number];
export type ProjectVideo = NonNullable<ProjectFrontmatter["video"]>;
export type ProjectImage = ProjectFrontmatter["cover"];

export type ProjectArchitecture = NonNullable<
  ProjectFrontmatter["architecture"]
>;
export type ArchitectureLayer = NonNullable<
  ProjectArchitecture["layers"]
>[number];
export type ArchitectureDecision = NonNullable<
  ProjectArchitecture["decisions"]
>[number];

/** Ordinamenti disponibili nella pagina Progetti. */
export type ProjectSort = "newest" | "oldest" | "featured";
export type ProjectView = "grid" | "list";

/** Stato dei filtri, sincronizzato con la URL (M6-T4). */
export interface ProjectFilters {
  category: CategorySlug | "all";
  sort: ProjectSort;
  view: ProjectView;
}

/** Coppia di progetti adiacenti, per la navigazione prev/next (M7-T10). */
export interface AdjacentProjects {
  prev: Project | null;
  next: Project | null;
}

export type { CategorySlug, TechSlug };
