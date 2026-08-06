import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { Starfield } from "@/components/effects/starfield";
import { JsonLd } from "@/components/shared";
import { fontVariables } from "@/app/fonts";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/config/i18n";
import { SITE } from "@/config/site";
import { getDictionary } from "@/lib/dictionary";
import { personJsonLd, webSiteJsonLd } from "@/lib/json-ld";
import "@/styles/globals.css";

/**
 * Root layout dell'applicazione.
 *
 * Vive dentro [locale] e non in app/: e l'unico modo per avere
 * <html lang> corretto, perche il layout di primo livello non riceve params.
 *
 * **Il sito ha un tema solo, scuro** (decisione di M3-T8). Per questo qui non
 * c'e un provider del tema: senza un tema alternativo, next-themes avrebbe
 * aggiunto una dipendenza e uno script inline eseguito prima del paint per
 * scegliere fra un'opzione sola.
 *
 * Il tema si dichiara in due punti e basta: `colorScheme: "dark"` nel
 * viewport, che dice al browser di disegnare scure anche le parti che non
 * controlliamo — scrollbar di sistema, campi di input nativi, menu a
 * tendina — e `color-scheme: dark` su <html> in globals.css.
 *
 * Se un domani servisse il tema chiaro: i valori stanno tutti in tokens.css,
 * si aggiunge un blocco `.light` e si rimette un provider. Il lavoro vero
 * non e il provider, sono i colori scritti a mano nei componenti che oggi
 * danno per scontato il fondo scuro.
 */

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/** Pre-renderizza entrambe le lingue a build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};

  const locale: Locale = raw;
  const dictionary = await getDictionary(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: dictionary.meta.title,
      template: `%s | ${SITE.name}`,
    },
    description: dictionary.meta.description,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    alternates: {
      canonical: `/${locale}`,
      // hreflang: dice a Google che le due pagine sono la stessa in due lingue
      languages: Object.fromEntries(
        LOCALES.map((code) => [LOCALE_META[code].htmlLang, `/${code}`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      url: `/${locale}`,
      locale: LOCALE_META[locale].ogLocale,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#05060d",
  colorScheme: "dark",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={fontVariables}>
      <body className="bg-bg text-ink antialiased">
        {/* Dati strutturati (M10-T4). Stanno nel layout e non nelle pagine
            perche descrivono il sito e il suo autore, non un contenuto
            specifico: ripeterli pagina per pagina significherebbe otto
            copie della stessa dichiarazione. I progetti aggiungono il
            proprio `CreativeWork` nella loro pagina, e schema.org li
            collega tramite `@id`. */}
        <JsonLd data={[personJsonLd(locale), webSiteJsonLd(locale)]} />

        {/* Sfondo stellato, fisso dietro a tutto. z-index negativo: sta sopra
            il colore del body ma sotto qualsiasi contenuto. */}
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
          <Starfield />
        </div>

        {children}
      </body>
    </html>
  );
}
