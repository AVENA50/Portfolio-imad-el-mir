"use client";

import type { CSSProperties, ReactNode } from "react";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/cn";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  /** Da dove arriva l'elemento. "none" fa solo dissolvenza. */
  direction?: RevealDirection;
  /** Ritardo in millisecondi. Lo usa Stagger per scalare i figli. */
  delay?: number;
  duration?: number;
  /** Se false l'elemento si rianima ogni volta che rientra in vista. */
  once?: boolean;
  className?: string;
}

/** Posizione di partenza, prima che l'elemento entri in vista. */
const HIDDEN_TRANSFORM: Record<RevealDirection, string> = {
  up: "translate3d(0, 1.5rem, 0)",
  down: "translate3d(0, -1.5rem, 0)",
  left: "translate3d(1.5rem, 0, 0)",
  right: "translate3d(-1.5rem, 0, 0)",
  none: "none",
};

/**
 * Fa comparire il contenuto quando entra nella viewport.
 *
 * Animiamo solo `opacity` e `transform`: sono le due proprieta che il
 * browser puo gestire sul compositor, senza rifare layout ne ripaint.
 * Animare `top` o `height` costringerebbe a ricalcolare la pagina a ogni
 * frame — ed e la ragione per cui certi siti scattano in scroll.
 *
 * Nessuna libreria di animazione: per una dissolvenza sarebbero decine di
 * kilobyte per fare quello che due proprieta CSS fanno gratis.
 *
 * @example
 * <Reveal direction="up" delay={100}>
 *   <ProjectCard project={project} />
 * </Reveal>
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 600,
  once = true,
  className,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once });

  const style: CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "none" : HIDDEN_TRANSFORM[direction],
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "transition-[opacity,transform] ease-out-soft",
        // will-change solo finche serve: lasciarlo sempre attivo tiene
        // un layer in memoria per ogni elemento animato della pagina
        !inView && "will-change-[opacity,transform]",
        className,
      )}
    >
      {children}
    </div>
  );
}
