import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Sezione di pagina.
 *
 * Ogni sezione del sito passa da qui: significa che il ritmo verticale e
 * la larghezza del contenuto sono decisi in un posto solo. Se domani le
 * sezioni devono respirare di piu, si cambia un valore invece di cercare
 * `py-24` in trenta file.
 *
 * `tone` alterna il fondo come nei mockup: sezioni pari trasparenti,
 * dispari appena piu chiare, per separarle senza disegnare linee.
 *
 * Il tono e una fascia sfumata, non un colore pieno (globals.css): con un
 * fondo opaco il confine fra due sezioni diventa una riga netta larga tutto
 * lo schermo, che sopra il cielo stellato si legge come un difetto.
 */
const sectionVariants = cva("relative", {
  variants: {
    tone: {
      transparent: "",
      subtle: "section-tone-subtle",
      elevated: "section-tone-elevated",
    },
    spacing: {
      none: "",
      sm: "py-16",
      md: "py-24",
      lg: "py-32",
    },
  },
  defaultVariants: {
    tone: "transparent",
    spacing: "md",
  },
});

export interface SectionProps
  extends HTMLAttributes<HTMLElement>, VariantProps<typeof sectionVariants> {
  /** Rende il figlio invece di <section>: per <footer>, <article>, <aside>. */
  asChild?: boolean;
  /** Toglie il contenitore centrato, per sezioni a tutta larghezza. */
  bleed?: boolean;
  /**
   * Larghezza del contenuto.
   *
   * `wide` e per le pagine fatte di griglie — competenze, timeline — che
   * su un monitor largo sembrerebbero una colonna stretta in mezzo al
   * vuoto. Non va usata dove c'e prosa: una riga di testo larga 1600px si
   * legge male, perche l'occhio perde il capo riga.
   */
  width?: "default" | "wide";
}

export function Section({
  className,
  tone,
  spacing,
  asChild = false,
  bleed = false,
  width = "default",
  children,
  ...props
}: SectionProps) {
  const Component = asChild ? Slot : "section";

  return (
    <Component
      className={cn(sectionVariants({ tone, spacing }), className)}
      {...props}
    >
      {bleed ? (
        children
      ) : (
        <div className={width === "wide" ? "container-wide" : "container-site"}>
          {children}
        </div>
      )}
    </Component>
  );
}

export { sectionVariants };
