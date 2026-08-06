import type { Metadata } from "next";

import { LOCALES, LOCALE_META, type Locale } from "@/config/i18n";
import { SITE } from "@/config/site";

/**
 * Composizione dei metadata di pagina (M10-T1).
 *
 * **Il problema che risolve.** Sette pagine ripetevano lo stesso blocco di
 * venti righe: canonical, `hreflang` per due lingue, Open Graph. Copiato
 * sette volte significa sette posti dove sbagliare, e soprattutto sette
 * posti da toccare per aggiungere una cosa sola — per esempio le immagini
 * social, che arrivano fra poco. Peggio: le pagine Contatti e Chi sono
 * avevano gia dimenticato l'Open Graph, e nessun controllo lo segnalava,
 * perche un metadata mancante non e un errore: e solo un link condiviso
 * che appare come un rettangolo grigio.
 *
 * Qui il blocco si scrive una volta e ogni pagina passa tre cose: la lingua,
 * il percorso e i suoi testi.
 */

interface PageMetadataOptions {
  locale: Locale;
  /**
   * Percorso **senza** prefisso di lingua, con lo slash iniziale.
   * La home e `/`. Da qui si compongono canonical e hreflang.
   */
  path: string;
  title: string;
  description: string;
  /**
   * Immagine social. Assente = quella predefinita del sito.
   * Anche questa senza dominio: `metadataBase` lo mette davanti.
   */
  image?: string;
  /** Un case study e un `article`, tutto il resto e un `website`. */
  type?: "website" | "article";
  /** Solo per gli articoli, in formato ISO. */
  publishedTime?: string;
}

/** Compone il percorso con il prefisso di lingua. `/` diventa `/it`. */
function localized(locale: Locale, path: string): string {
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
}: PageMetadataOptions): Metadata {
  const canonical = localized(locale, path);

  return {
    title,
    description,

    alternates: {
      canonical,
      /**
       * `hreflang` dice ai motori di ricerca che le due pagine sono la
       * stessa in lingue diverse, invece di contenuto duplicato. Senza,
       * Google ne sceglie una e l'altra sparisce dai risultati.
       *
       * `x-default` indica quale servire a chi non parla nessuna delle
       * due: l'italiano, che e la lingua principale del sito.
       */
      languages: {
        ...Object.fromEntries(
          LOCALES.map((code) => [
            LOCALE_META[code].htmlLang,
            localized(code, path),
          ]),
        ),
        "x-default": localized("it", path),
      },
    },

    openGraph: {
      type,
      siteName: SITE.name,
      title,
      description,
      url: canonical,
      locale: LOCALE_META[locale].ogLocale,
      // Le altre lingue disponibili: alcune piattaforme le usano per
      // servire l'anteprima nella lingua di chi guarda.
      alternateLocale: LOCALES.filter((code) => code !== locale).map(
        (code) => LOCALE_META[code].ogLocale,
      ),
      ...(image ? { images: [{ url: image }] } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },

    /**
     * `summary_large_image` e la differenza fra un'anteprima con una
     * miniatura quadrata di lato e una che occupa tutta la larghezza del
     * messaggio. Su LinkedIn e X cambia completamente quanto si nota.
     */
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Metadata per una lingua non riconosciuta.
 *
 * Le pagine chiamano `isLocale()` e poi `notFound()`, ma `generateMetadata`
 * gira **prima** che il componente possa farlo. Restituire un oggetto vuoto
 * evita di comporre URL con dentro una stringa arbitraria presa dall'URL.
 */
export const EMPTY_METADATA: Metadata = {};
