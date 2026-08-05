import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { SkipLink } from "@/components/layout/skip-link";
import { isLocale } from "@/config/i18n";
import { getDictionary } from "@/lib/dictionary";

/**
 * Layout del route group (site).
 *
 * Le parentesi in `(site)` creano un gruppo: condivide un layout senza
 * aggiungere un segmento alla URL. La home resta /it, non /it/site.
 *
 * Qui vivono skip link, header e footer, cosi ogni pagina pubblica li
 * eredita e nessuna se li deve ricordare. Le pagine che non devono averli
 * — 404 a tutto schermo, pagine di errore — semplicemente stanno fuori
 * dal gruppo.
 */
export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <>
      <SkipLink label={dictionary.actions.skipToContent} />
      <ScrollProgress />
      <Header locale={locale} dictionary={dictionary} />

      {/* L'id e il bersaglio dello skip link. tabIndex -1 lo rende
          focalizzabile da codice senza entrare nell'ordine di tabulazione. */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <Footer locale={locale} dictionary={dictionary} />
    </>
  );
}
