import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignSystemPreview } from "@/components/design-system/preview";

/**
 * Anteprima del design system.
 *
 * Pagina di lavoro, non fa parte del sito pubblico: non e in MAIN_NAV, non
 * finisce in sitemap e `robots.txt` la esclude.
 *
 * **Ma escluderla dai motori di ricerca non basta** (M10-T7). `robots.txt`
 * e una richiesta, non una serratura: chi indovina l'indirizzo la apre
 * comunque, e quello che vedrebbe e un catalogo di bottoni e colori — cioe
 * il retrobottega, su un sito che dovrebbe mostrare lavoro finito.
 *
 * In produzione risponde 404. In sviluppo resta dov'era, perche li serve.
 *
 * **Quello che questa guardia non fa**, e vale la pena scriverlo perche e
 * facile crederci: non toglie il componente dal bundle. L'import e statico,
 * quindi il codice viene compilato lo stesso e la build continua a
 * elencare la rotta. La differenza e che nessuno scarica quel pezzo, perche
 * per arrivarci bisognerebbe aprire una pagina che risponde 404.
 *
 * Per eliminarlo davvero servirebbe un import dinamico, e non ne vale il
 * prezzo: sono cinque kilobyte che nessun visitatore chiedera mai.
 */
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <DesignSystemPreview />;
}
