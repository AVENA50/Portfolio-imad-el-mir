"use client";

import { Children, isValidElement, type ReactNode } from "react";

import { Reveal, type RevealDirection } from "@/components/effects/reveal";
import { cn } from "@/lib/cn";

interface StaggerProps {
  children: ReactNode;
  /** Millisecondi fra un figlio e il successivo. */
  step?: number;
  /** Ritardo prima del primo figlio. */
  delay?: number;
  direction?: RevealDirection;
  /** Tetto al ritardo: oltre, gli ultimi elementi sembrano rotti. */
  maxDelay?: number;
  once?: boolean;
  className?: string;
}

/**
 * Fa comparire i figli uno dopo l'altro.
 *
 * Ogni figlio viene avvolto in un Reveal con ritardo crescente. E cio che
 * trasforma una griglia che si accende tutta insieme in una che si compone
 * sotto gli occhi.
 *
 * `maxDelay` esiste per un motivo pratico: su una lista di venti elementi
 * con passo 80ms, l'ultimo comparirebbe dopo un secondo e sei — e a quel
 * punto l'utente ha gia scrollato oltre e pensa che la pagina sia rotta.
 * Superato il tetto, i restanti compaiono insieme.
 *
 * @example
 * <Stagger step={80} className="grid gap-6 md:grid-cols-3">
 *   {projects.map((p) => <ProjectCard key={p.slug} project={p} />)}
 * </Stagger>
 */
export function Stagger({
  children,
  step = 80,
  delay = 0,
  direction = "up",
  maxDelay = 600,
  once = true,
  className,
}: StaggerProps) {
  return (
    <div className={cn(className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;

        return (
          <Reveal
            direction={direction}
            delay={Math.min(delay + index * step, delay + maxDelay)}
            once={once}
          >
            {child}
          </Reveal>
        );
      })}
    </div>
  );
}
