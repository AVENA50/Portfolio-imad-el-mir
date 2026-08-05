import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/shared/icon";
import { TechIcon } from "@/components/shared/tech-icon";
import { Badge, Card, CardDescription, CardTitle } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { getCategoryAccent } from "@/config/project-categories";
import { getTech } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import { formatMonthYear } from "@/lib/format";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  locale: Locale;
  dictionary: Dictionary;
  /** Le prime card sono sopra la piega: l'immagine va caricata subito. */
  priority?: boolean;
}

/** Quante tecnologie mostrare prima di riassumere le altre. */
const VISIBLE_TECH = 4;

/**
 * Card di un progetto.
 *
 * Server component: nessuno stato, nessun evento. Superficie `flat` invece
 * di `glass` perche in griglia ce ne sono otto — con la sfocatura lo scroll
 * andrebbe a scatti.
 *
 * L'intera card e cliccabile ma **il link e uno solo**, sul titolo, esteso
 * con un overlay assoluto. Mettere un <a> attorno a tutto duplicherebbe la
 * voce negli screen reader e nella navigazione da tastiera.
 */
export function ProjectCard({
  project,
  locale,
  dictionary,
  priority = false,
}: ProjectCardProps) {
  const accent = getCategoryAccent(project.category);
  const stack = project.stack ?? [];
  const visible = stack.slice(0, VISIBLE_TECH);
  const hidden = stack.length - visible.length;

  return (
    <Card
      asChild
      surface="flat"
      interactive
      padding="none"
      className="group h-full overflow-hidden"
    >
      <article>
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            priority={priority}
            quality={88}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
          />

          {/* Sfumatura verso il basso: separa immagine e testo senza una linea */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent"
          />
        </div>

        <div className="flex flex-col gap-4 p-6">
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
            <CardTitle>
              <Link
                href={localePath(locale, `/projects/${project.slug}`)}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {project.title}
              </Link>
            </CardTitle>

            <CardDescription className="mt-2 line-clamp-3">
              {project.tagline}
            </CardDescription>
          </div>

          {visible.length > 0 && (
            <ul className="mt-auto flex flex-wrap items-center gap-2">
              {visible.map((slug) => (
                <li
                  key={slug}
                  title={getTech(slug).name}
                  className="flex items-center gap-1.5 rounded-badge bg-surface-strong px-2 py-1 text-xs text-ink-muted"
                >
                  <TechIcon slug={slug} className="size-3.5" />
                  {getTech(slug).name}
                </li>
              ))}

              {hidden > 0 && (
                <li className="text-xs text-ink-subtle">+{hidden}</li>
              )}
            </ul>
          )}

          <div className="flex items-center gap-4 text-xs text-ink-subtle">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="file" className="size-3.5" />
              {dictionary.projects.readingTime.replace(
                "{n}",
                String(project.readingTime),
              )}
            </span>

            {/* z-10 tiene questi link sopra l'overlay del titolo:
                senza, il click finirebbe sempre sulla pagina del progetto */}
            {project.links.repo && (
              <a
                href={project.links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                <Icon name="github" className="size-3.5" />
                {dictionary.actions.sourceCode}
              </a>
            )}

            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                <Icon name="external" className="size-3.5" />
                {dictionary.actions.liveDemo}
              </a>
            )}
          </div>
        </div>
      </article>
    </Card>
  );
}
