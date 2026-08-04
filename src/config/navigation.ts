import type { NavItem } from "@/types";

/**
 * Navigazione principale.
 *
 * Un solo array alimenta header desktop (M3-T3), drawer mobile (M3-T4),
 * card della pagina 404 (M3-T10) e sitemap (M10-T2). Aggiungere una pagina
 * significa aggiungere una riga qui.
 *
 * L'ordine e quello dei mockup.
 */
export const MAIN_NAV: readonly NavItem[] = [
  { label: "Home", href: "/", description: "Panoramica" },
  { label: "About", href: "/about", description: "Chi sono" },
  { label: "Projects", href: "/projects", description: "Cosa ho costruito" },
  { label: "Skills", href: "/skills", description: "Il mio stack" },
  { label: "Experience", href: "/experience", description: "Il percorso" },
  { label: "Contact", href: "/contact", description: "Scrivimi" },
] as const;

/**
 * Dice se una voce di menu e quella attiva.
 *
 * La home combacia solo esattamente, le altre anche sulle sottopagine:
 * su /projects/arcadium resta evidenziato "Projects".
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
