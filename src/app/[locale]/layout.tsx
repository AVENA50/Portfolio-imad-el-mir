import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { Starfield } from "@/components/effects/starfield";
import { fontVariables } from "@/app/fonts";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/config/i18n";
import { SITE } from "@/config/site";
import { getDictionary } from "@/lib/dictionary";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

/**
 * Root layout dell'applicazione.
 *
 * Vive dentro [locale] e non in app/: e l'unico modo per avere
 * <html lang> corretto, perche il layout di primo livello non riceve params.
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
    // suppressHydrationWarning e richiesto da next-themes: lo script inline
    // modifica la classe di <html> prima dell'idratazione.
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={fontVariables}
      suppressHydrationWarning
    >
      <body className="bg-bg text-ink antialiased">
        {/* Sfondo stellato, fisso dietro a tutto. z-index negativo: sta sopra
            il colore del body ma sotto qualsiasi contenuto. */}
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
          <Starfield />
        </div>

        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
