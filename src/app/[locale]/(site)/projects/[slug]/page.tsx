import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProjectArchitecture,
  ProjectFeatures,
  ProjectGallery,
  ProjectHero,
  ProjectLearnings,
  ProjectNav,
  ProjectStack,
  ProjectToc,
  ProjectVideo,
} from "@/components/projects";
import { Section, SectionHeading } from "@/components/shared";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/config/i18n";
import { extractHeadings } from "@/lib/content/headings";
import { renderMdx } from "@/lib/content/mdx";
import {
  getAdjacentProjects,
  getAllSlugs,
  getProjectBySlug,
} from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";

interface CaseStudyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Tutte le pagine progetto, pre-renderizzate a build time (M7-T1).
 *
 * Riceve il `locale` gia risolto dal segmento padre e restituisce solo gli
 * slug: Next combina i due livelli da solo. Legge i nomi dei file senza
 * compilare l'MDX — a build time il contenuto verra letto comunque, e
 * compilarlo due volte raddoppierebbe il tempo di build per niente.
 */
export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? params.locale : "it";
  return getAllSlugs(locale).map((slug) => ({ slug }));
}

/**
 * Ogni case study ha titolo, descrizione e anteprima social propri.
 *
 * `alternates.languages` dice ai motori di ricerca che /it/projects/x e
 * /en/projects/x sono lo stesso documento in due lingue: senza, le due
 * pagine competerebbero fra loro nei risultati.
 */
export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = getProjectBySlug(slug, locale);
  if (!project) return {};

  const description = project.description ?? project.tagline;
  const path = `/${locale}/projects/${slug}`;

  return {
    title: project.title,
    description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        LOCALES.map((code) => [
          LOCALE_META[code].htmlLang,
          `/${code}/projects/${slug}`,
        ]),
      ),
    },
    openGraph: {
      type: "article",
      title: project.title,
      description,
      url: path,
      locale: LOCALE_META[locale].ogLocale,
      images: [{ url: project.cover.src, alt: project.cover.alt }],
    },
  };
}

/**
 * Pagina del case study (M7-T11).
 *
 * Server component puro: legge l'MDX dal filesystem, lo compila e restituisce
 * HTML gia pronto. L'unico pezzo che arriva nel browser e la galleria, che
 * ha bisogno di stato e tastiera per il lightbox.
 *
 * Ogni sezione decide da sola se esistere: un progetto senza metriche non
 * mostra un riquadro vuoto, semplicemente non ha quella sezione. E la
 * ragione per cui quasi tutti i campi dello schema sono opzionali — i case
 * study non hanno tutti la stessa forma, e forzarli in uno stampo unico
 * significherebbe riempire di segnaposto quelli piu piccoli.
 */
export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = getProjectBySlug(slug, locale);
  if (!project) notFound();

  const dictionary = await getDictionary(locale);

  const content = await renderMdx(project.content);
  const headings = extractHeadings(project.content);
  const adjacent = getAdjacentProjects(slug, locale);

  const screenshots = project.screenshots ?? [];

  return (
    <article>
      <ProjectHero project={project} locale={locale} dictionary={dictionary} />

      {/* Panoramica: il corpo MDX con l'indice a lato.
          `minmax(0, 1fr)` e obbligatorio, non stilistico: senza, un blocco
          di codice lungo allargherebbe la colonna oltre il contenitore
          invece di scorrere al suo interno. */}
      <Section id="overview" spacing="none" className="pt-10 pb-20 lg:pt-12">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
          <div className="prose-case-study max-w-3xl">{content}</div>

          <ProjectToc
            headings={headings}
            dictionary={dictionary}
            className="order-first h-max lg:order-none"
          />
        </div>
      </Section>

      {project.features && (
        <ProjectFeatures features={project.features} dictionary={dictionary} />
      )}

      {project.architecture && (
        <ProjectArchitecture
          architecture={project.architecture}
          dictionary={dictionary}
        />
      )}

      {project.stack && (
        <ProjectStack stack={project.stack} dictionary={dictionary} />
      )}

      {project.video && (
        <Section id="video" spacing="md">
          <SectionHeading
            eyebrow={dictionary.caseStudy.videoEyebrow}
            title={dictionary.caseStudy.video}
            description={dictionary.caseStudy.videoDescription}
          />

          <div className="mt-12">
            <ProjectVideo video={project.video} dictionary={dictionary} />
          </div>
        </Section>
      )}

      {screenshots.length > 0 && (
        <Section id="gallery" spacing="md">
          <SectionHeading
            eyebrow={dictionary.caseStudy.galleryEyebrow}
            title={dictionary.caseStudy.gallery}
            description={dictionary.caseStudy.galleryHint}
          />

          <div className="mt-12">
            <ProjectGallery screenshots={screenshots} dictionary={dictionary} />
          </div>
        </Section>
      )}

      {project.learnings && (
        <ProjectLearnings
          learnings={project.learnings}
          dictionary={dictionary}
        />
      )}

      <Section spacing="md">
        <ProjectNav
          prev={adjacent.prev}
          next={adjacent.next}
          locale={locale}
          dictionary={dictionary}
        />
      </Section>
    </article>
  );
}
