/**
 * Punto unico di import dei tipi per tutti i componenti.
 *
 * I componenti scrivono sempre `import type { NavItem } from "@/types"`,
 * mai il percorso del singolo file: se un tipo cambia casa, si aggiorna
 * solo questo barrel.
 *
 * I tipi dei progetti (Project, ProjectMetric, ...) arrivano in M4-T6.
 */

export type { NavItem, SocialLink } from "./nav";
export type { Accent, ButtonVariant, IconName, Size } from "./ui";
