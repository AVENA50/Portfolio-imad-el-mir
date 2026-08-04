import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Unisce classi condizionali risolvendo i conflitti Tailwind.
 *
 * clsx gestisce condizioni, array e oggetti; tailwind-merge decide chi vince
 * quando due utility toccano la stessa proprieta. Senza, l'ultima classe
 * scritta non e detto che vinca: dipende dall'ordine nel CSS generato.
 *
 * @example
 * cn("px-4 py-2", "px-6")                  // "py-2 px-6"
 * cn("text-ink", isMuted && "text-ink-muted")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
