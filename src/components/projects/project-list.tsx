import { Stagger } from "@/components/effects";
import { ProjectRow } from "@/components/projects/project-row";
import { EmptyState } from "@/components/shared";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectSummary } from "@/types";

interface ProjectListProps {
  projects: readonly ProjectSummary[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Vista lista dei progetti (M6-T3).
 *
 * Il passo dello stagger e piu corto di quello della griglia: le righe
 * sono impilate e si leggono in sequenza, quindi un ritardo lungo si
 * percepisce come lentezza invece che come eleganza.
 */
export function ProjectList({
  projects,
  locale,
  dictionary,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title={dictionary.projects.empty}
        description={dictionary.projects.emptyHint}
      />
    );
  }

  return (
    <Stagger step={45} className="flex flex-col gap-4">
      {projects.map((project) => (
        <ProjectRow
          key={project.slug}
          project={project}
          locale={locale}
          dictionary={dictionary}
        />
      ))}
    </Stagger>
  );
}
