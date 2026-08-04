/**
 * Lingue del sito.
 *
 * Definite qui e solo qui: routing, middleware, dizionari, sitemap e
 * formattazione delle date leggono tutti da questo file. Aggiungere una
 * lingua significa aggiungere una voce a LOCALES e un dizionario.
 *
 * L'italiano e la lingua di default: vive su / senza prefisso.
 * L'inglese vive su /en.
 */

export const LOCALES = ["it", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "it";

/** Etichette dello switcher di lingua e attributi lang/hreflang. */
export const LOCALE_META: Record<
  Locale,
  { label: string; shortLabel: string; htmlLang: string; ogLocale: string }
> = {
  it: {
    label: "Italiano",
    shortLabel: "IT",
    htmlLang: "it-IT",
    ogLocale: "it_IT",
  },
  en: {
    label: "English",
    shortLabel: "EN",
    htmlLang: "en-US",
    ogLocale: "en_US",
  },
};

/** Type guard: il locale arriva dalla URL, quindi e `string`. */
export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Il locale se valido, altrimenti quello di default. Non lancia mai. */
export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
