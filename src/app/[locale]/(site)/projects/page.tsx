import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectGrid } from "@/components/projects/project-grid";
import { Section, SectionHeading } from "@/components/shared";
import { isLocale } from "@/config/i18n";
import { getAllProjects } from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";

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
 * Pagina Progetti.
 *
 * Server component: legge gli MDX dal filesystem a build time e passa
 * l'array ai figli. Nessuna chiamata di rete, nessun caricamento nel
 * browser — la pagina arriva gia completa.
 *
 * Filtri, ordinamento e vista lista arrivano in M6-T4/T7: quelli avranno
 * bisogno di stato, e saranno gli unici pezzi client di questa pagina.
 */
export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const projects = getAllProjects(locale);

  const count =
    projects.length === 1
      ? dictionary.projects.countOne
      : dictionary.projects.count.replace("{n}", String(projects.length));

  return (
    <Section spacing="md">
      <SectionHeading
        as="h1"
        eyebrow={dictionary.projects.eyebrow}
        title={dictionary.projects.title}
        description={dictionary.projects.description}
        action={<span className="text-sm text-ink-subtle">{count}</span>}
      />

      <div className="mt-14">
        <ProjectGrid
          projects={projects}
          locale={locale}
          dictionary={dictionary}
        />
      </div>
    </Section>
  );
}
