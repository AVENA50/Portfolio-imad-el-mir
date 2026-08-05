import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Stili della Card.
 *
 * `surface` decide come la card raccoglie la luce:
 *   glass  vetro con sfocatura   -> pannelli isolati, sopra il pianeta
 *   flat   vetro senza sfocatura -> griglie con molte card
 *   solid  superficie piena      -> dove serve leggibilita massima
 *
 * La distinzione non e estetica: `backdrop-filter` costringe il browser a
 * ricomporre l'area sotto ogni card a ogni frame. Su una griglia di otto
 * progetti in scroll, `flat` e la differenza fra fluido e a scatti.
 */
const cardVariants = cva(
  "relative rounded-card transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out-soft",
  {
    variants: {
      surface: {
        glass: "glass",
        flat: "glass-flat",
        solid: "border border-border bg-surface shadow-card",
      },
      interactive: {
        true: "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card-hover",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      surface: "flat",
      interactive: false,
      padding: "md",
    },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /**
   * Rende il figlio invece di un <div>.
   * Serve quando la card e un <article> o un <li>: la semantica resta
   * corretta e gli stili si applicano lo stesso.
   */
  asChild?: boolean;
}

export function Card({
  className,
  surface,
  interactive,
  padding,
  asChild = false,
  ...props
}: CardProps) {
  const Component = asChild ? Slot : "div";

  return (
    <Component
      className={cn(cardVariants({ surface, interactive, padding }), className)}
      {...props}
    />
  );
}

/* --------------------------------------------------------------------------
   Sottocomponenti.

   Card e composta, non configurata: invece di dieci props (title, subtitle,
   image, footer...) si montano i pezzi che servono. Una project card e una
   certificate card hanno bisogni diversi, e con la composizione nessuna
   delle due porta in giro props che non usa.
   ----------------------------------------------------------------------- */

export function CardMedia({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Angoli superiori arrotondati come la card, immagine che non sborda
        "relative -m-px mb-5 overflow-hidden rounded-t-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-xl font-bold text-ink", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm leading-relaxed text-ink-muted", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex flex-wrap items-center gap-3", className)}
      {...props}
    />
  );
}

export { cardVariants };
