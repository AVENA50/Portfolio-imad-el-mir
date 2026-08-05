import { Stagger } from "@/components/effects";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/shared";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/dictionary";
import type { Project } from "@/types";

interface ProjectGridProps {
  projects: readonly Project[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Griglia dei progetti.
 *
 * Le prime tre card ricevono `priority`: sono sopra la piega, e caricare
 * la loro cover subito migliora il Largest Contentful Paint. Le altre
 * restano pigre, altrimenti otto immagini partirebbero insieme e la prima
 * arriverebbe piu tardi.
 */
export function ProjectGrid({
  projects,
  locale,
  dictionary,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title={dictionary.projects.empty}
        description={dictionary.projects.emptyHint}
      />
    );
  }

  return (
    <Stagger step={70} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          project={project}
          locale={locale}
          dictionary={dictionary}
          priority={index < 3}
        />
      ))}
    </Stagger>
  );
}
