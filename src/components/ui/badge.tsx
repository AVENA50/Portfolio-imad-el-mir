import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Stili del Badge.
 *
 * Gli accenti coincidono con quelli delle categorie di progetto: cosi il
 * badge "Full Stack" su una card e il filtro attivo nella pagina Progetti
 * sono lo stesso colore senza che nessuno debba ricordarselo.
 *
 * Ogni accento e fondo tenue + testo pieno + bordo: su sfondo scuro un
 * badge pieno griderebbe piu del titolo che gli sta accanto.
 */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 rounded-pill border",
    "font-medium whitespace-nowrap",
  ],
  {
    variants: {
      accent: {
        violet: "border-violet-500/30 bg-violet-500/12 text-violet-300",
        blue: "border-blue-500/30 bg-blue-500/12 text-blue-300",
        indigo: "border-indigo-500/30 bg-indigo-500/12 text-indigo-300",
        cyan: "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",
        teal: "border-teal-400/30 bg-teal-400/12 text-teal-300",
        green: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
        /** Neutro: tag tecnologia, date, meta. */
        neutral: "border-border bg-surface-strong text-ink-muted",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem]",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
      /** Pallino colorato a sinistra: usato per gli stati. */
      dot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      accent: "neutral",
      size: "md",
      dot: false,
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  accent,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ accent, size, dot }), className)}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-pill bg-current"
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
