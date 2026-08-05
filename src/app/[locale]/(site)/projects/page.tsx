import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectsBrowser } from "@/components/projects/projects-browser";
import { Section, SectionHeading } from "@/components/shared";
import { isLocale } from "@/config/i18n";
import { getAllProjects } from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";
import type { ProjectSummary } from "@/types";

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.projects.title,
    description: dictionary.projects.description,
  };
}

/**
 * Pagina Progetti (M6-T8).
 *
 * Componente server: legge gli MDX dal filesystem a build time. Filtri,
 * ordinamento e vista vivono in ProjectsBrowser, l'unico pezzo client.
 *
 * Il corpo MDX viene tolto prima di passare i progetti al browser. Tutto
 * cio che attraversa il confine server/client finisce nel payload della
 * pagina, e il testo integrale di otto case study e peso che nessuno
 * legge: per filtrare servono titolo, categoria, date e stack.
 *
 * Il Suspense attorno al browser e obbligatorio, non prudenza: dentro c'e
 * `useSearchParams`, e senza un confine di sospensione Next rinuncia a
 * generare la pagina staticamente e la rende dinamica a ogni richiesta.
 */
export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  const projects: ProjectSummary[] = getAllProjects(locale).map(
    ({ content: _content, ...summary }) => summary,
  );

  return (
    <Section spacing="md">
      <SectionHeading
        as="h1"
        eyebrow={dictionary.projects.eyebrow}
        title={dictionary.projects.title}
        description={dictionary.projects.description}
      />

      <div className="mt-14">
        <Suspense fallback={<ProjectsSkeleton />}>
          <ProjectsBrowser
            projects={projects}
            locale={locale}
            dictionary={dictionary}
          />
        </Suspense>
      </div>
    </Section>
  );
}

/** Ingombro dei filtri e di sei card, per non far saltare la pagina. */
function ProjectsSkeleton() {
  return (
    <div aria-hidden className="animate-pulse">
      <div className="h-12 w-full max-w-xl rounded-pill bg-surface" />

      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="rounded-card bg-surface">
            <div className="aspect-[16/9] rounded-t-card bg-surface-hover" />
            <div className="space-y-3 p-6">
              <div className="h-4 w-24 rounded-pill bg-surface-strong" />
              <div className="h-6 w-3/4 rounded-pill bg-surface-strong" />
              <div className="h-4 w-full rounded-pill bg-surface-hover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
