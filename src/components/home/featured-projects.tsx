import Image from "next/image";
import Link from "next/link";

import { GlowBorder, Reveal, Stagger } from "@/components/effects";
import { ProjectCard } from "@/components/projects/project-card";
import { Section, SectionHeading } from "@/components/shared";
import { TechIcon } from "@/components/shared/tech-icon";
import { Badge, Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { getCategoryAccent } from "@/config/project-categories";
import { getTech } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import { formatDateRange } from "@/lib/format";
import type { Project } from "@/types";

interface FeaturedProjectsProps {
  projects: readonly Project[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Card grande del primo progetto in evidenza.
 *
 * Layout orizzontale: immagine a sinistra, contenuto a destra. Diverso
 * dalle card della griglia di proposito — un progetto messo in cima deve
 * sembrare scelto, non il primo di un elenco.
 */
function FeaturedHero({
  project,
  locale,
  dictionary,
}: {
  project: Project;
  locale: Locale;
  dictionary: Dictionary;
}) {
  const accent = getCategoryAccent(project.category);
  const stack = project.stack ?? [];

  return (
    /* La cornice in gradiente sta solo qui, sul progetto in evidenza: e il
       modo per dire "questo fra tutti". Se la mettessimo anche sulle card
       della griglia non indicherebbe piu niente. */
    <GlowBorder
      asChild
      tone="violet"
      className="group grid overflow-hidden rounded-panel lg:grid-cols-[1.1fr_1fr]"
    >
      <article className="glass-flat">
        <div className="relative min-h-[18rem] overflow-hidden lg:min-h-[26rem]">
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
          />
          {/* Sfumatura verso il contenuto: su desktop da destra, su mobile dal basso */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-surface to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[color:var(--color-surface)]"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge accent={accent}>
              {dictionary.categories[project.category]}
            </Badge>

            {project.status !== "completed" && (
              <Badge
                accent={project.status === "in-progress" ? "blue" : "violet"}
                dot
              >
                {dictionary.status[project.status]}
              </Badge>
            )}

            <span className="text-sm text-ink-subtle">
              {formatDateRange(project.startDate, project.endDate, locale)}
            </span>
          </div>

          <div>
            <h3 className="font-display text-h2 font-bold">
              <Link
                href={localePath(locale, `/projects/${project.slug}`)}
                className="after:absolute after:inset-0 after:content-['']"
              >
                {project.title}
              </Link>
            </h3>

            <p className="mt-4 text-lg leading-relaxed text-ink-muted">
              {project.tagline}
            </p>
          </div>

          {stack.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2">
              {stack.map((slug) => (
                <li
                  key={slug}
                  className="flex items-center gap-2 rounded-badge bg-surface-strong px-3 py-1.5 text-sm text-ink-muted"
                >
                  <TechIcon slug={slug} className="size-4" />
                  {getTech(slug).name}
                </li>
              ))}
            </ul>
          )}

          <span className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-violet-300">
            {dictionary.featured.readCase}
            <span
              aria-hidden
              className="transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </span>
        </div>
      </article>
    </GlowBorder>
  );
}

/**
 * Sezione "Progetti in evidenza" della home.
 *
 * Legge i progetti con `featured: true` dal content layer: la selezione si
 * cambia da un frontmatter, non da questo file. Il primo prende la card
 * grande, gli altri vanno in griglia sotto.
 *
 * Se non ci sono progetti in evidenza la sezione **non viene renderizzata**
 * invece di mostrare uno stato vuoto: nella home un buco e peggio di
 * un'assenza.
 */
export function FeaturedProjects({
  projects,
  locale,
  dictionary,
}: FeaturedProjectsProps) {
  if (projects.length === 0) return null;

  const [first, ...rest] = projects;
  if (!first) return null;

  return (
    <Section tone="subtle" spacing="lg">
      <SectionHeading
        eyebrow={dictionary.featured.eyebrow}
        title={dictionary.featured.title}
        description={dictionary.featured.description}
        action={
          <Button asChild variant="secondary" iconRight="arrow-right">
            <Link href={localePath(locale, "/projects")}>
              {dictionary.featured.cta}
            </Link>
          </Button>
        }
      />

      <div className="mt-14 space-y-8">
        <Reveal direction="up">
          <FeaturedHero
            project={first}
            locale={locale}
            dictionary={dictionary}
          />
        </Reveal>

        {rest.length > 0 && (
          <Stagger
            step={80}
            className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
          >
            {rest.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
                dictionary={dictionary}
              />
            ))}
          </Stagger>
        )}
      </div>
    </Section>
  );
}
