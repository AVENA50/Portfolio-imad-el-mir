import { cn } from "@/lib/cn";

interface SkipLinkProps {
  label: string;
  targetId?: string;
  className?: string;
}

/**
 * Link per saltare la navigazione.
 *
 * Deve essere il primo elemento focalizzabile della pagina. Chi naviga da
 * tastiera o con screen reader altrimenti attraversa le sei voci di menu
 * a ogni cambio pagina, ogni volta.
 *
 * Resta invisibile finche non riceve il focus: non e nascosto con
 * `display: none` — quello lo toglierebbe anche dall'ordine di tabulazione,
 * rendendolo inutile — ma spostato fuori schermo e riportato dentro al
 * focus.
 */
export function SkipLink({
  label,
  targetId = "main-content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only",
        "focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100]",
        "focus-visible:rounded-pill focus-visible:bg-primary focus-visible:px-5 focus-visible:py-3",
        "focus-visible:text-sm focus-visible:font-semibold focus-visible:text-primary-fg",
        className,
      )}
    >
      {label}
    </a>
  );
}
