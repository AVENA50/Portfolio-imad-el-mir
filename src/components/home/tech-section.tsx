import { Reveal } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { TechIcon } from "@/components/shared/tech-icon";
import { TECH_STACK, type TechGroup, type TechSlug } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import { isBuilt } from "@/lib/projects-filter";
import type { ProjectSummary } from "@/types";

interface TechSectionProps {
  projects: readonly ProjectSummary[];
  dictionary: Dictionary;
}

/** Dall'alto verso il basso del sistema, come nel case study. */
const GROUP_ORDER = [
  "language",
  "frontend",
  "backend",
  "data",
  "devops",
] as const satisfies readonly TechGroup[];

/**
 * Le tecnologie del portfolio (M8-T4).
 *
 * **Nota sulla task.** Il backlog chiedeva una seconda orbita di
 * tecnologie. L'hero ne ha gia una, e due orbite nella stessa pagina a due
 * schermate di distanza sarebbero ripetizione. Qui la sostanza e la stessa
 * — mostrare con cosa lavora — ma il mezzo cambia: l'orbita e un'immagine
 * e ne mostra sei scelte per bellezza, questa e un elenco e le mostra
 * tutte, che e l'informazione che qualcuno sta cercando davvero.
 *
 * Le tecnologie sono **dedotte dai progetti**, non elencate a mano: se un
 * domani togli Docker da tutti i case study, sparisce anche da qui. Un
 * elenco scritto a parte comincia vero e finisce per dichiarare competenze
 * che il portfolio non dimostra.
 *
 * I gruppi vuoti non vengono renderizzati: una riga "Dati" senza niente
 * accanto direbbe che quella parte manca.
 */
export function TechSection({ projects, dictionary }: TechSectionProps) {
  // Solo i progetti che esistono: elencare le tecnologie di un progetto
  // pianificato significherebbe dichiarare competenze che il portfolio
  // non dimostra ancora.
  const used = new Set<TechSlug>(
    projects.filter(isBuilt).flatMap((project) => project.stack ?? []),
  );

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: [...used].filter((slug) => TECH_STACK[slug].group === group),
  })).filter(({ items }) => items.length > 0);

  if (groups.length === 0) return null;

  return (
    // Nessuno stacco in alto: la sezione precedente ha gia il suo respiro,
    // e sommando le due spaziature restava un vuoto che faceva sembrare
    // questa parte staccata dal resto della pagina.
    <Section spacing="none" className="pb-24">
      <SectionHeading
        eyebrow={dictionary.home.tech.eyebrow}
        title={dictionary.home.tech.title}
        description={dictionary.home.tech.description}
      />

      <div className="mt-12 flex flex-col gap-8">
        {groups.map(({ group, items }, index) => (
          <Reveal key={group} direction="up" delay={index * 60}>
            <div className="flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:gap-10">
              <h3 className="w-40 shrink-0 text-xs font-semibold tracking-wide text-ink-subtle uppercase">
                {dictionary.caseStudy.techGroups[group]}
              </h3>

              <ul className="flex flex-wrap items-center gap-3">
                {items.map((slug) => (
                  <li
                    key={slug}
                    className="glass-flat glow-hover flex items-center gap-2.5 rounded-pill px-4 py-2"
                  >
                    <TechIcon slug={slug} brandColor className="size-5" />
                    <span className="text-sm font-medium text-ink">
                      {TECH_STACK[slug].name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
