import type { IconName } from "./ui";

/** Voce della navigazione principale e del drawer mobile. */
export interface NavItem {
  label: string;
  href: string;
  /** Sottotitolo mostrato nelle card della 404 e nel drawer mobile. */
  description?: string;
  /** Se true apre in una nuova scheda con rel="noopener noreferrer". */
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
