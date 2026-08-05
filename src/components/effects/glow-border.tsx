import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Cornice in gradiente attorno a un elemento (M2-T8).
 *
 * Serve a dire "questo qui, fra tutti": la card del progetto in evidenza,
 * un piano consigliato, un riquadro di richiamo. Per funzionare deve
 * restare **raro** — se ogni card ha il bordo luminoso, il bordo luminoso
 * non indica piu niente.
 *
 * Nessun JavaScript e nessuna animazione: e un pseudo-elemento ritagliato
 * in CSS (globals.css). Le versioni animate con gradiente rotante sono
 * belle in una demo e costose in una pagina vera, perche il browser
 * ridisegna la cornice a ogni fotogramma anche quando nessuno la guarda.
 *
 * `asChild` esiste perche la cornice deve poter avvolgere l'elemento che
 * gia c'e — un <article>, un <li> — invece di aggiungere un <div> in mezzo
 * che romperebbe una griglia.
 */
const glowBorderVariants = cva("relative isolate", {
  variants: {
    /** Da dove nasce la luce. Cambia solo il gradiente della cornice. */
    tone: {
      brand: "[--glow-border-gradient:var(--gradient-brand)]",
      violet:
        "[--glow-border-gradient:linear-gradient(135deg,var(--color-violet-500),transparent_55%,var(--color-violet-400))]",
      /** Luce fredda che scivola via: per bordi decorativi, non di richiamo. */
      subtle:
        "[--glow-border-gradient:linear-gradient(135deg,#ffffff40,transparent_60%,#ffffff1a)]",
    },
    width: {
      hairline: "[--glow-border-width:1px]",
      thick: "[--glow-border-width:2px]",
    },
    /** Aggiunge l'alone esterno oltre alla cornice. */
    glow: {
      true: "shadow-glow",
      false: "",
    },
  },
  defaultVariants: {
    tone: "brand",
    width: "hairline",
    glow: false,
  },
});

export interface GlowBorderProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glowBorderVariants> {
  asChild?: boolean;
}

export function GlowBorder({
  className,
  tone,
  width,
  glow,
  asChild = false,
  ...props
}: GlowBorderProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(
        "glow-border",
        glowBorderVariants({ tone, width, glow }),
        className,
      )}
      {...props}
    />
  );
}

export { glowBorderVariants };
