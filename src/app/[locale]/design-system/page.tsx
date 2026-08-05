import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignSystemPreview } from "@/components/design-system/preview";
import { Header } from "@/components/layout/header";
import { isLocale } from "@/config/i18n";
import { getDictionary } from "@/lib/dictionary";

/**
 * Anteprima del design system.
 *
 * Pagina di lavoro, non fa parte del sito pubblico: non e in MAIN_NAV,
 * non finira in sitemap e i motori di ricerca hanno istruzione di ignorarla.
 */
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

export default async function DesignSystemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} dictionary={dictionary} />
      <main className="pb-24">
        <DesignSystemPreview />
      </main>
    </>
  );
}
