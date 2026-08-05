import type { ICON_NAMES } from "@/config/icons";

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
 *
 * Non scritta a mano: deriva dalla tupla ICON_NAMES di config/icons.ts.
 * L'elenco doveva esistere anche a runtime perche lo schema zod dei case
 * study valida il nome dell'icona letto dal frontmatter — e un tipo, da
 * solo, non puo controllare un dato esterno.
 *
 * Aggiungere una voce alla tupla obbliga a implementarla nel registro dei
 * glifi, altrimenti TypeScript non compila.
 */
export type IconName = (typeof ICON_NAMES)[number];
