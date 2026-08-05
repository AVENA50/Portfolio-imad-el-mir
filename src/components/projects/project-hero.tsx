import Image from "next/image";
import Link from "next/link";

import { ProjectMetrics } from "@/components/projects/project-metrics";
import { Icon } from "@/components/shared/icon";
import { Badge, Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { getCategoryAccent } from "@/config/project-categories";
import type { Dictionary } from "@/lib/dictionary";
import { formatDateRange } from "@/lib/format";
import type { IconName, Project } from "@/types";

interface ProjectHeroProps {
  project: Project;
  locale: Locale;
  dictionary: Dictionary;
}

/** Link esterni dell'hero, nell'ordine in cui contano per chi legge. */
const LINK_ORDER = [
  { key: "live", label: "liveDemo", icon: "external", primary: true },
  { key: "repo", label: "sourceCode", icon: "github", primary: false },
  { key: "demo", label: "tryDemo", icon: "arrow-up-right", primary: false },
  { key: "docs", label: "documentation", icon: "file", primary: false },
] as const satisfies readonly {
  key: keyof Project["links"];
  label: keyof Dictionary["actions"];
  icon: IconName;
  primary: boolean;
}[];

/**
 * Hero del case study (M7-T2).
 *
 * Prima la testa, poi l'immagine: chi apre la pagina deve capire di cosa
 * si tratta senza aspettare il caricamento della cover. Per questo il
 * titolo e in cima e non sovrapposto alla foto — sopra un'immagine il
 * contrasto non e mai garantito, e servirebbe un velo scuro che spegne
 * proprio cio che si voleva mostrare.
 *
 * Le metriche galleggiano sul bordo inferiore della cover solo da lg in su.
 * Su schermi stretti scendono sotto: sovrapposte sarebbero illeggibili, e
 * un badge di vetro sopra uno screenshot compresso e solo rumore.
 */
export function ProjectHero({ project, locale, dictionary }: ProjectHeroProps) {
  const accent = getCategoryAccent(project.category);
  const metrics = project.metrics ?? [];

  const links = LINK_ORDER.filter(({ key }) => Boolean(project.links[key]));

  return (
    <section className="relative overflow-hidden pt-10 pb-16 lg:pb-24">
      <div
        className="bg-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[32rem]"
        aria-hidden
      />

      <div className="container-site relative">
        <Link
          href={localePath(locale, "/projects")}
          className="inline-flex items-center gap-2 text-sm text-ink-subtle transition-colors hover:text-ink"
        >
          <Icon name="arrow-left" className="size-4" />
          {dictionary.caseStudy.backToProjects}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Badge accent={accent} size="lg">
            {dictionary.categories[project.category]}
          </Badge>

          {project.status !== "completed" && (
            <Badge
              accent={project.status === "in-progress" ? "blue" : "violet"}
              size="lg"
              dot
            >
              {dictionary.status[project.status]}
            </Badge>
          )}

          <Badge size="lg">{dictionary.caseStudy.types[project.type]}</Badge>
        </div>

        <h1 className="mt-6 max-w-4xl text-h1">{project.title}</h1>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-muted lg:text-xl">
          {project.tagline}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-subtle">
          <span className="inline-flex items-center gap-2">
            <Icon name="clock" className="size-4" />
            {formatDateRange(project.startDate, project.endDate, locale)}
          </span>

          <span className="inline-flex items-center gap-2">
            <Icon name="file" className="size-4" />
            {dictionary.projects.readingTime.replace(
              "{n}",
              String(project.readingTime),
            )}
          </span>
        </div>

        {links.length > 0 && (
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {links.map(({ key, label, icon, primary }) => (
              <Button
                key={key}
                asChild
                size="lg"
                variant={primary ? "primary" : "secondary"}
                iconRight={icon}
              >
                <a
                  href={project.links[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dictionary.actions[label]}
                </a>
              </Button>
            ))}
          </div>
        )}

        {/* La cover e il contenitore delle metriche: `relative` sta qui
            perche i badge si posizionano rispetto all'immagine, non alla
            sezione. */}
        <div className="relative mt-14">
          <div className="glass relative aspect-[16/9] overflow-hidden rounded-panel">
            <Image
              src={project.cover.src}
              alt={project.cover.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover"
            />

            {/* Velo verso il basso: senza, i badge di vetro finirebbero
                sopra una porzione chiara dello screenshot e sparirebbero. */}
            {metrics.length > 0 && (
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 hidden h-2/3 bg-gradient-to-t from-bg via-bg/70 to-transparent lg:block"
              />
            )}
          </div>

          {metrics.length > 0 && (
            <ProjectMetrics
              metrics={metrics}
              className="mt-6 lg:absolute lg:inset-x-8 lg:bottom-8 lg:mt-0"
            />
          )}
        </div>

        {project.cover.caption && (
          <p className="mt-4 text-center text-sm text-ink-subtle">
            {project.cover.caption}
          </p>
        )}
      </div>
    </section>
  );
}
