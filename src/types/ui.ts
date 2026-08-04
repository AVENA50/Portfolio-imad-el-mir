/**
 * Tipi trasversali dell'interfaccia.
 *
 * Sono unioni di stringhe letterali, non `string`: un refuso come "githbu"
 * diventa un errore rosso mentre scrivi, non un'icona mancante scoperta
 * in produzione.
 */

/** Accenti di colore. Uno per categoria di progetto, piu il verde di stato. */
export type Accent = "violet" | "blue" | "indigo" | "cyan" | "green";

/** Varianti del componente Button (M2-T1). */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Dimensioni condivise da Button, Badge e Input. */
export type Size = "sm" | "md" | "lg";

/**
 * Icone disponibili nel sito.
 * Aggiungere una voce qui obbliga a implementarla nel registro delle icone,
 * altrimenti TypeScript non compila.
 */
export type IconName =
  | "arrow-right"
  | "arrow-left"
  | "arrow-up-right"
  | "chevron-down"
  | "close"
  | "menu"
  | "download"
  | "external"
  | "github"
  | "linkedin"
  | "mail"
  | "file"
  | "home"
  | "grid"
  | "list"
  | "search"
  | "sun"
  | "moon";
