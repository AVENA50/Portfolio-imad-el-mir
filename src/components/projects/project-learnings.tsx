import { Stagger } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectLearning } from "@/types";

interface ProjectLearningsProps {
  learnings: readonly ProjectLearning[];
  dictionary: Dictionary;
}

/**
 * Sezione "Cosa ho imparato" (M7-T9).
 *
 * Non e la stessa griglia delle feature con un titolo diverso: qui il
 * contenuto e riflessivo, si legge in sequenza, e una riga per volta lo
 * rende leggibile come un elenco di considerazioni invece che come una
 * vetrina di riquadri.
 *
 * E la sezione che un recruiter tecnico legge per prima: dice cosa e
 * cambiato nel modo di lavorare, non cosa e stato costruito.
 */
export function ProjectLearnings({
  learnings,
  dictionary,
}: ProjectLearningsProps) {
  if (learnings.length === 0) return null;

  return (
    <Section id="learnings" spacing="md">
      <SectionHeading
        eyebrow={dictionary.caseStudy.learningsEyebrow}
        title={dictionary.caseStudy.learnings}
        description={dictionary.caseStudy.learningsDescription}
      />

      <Stagger step={80} className="mt-12 flex flex-col gap-4">
        {learnings.map((learning) => (
          <article
            key={learning.title}
            className="glass-flat flex gap-5 rounded-card p-6 md:gap-6 md:p-8"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-card border border-violet-500/25 bg-violet-500/12 text-violet-300">
              <Icon name={learning.icon} className="size-6" />
            </span>

            <div>
              <h3 className="font-display text-lg font-bold text-ink md:text-xl">
                {learning.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-ink-muted md:text-base">
                {learning.description}
              </p>
            </div>
          </article>
        ))}
      </Stagger>
    </Section>
  );
}
