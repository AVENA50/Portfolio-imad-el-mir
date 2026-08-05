import { Stagger } from "@/components/effects";
import { Icon } from "@/components/shared/icon";
import { Section, SectionHeading } from "@/components/shared";
import { Card } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionary";
import type { ProjectFeature } from "@/types";

interface ProjectFeaturesProps {
  features: readonly ProjectFeature[];
  dictionary: Dictionary;
}

/**
 * Sezione "Cosa fa" (M7-T5).
 *
 * Tre colonne su schermo largo, due su tablet: con quattro o cinque
 * funzionalita la griglia si riempie senza lasciare una card orfana in
 * fondo, che e l'effetto tipico delle griglie a quattro colonne.
 *
 * `h3` e non `h2`: la sezione ha gia il suo titolo, e i titoli delle card
 * sono un livello sotto. Uno screen reader naviga su questa gerarchia, e
 * saltarla renderebbe la pagina piatta.
 */
export function ProjectFeatures({
  features,
  dictionary,
}: ProjectFeaturesProps) {
  if (features.length === 0) return null;

  return (
    <Section id="features" tone="subtle" spacing="md">
      <SectionHeading
        eyebrow={dictionary.caseStudy.featuresEyebrow}
        title={dictionary.caseStudy.features}
        description={dictionary.caseStudy.featuresDescription}
      />

      <Stagger
        step={70}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {features.map((feature) => (
          <Card key={feature.title} surface="flat" padding="lg">
            <span className="inline-flex size-12 items-center justify-center rounded-card border border-violet-500/25 bg-violet-500/12 text-violet-300">
              <Icon name={feature.icon} className="size-6" />
            </span>

            <h3 className="mt-5 font-display text-xl font-bold text-ink">
              {feature.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              {feature.description}
            </p>
          </Card>
        ))}
      </Stagger>
    </Section>
  );
}
