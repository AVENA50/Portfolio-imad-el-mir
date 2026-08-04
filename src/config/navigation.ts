import { DEFAULT_LOCALE, isLocale, type Locale } from "@/config/i18n";
import type { NavItem } from "@/types";

/**
 * Navigazione principale.
 *
 * Un solo array alimenta header desktop (M3-T3), drawer mobile (M3-T4),
 * card della 404 (M3-T10) e sitemap (M10-T2). Le etichette non sono qui:
 * arrivano dal dizionario tramite `key`.
 *
 * L'ordine e quello dei mockup.
 */
export const MAIN_NAV: readonly NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "skills", href: "/skills" },
  { key: "experience", href: "/experience" },
  { key: "contact", href: "/contact" },
] as const;

/**
 * Aggiunge il prefisso di lingua a un percorso interno.
 * Ogni <Link> del sito passa da qui: e l'unico punto dove il prefisso
 * viene costruito, quindi non puo esserci un link che perde la lingua.
 *
 * @example localePath("en", "/projects")  // "/en/projects"
 * @example localePath("it", "/")          // "/it"
 */
export function localePath(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/**
 * Rimuove il prefisso di lingua da un pathname.
 * @example stripLocale("/en/projects/arcadium")  // "/projects/arcadium"
 */
export function stripLocale(pathname: string): string {
  const [, maybeLocale, ...rest] = pathname.split("/");
  if (maybeLocale && isLocale(maybeLocale)) {
    return `/${rest.join("/")}`.replace(/\/$/, "") || "/";
  }
  return pathname;
}

/** Estrae la lingua dal pathname corrente, con fallback al default. */
export function localeFromPathname(pathname: string): Locale {
  const [, maybeLocale] = pathname.split("/");
  return maybeLocale && isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/**
 * Dice se una voce di menu e quella attiva, ignorando la lingua.
 *
 * La home combacia solo esattamente, le altre anche sulle sottopagine:
 * su /it/projects/arcadium resta evidenziato "Progetti".
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  const path = stripLocale(pathname);
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
