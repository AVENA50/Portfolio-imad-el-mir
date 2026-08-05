import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/shared/icon";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { AdjacentProjects, Project } from "@/types";

interface ProjectNavProps extends AdjacentProjects {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Card di un progetto adiacente.
 *
 * La direzione decide tutto: la freccia, il lato da cui parte l'animazione
 * e l'allineamento del testo. Il precedente e ancorato a sinistra, il
 * successivo a destra — cosi la coppia si legge come una barra di
 * navigazione anche quando ce n'e uno solo.
 */
function AdjacentCard({
  project,
  direction,
  label,
  locale,
}: {
  project: Project;
  direction: "prev" | "next";
  label: string;
  locale: Locale;
}) {
  const isPrev = direction === "prev";

  return (
    <Link
      href={localePath(locale, `/projects/${project.slug}`)}
      className={cn(
        "glass-flat group relative flex items-center gap-5 overflow-hidden rounded-card p-5 transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 md:p-6",
        // Il successivo si specchia: immagine a destra, testo allineato a destra
        !isPrev && "flex-row-reverse text-right",
      )}
    >
      <div className="relative hidden aspect-square w-20 shrink-0 overflow-hidden rounded-badge sm:block">
        <Image
          src={project.cover.src}
          alt=""
          fill
          sizes="80px"
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-subtle uppercase",
            !isPrev && "justify-end",
          )}
        >
          {isPrev && <Icon name="arrow-left" className="size-3.5" />}
          {label}
          {!isPrev && <Icon name="arrow-right" className="size-3.5" />}
        </p>

        <p className="mt-2 truncate font-display text-lg font-bold text-ink">
          {project.title}
        </p>

        <p className="mt-1 truncate text-sm text-ink-muted">
          {project.tagline}
        </p>
      </div>
    </Link>
  );
}

/**
 * Navigazione fra case study (M7-T10).
 *
 * L'ordine e lo stesso della pagina Progetti: chi arriva qui da quella
 * lista trova il "successivo" che si aspetta, non un ordine inventato per
 * questa sezione.
 *
 * Con un solo vicino la griglia resta a due colonne e la card occupa il
 * lato giusto: il precedente a sinistra, il successivo a destra. Centrarla
 * farebbe perdere l'informazione di direzione, che e tutto cio che questa
 * navigazione comunica.
 */
export function ProjectNav({
  prev,
  next,
  locale,
  dictionary,
}: ProjectNavProps) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label={dictionary.projects.title}
      className="grid gap-6 border-t border-border pt-12 md:grid-cols-2"
    >
      {prev ? (
        <AdjacentCard
          project={prev}
          direction="prev"
          label={dictionary.caseStudy.prev}
          locale={locale}
        />
      ) : (
        <div aria-hidden className="hidden md:block" />
      )}

      {next && (
        <AdjacentCard
          project={next}
          direction="next"
          label={dictionary.caseStudy.next}
          locale={locale}
        />
      )}
    </nav>
  );
}
