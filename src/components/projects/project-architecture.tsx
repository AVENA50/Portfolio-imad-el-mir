import Image from "next/image";

import { GridBackground, Reveal } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { TechIcon } from "@/components/shared/tech-icon";
import { Card } from "@/components/ui";
import { getTech } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import type { ArchitectureLayer, ProjectArchitecture } from "@/types";

interface ProjectArchitectureProps {
  architecture: ProjectArchitecture;
  dictionary: Dictionary;
}

/**
 * Un livello del sistema.
 *
 * Il numero non e decorativo: i livelli si leggono dall'alto verso il basso
 * come attraversa il sistema una richiesta. La riga verticale che li collega
 * e in CSS (`before`), non in markup, cosi l'elenco resta una lista pulita
 * per chi lo ascolta invece di vederlo.
 */
function Layer({ layer, index }: { layer: ArchitectureLayer; index: number }) {
  const tech = layer.tech ?? [];

  return (
    <li className="group relative pl-14 md:pl-16">
      {/* Riga di collegamento fino al livello successivo. Sull'ultimo
          sparisce: una linea che punta nel vuoto sembra un errore di
          rendering, non un finale. */}
      <span
        aria-hidden
        className="absolute top-13 -bottom-10 left-[1.375rem] w-px bg-gradient-to-b from-violet-500/40 to-transparent group-last:hidden md:top-15 md:left-[1.625rem]"
      />

      <span
        aria-hidden
        className="glass absolute top-0 left-0 inline-flex size-11 items-center justify-center rounded-pill font-display text-sm font-bold text-violet-300 md:size-13"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <h4 className="font-display text-lg font-bold text-ink md:text-xl">
        {layer.name}
      </h4>

      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {layer.description}
      </p>

      {tech.length > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-2">
          {tech.map((slug) => (
            <li
              key={slug}
              className="inline-flex items-center gap-2 rounded-badge bg-surface-strong px-2.5 py-1 text-xs text-ink-muted"
            >
              <TechIcon slug={slug} className="size-3.5" />
              {getTech(slug).name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Sezione Architettura (M7-T6).
 *
 * E la sezione che separa un case study da una vetrina: mostra come e fatto
 * dentro e, soprattutto, **perche**. Le decisioni tecniche sono in coppia
 * scelta/motivo di proposito — una scelta senza motivo e un elenco di
 * tecnologie, e quello lo sanno scrivere tutti.
 *
 * Ogni pezzo e opzionale: un progetto puo avere solo il riassunto, o solo i
 * livelli. La sezione si adatta invece di mostrare titoli vuoti.
 */
export function ProjectArchitecture({
  architecture,
  dictionary,
}: ProjectArchitectureProps) {
  const layers = architecture.layers ?? [];
  const decisions = architecture.decisions ?? [];

  return (
    <Section id="architecture" spacing="md">
      {/* La griglia dice "schema tecnico" senza scriverlo. Sfuma verso il
          basso perche il cielo stellato del sito riprende da li: due trame
          sovrapposte fanno rumore, una che cede all'altra fa profondita. */}
      <GridBackground fade="bottom" size="lg" className="-z-10" />

      <SectionHeading
        eyebrow={dictionary.caseStudy.architectureEyebrow}
        title={dictionary.caseStudy.architecture}
        description={architecture.summary}
      />

      {architecture.diagram && (
        <Reveal direction="up">
          <figure className="mt-12">
            <div className="glass overflow-hidden rounded-panel p-4 md:p-8">
              <Image
                src={architecture.diagram.src}
                alt={architecture.diagram.alt}
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="h-auto w-full rounded-card"
              />
            </div>

            {architecture.diagram.caption && (
              <figcaption className="mt-4 text-center text-sm text-ink-subtle">
                {architecture.diagram.caption}
              </figcaption>
            )}
          </figure>
        </Reveal>
      )}

      {layers.length > 0 && (
        <div className="mt-16">
          <h3 className="font-display text-h3 font-bold text-ink">
            {dictionary.caseStudy.architectureLayers}
          </h3>

          <ol className="mt-8 space-y-10">
            {layers.map((layer, index) => (
              <Layer key={layer.name} layer={layer} index={index} />
            ))}
          </ol>
        </div>
      )}

      {decisions.length > 0 && (
        <div className="mt-16">
          <h3 className="font-display text-h3 font-bold text-ink">
            {dictionary.caseStudy.architectureDecisions}
          </h3>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {decisions.map((decision) => (
              <Card key={decision.choice} surface="flat" padding="lg">
                <h4 className="font-display text-lg font-bold text-ink">
                  {decision.choice}
                </h4>

                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  <span className="font-semibold text-violet-300">
                    {dictionary.caseStudy.decisionWhy}:{" "}
                  </span>
                  {decision.why}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
