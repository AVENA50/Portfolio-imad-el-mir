import "server-only";

import type { Locale } from "@/config/i18n";
import type itDictionary from "@/dictionaries/it.json";

/**
 * Dizionari delle stringhe di interfaccia.
 *
 * L'italiano e il riferimento: il tipo Dictionary nasce da it.json, quindi
 * se in en.json manca una chiave o ne avanza una, la build fallisce.
 * Le due lingue non possono divergere in silenzio.
 *
 * Gli import sono dinamici: nel bundle di una pagina finisce solo il
 * dizionario della lingua richiesta.
 */
export type Dictionary = typeof itDictionary;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  it: () => import("@/dictionaries/it.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
