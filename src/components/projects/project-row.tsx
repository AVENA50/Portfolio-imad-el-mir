import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/shared/icon";
import { TechIcon } from "@/components/shared/tech-icon";
import { Badge } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { getCategoryAccent } from "@/config/project-categories";
import { getTech } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import { formatMonthYear } from "@/lib/format";
import type { ProjectSummary } from "@/types";

interface ProjectRowProps {
  project: ProjectSummary;
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Riga di un progetto nella vista lista (M6-T3).
 *
 * Non e una card schiacciata: cambia cosa si vede. La griglia mostra
 * l'immagine grande e poco testo, la lista rovescia le proporzioni —
 * miniatura piccola, tagline per intero, stack completo. Chi passa alla
 * lista vuole confrontare i progetti leggendo, non guardando.
 *
 * Stesso schema del link della card: un solo <a>, sul titolo, esteso a
 * tutta la riga con un overlay. Avvolgere tutto in un link farebbe
 * annunciare l'intero contenuto come un unico blocco cliccabile.
 */
export function ProjectRow({ project, locale, dictionary }: ProjectRowProps) {
  const accent = getCategoryAccent(project.category);
  const stack = project.stack ?? [];

  return (
    <article className="glass-flat glow-hover group relative flex gap-5 rounded-card p-4 md:gap-6 md:p-5">
      <div className="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-badge sm:block md:w-44">
        <Image
          src={project.cover.src}
          alt=""
          fill
          quality={85}
          sizes="176px"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge accent={accent} size="sm">
            {dictionary.categories[project.category]}
          </Badge>

          {project.status !== "completed" && (
            <Badge
              accent={project.status === "in-progress" ? "blue" : "violet"}
              size="sm"
              dot
            >
              {dictionary.status[project.status]}
            </Badge>
          )}

          <span className="ml-auto text-xs text-ink-subtle">
            {formatMonthYear(project.endDate ?? project.startDate, locale)}
          </span>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-ink md:text-xl">
            <Link
              href={localePath(locale, `/projects/${project.slug}`)}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {project.title}
            </Link>
          </h3>

          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {project.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {stack.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2">
              {stack.map((slug) => (
                <li
                  key={slug}
                  title={getTech(slug).name}
                  className="flex items-center gap-1.5 rounded-badge bg-surface-strong px-2 py-1 text-xs text-ink-muted"
                >
                  <TechIcon slug={slug} className="size-3.5" />
                  {getTech(slug).name}
                </li>
              ))}
            </ul>
          )}

          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-subtle">
            <Icon name="file" className="size-3.5" />
            {dictionary.projects.readingTime.replace(
              "{n}",
              String(project.readingTime),
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
