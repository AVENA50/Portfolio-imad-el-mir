import type { IconName } from "./ui";

/**
 * Chiave della voce di menu.
 * Coincide con le chiavi di `nav` nei dizionari: se aggiungi una voce qui
 * senza tradurla, TypeScript segnala l'errore.
 */
export type NavKey =
  | "home"
  | "about"
  | "projects"
  | "skills"
  | "experience"
  | "contact";

/**
 * Voce della navigazione principale e del drawer mobile.
 * L'etichetta non e qui: arriva dal dizionario tramite `key`.
 */
export interface NavItem {
  key: NavKey;
  /** Percorso senza prefisso di lingua: lo aggiunge `localePath()`. */
  href: string;
  external?: boolean;
}

/** Link social del footer e della pagina Contact. */
export interface SocialLink {
  label: string;
  href: string;
  icon: IconName;
  /** Testo per screen reader quando il link mostra solo l'icona. */
  srLabel: string;
}
