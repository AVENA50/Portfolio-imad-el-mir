import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  /** La riga viola maiuscola sopra il titolo: "IL MIO LAVORO", "CHI SONO". */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  /** Bottone o link allineato a destra del titolo: "Vedi tutti". */
  action?: ReactNode;
  align?: "left" | "center";
  /** Livello dell'intestazione. Cambia il tag, non l'aspetto. */
  as?: "h2" | "h3";
  className?: string;
}

/**
 * Intestazione di sezione.
 *
 * Il punto non e risparmiare righe: e che eyebrow, titolo e descrizione
 * abbiano sempre la stessa gerarchia visiva in tutto il sito. Scritti a
 * mano trenta volte, dopo due settimane hanno trenta spaziature diverse.
 *
 * `as` esiste perche il livello dell'intestazione deve seguire la struttura
 * del documento, non l'aspetto: dentro una pagina che ha gia un h1, le
 * sezioni sono h2, e le sottosezioni h3. Uno screen reader naviga proprio
 * su quella gerarchia.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
        isCentered && "sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", isCentered && "text-center")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}

        <Tag className={cn("text-h2", eyebrow ? "mt-4" : undefined)}>
          {title}
        </Tag>

        {description && (
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
