import type { Metadata } from "next";

import { DesignSystemPreview } from "@/components/design-system/preview";

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

export default function DesignSystemPage() {
  return <DesignSystemPreview />;
}
