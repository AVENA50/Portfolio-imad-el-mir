import { isLocale } from "@/config/i18n";
import { getAllSlugs, getProjectBySlug } from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

/**
 * Anteprima social di un case study (M10-T3).
 *
 * **Perche un'immagine per progetto e non la copertina.** La copertina e
 * uno screenshot dell'interfaccia: ritagliata a 1200x630 e ridotta a
 * miniatura diventa illeggibile, e chi la vede non capisce di cosa si
 * tratti. Qui compare il nome del progetto e la sua riga di sintesi, che
 * e l'informazione che serve a decidere se aprire il link.
 *
 * `generateStaticParams` le fa generare a build time invece che alla prima
 * richiesta. Conta piu del solito: chi incolla un link su LinkedIn ha una
 * manciata di secondi prima che il crawler rinunci, e generare un PNG al
 * volo puo non stare in quella finestra.
 */

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Case study";

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : "it";
  return getAllSlugs(locale).map((slug) => ({ slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = isLocale(params.locale) ? params.locale : "it";
  const project = getProjectBySlug(params.slug, locale);
  const dictionary = await getDictionary(locale);

  // Uno slug inesistente porta al 404, ma l'immagine viene chiesta lo
  // stesso: meglio l'anteprima generica che un errore.
  if (!project) {
    return renderOgImage({ title: dictionary.projects.title });
  }

  return renderOgImage({
    eyebrow: dictionary.categories[project.category],
    title: project.title,
    subtitle: project.tagline,
  });
}
