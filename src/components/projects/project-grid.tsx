import { Stagger } from "@/components/effects";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/shared";
import type { Locale } from "@/config/i18n";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectSummary } from "@/types";

interface ProjectGridProps {
  projects: readonly ProjectSummary[];
  locale: Locale;
  dictionary: Dictionary;
  /** Colonne su schermo largo. Due danno card grandi, tre una panoramica. */
  columns?: 2 | 3;
}

/**
 * Le colonne per larghezza di schermo.
 *
 * La terza colonna entra a `lg` (1024px) e non a `xl`: aspettare i 1280px
 * significa che su un portatile da tredici pollici — cioe la macchina su
 * cui questo sito verra aperto piu spesso — la griglia resta a due, e la
 * pagina sembra piu vuota di quanto sia.
 *
 * Sotto i 640px resta una colonna sola: due card affiancate su un telefono
 * sarebbero larghe centosessanta pixel, e la copertina diventerebbe una
 * miniatura illeggibile.
 */
const COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

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
  columns = 2,
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
    // A tre colonne lo spazio orizzontale e meno, quindi il divario parte
    // piu stretto e si allarga solo quando la larghezza lo permette.
    <Stagger step={70} className={cn("grid gap-6 xl:gap-8", COLUMNS[columns])}>
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
