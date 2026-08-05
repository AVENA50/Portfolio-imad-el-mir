/**
 * Punto unico di import dei tipi per tutti i componenti.
 *
 * I componenti scrivono sempre `import type { Project } from "@/types"`,
 * mai il percorso del singolo file: se un tipo cambia casa, si aggiorna
 * solo questo barrel.
 */

export type {
  AdjacentProjects,
  ArchitectureDecision,
  ArchitectureLayer,
  CategorySlug,
  Project,
  ProjectArchitecture,
  ProjectFeature,
  ProjectFilters,
  ProjectImage,
  ProjectLearning,
  ProjectLinks,
  ProjectMetric,
  ProjectScreenshot,
  ProjectSort,
  ProjectStatus,
  ProjectSummary,
  ProjectType,
  ProjectVideo,
  ProjectView,
  TechSlug,
} from "./project";

export type { NavItem, NavKey, SocialLink } from "./nav";
export type { Accent, ButtonVariant, IconName, Size } from "./ui";
