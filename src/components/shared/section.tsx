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
 */
const sectionVariants = cva("relative", {
  variants: {
    tone: {
      transparent: "",
      subtle: "bg-bg-subtle",
      elevated: "bg-bg-elevated",
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
}

export function Section({
  className,
  tone,
  spacing,
  asChild = false,
  bleed = false,
  children,
  ...props
}: SectionProps) {
  const Component = asChild ? Slot : "section";

  return (
    <Component
      className={cn(sectionVariants({ tone, spacing }), className)}
      {...props}
    >
      {bleed ? children : <div className="container-site">{children}</div>}
    </Component>
  );
}

export { sectionVariants };
