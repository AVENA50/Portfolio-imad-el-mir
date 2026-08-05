import { cn } from "@/lib/cn";

interface GridBackgroundProps {
  /**
   * Come la trama si spegne ai bordi.
   *
   * Una griglia che arriva netta fino al bordo sembra un progetto non
   * finito, o peggio un errore di rendering. La dissolvenza la fa leggere
   * come texture invece che come contenuto.
   */
  fade?: "radial" | "bottom" | "none";
  /** Passo della griglia. Piu fitta su superfici piccole. */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "[background-size:32px_32px]",
  md: "",
  lg: "[background-size:96px_96px]",
} as const;

/**
 * Maschere di dissolvenza.
 *
 * Scritte per intero e non composte a runtime: Tailwind cerca stringhe
 * letterali nel sorgente, e una classe costruita con un template literal
 * non verrebbe mai generata.
 */
const FADES = {
  radial:
    "[mask-image:radial-gradient(70%_60%_at_50%_40%,#000_0%,transparent_100%)]",
  bottom: "[mask-image:linear-gradient(to_bottom,#000_0%,transparent_85%)]",
  none: "",
} as const;

/**
 * Trama a griglia di sfondo (M2-T8).
 *
 * Decorativa e basta, quindi `aria-hidden` e `pointer-events-none`: non
 * deve comparire nella lettura di uno screen reader ne rubare i click.
 *
 * Va posizionata da chi la usa (`absolute inset-0` sul contenitore
 * `relative`), perche il posto giusto dipende dalla sezione: dietro tutto
 * il blocco, o solo dietro la parte alta.
 *
 * Attenzione a dove si mette: il sito ha gia un cielo stellato di fondo,
 * e sovrapporre due trame produce rumore. Ha senso dentro un pannello
 * delimitato — una sezione tecnica, un riquadro di richiamo — dove la
 * griglia suggerisce "schema, progetto" e il campo stellato non arriva.
 */
export function GridBackground({
  fade = "radial",
  size = "md",
  className,
}: GridBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-grid-pattern pointer-events-none absolute inset-0",
        SIZES[size],
        FADES[fade],
        className,
      )}
    />
  );
}
