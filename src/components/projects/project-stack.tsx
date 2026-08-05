import { Section, SectionHeading } from "@/components/shared";
import { TechIcon } from "@/components/shared/tech-icon";
import { Card } from "@/components/ui";
import { TECH_STACK, type TechGroup, type TechSlug } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";

interface ProjectStackProps {
  stack: readonly TechSlug[];
  dictionary: Dictionary;
}

/**
 * Ordine dei gruppi: dall'alto verso il basso del sistema.
 * Elencare le tecnologie in ordine alfabetico direbbe qualcosa
 * sull'alfabeto, non sul progetto.
 */
const GROUP_ORDER = [
  "language",
  "frontend",
  "backend",
  "data",
  "devops",
] as const satisfies readonly TechGroup[];

/**
 * Sezione Stack tecnologico (M7-T7).
 *
 * Il frontmatter elenca solo gli slug: nome, colore e gruppo arrivano da
 * config/tech-stack.ts. Cosi "PostgreSQL" si scrive una volta sola e non
 * diventa "Postgres" in un case study e "PostgreSQL" in un altro.
 *
 * Le icone usano il colore del marchio: qui la riconoscibilita e il punto,
 * e chi legge deve capire lo stack con un'occhiata, senza leggere.
 */
export function ProjectStack({ stack, dictionary }: ProjectStackProps) {
  if (stack.length === 0) return null;

  const groups = GROUP_ORDER.map((group) => ({
    group,
    items: stack.filter((slug) => TECH_STACK[slug].group === group),
  })).filter(({ items }) => items.length > 0);

  return (
    <Section id="stack" tone="subtle" spacing="md">
      <SectionHeading
        eyebrow={dictionary.caseStudy.stackEyebrow}
        title={dictionary.caseStudy.stack}
        description={dictionary.caseStudy.stackDescription}
      />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ group, items }) => (
          <Card
            key={group}
            surface="flat"
            padding="lg"
            className="zoom-hover h-full"
          >
            <h3 className="text-xs font-semibold tracking-wide text-ink-subtle uppercase">
              {dictionary.caseStudy.techGroups[group]}
            </h3>

            <ul className="mt-5 flex flex-col gap-4">
              {items.map((slug) => (
                <li key={slug} className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-card border border-border bg-surface-strong">
                    <TechIcon slug={slug} brandColor className="size-5" />
                  </span>

                  <span className="text-sm font-medium text-ink">
                    {TECH_STACK[slug].name}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}
