import type { MetadataRoute } from "next";

import { LOCALES, LOCALE_META } from "@/config/i18n";
import { MAIN_NAV } from "@/config/navigation";
import { SITE } from "@/config/site";
import { getAllProjects } from "@/lib/content/projects";

/**
 * Sitemap generata dai contenuti veri (M10-T2).
 *
 * **Perche non un file statico.** Una sitemap scritta a mano e vera il
 * giorno in cui la scrivi. Al primo progetto aggiunto diventa incompleta,
 * al primo rinominato punta a un 404 — e nessuno se ne accorge, perche una
 * sitemap sbagliata non rompe niente: fa solo sparire pagine da Google.
 * Qui le rotte arrivano da `MAIN_NAV`, che e lo stesso array che disegna il
 * menu, e i progetti dal filesystem. Le tre cose non possono divergere.
 *
 * **`alternates.languages` su ogni voce** dice a Google che le due lingue
 * sono la stessa pagina. Senza, le vedrebbe come contenuto duplicato e ne
 * mostrerebbe una sola, decidendo lui quale — di solito non quella giusta.
 *
 * Le priorita non sono decorative: dicono al crawler cosa visitare per
 * primo quando ha tempo limitato. I case study valgono piu delle pagine di
 * elenco, perche sono il contenuto vero.
 */

/** Quanto conta ogni sezione. La home guida, i case study la seguono. */
const PRIORITY: Record<string, number> = {
  "/": 1,
  "/projects": 0.9,
  "/about": 0.8,
  "/contact": 0.8,
  "/skills": 0.7,
  "/experience": 0.7,
};

/** Le due lingue di una stessa pagina, per il blocco `alternates`. */
function languagesFor(path: string): Record<string, string> {
  return Object.fromEntries(
    LOCALES.map((locale) => [
      LOCALE_META[locale].htmlLang,
      `${SITE.url}${path === "/" ? `/${locale}` : `/${locale}${path}`}`,
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // --- pagine fisse, dalle stesse voci che compongono il menu ---
    for (const item of MAIN_NAV) {
      entries.push({
        url: `${SITE.url}${item.href === "/" ? `/${locale}` : `/${locale}${item.href}`}`,
        lastModified: new Date(),
        changeFrequency: item.href === "/projects" ? "weekly" : "monthly",
        priority: PRIORITY[item.href] ?? 0.5,
        alternates: { languages: languagesFor(item.href) },
      });
    }

    // --- un case study per progetto ---
    for (const project of getAllProjects(locale)) {
      const path = `/projects/${project.slug}`;

      entries.push({
        url: `${SITE.url}/${locale}${path}`,
        /**
         * La data di fine se il progetto e concluso, altrimenti oggi:
         * un lavoro in corso cambia, e dichiararlo fermo a due anni fa
         * dice al crawler di non tornare a guardarlo.
         *
         * Le date dei progetti sono `YYYY-MM`: il giorno lo aggiungiamo
         * qui, perche `new Date("2025-01")` e valido ma ambiguo fra i
         * fusi orari, mentre `new Date("2025-01-01")` no.
         */
        lastModified: project.endDate
          ? new Date(`${project.endDate}-01`)
          : new Date(),
        changeFrequency: project.endDate ? "yearly" : "monthly",
        // I progetti costruiti valgono piu di quelli solo annunciati.
        priority: project.status === "planned" ? 0.5 : 0.8,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
