import { Icon } from "@/components/shared/icon";
import type { Locale } from "@/config/i18n";
import { cn } from "@/lib/cn";
import { formatDateRange, formatMonthYear } from "@/lib/format";
import type { IconName } from "@/types";

export interface TimelineEntry {
  id: string;
  title: string;
  /** Istituto, azienda, ente che rilascia. */
  subtitle: string;
  description?: string;
  startDate: string;
  endDate?: string;
  /** Se true mostra una data sola invece di un periodo (certificati). */
  single?: boolean;
  location?: string;
  url?: string;
  icon: IconName;
  /** Elenco puntato sotto la descrizione: materie, risultati. */
  details?: readonly string[];
}

interface TimelineProps {
  entries: readonly TimelineEntry[];
  locale: Locale;
  /** Etichetta per gli screen reader: "Formazione", "Esperienza". */
  ariaLabel: string;
}

/**
 * Timeline verticale (M9-T5).
 *
 * Una lista ordinata, non una serie di card: `ol` perche l'ordine e
 * l'informazione — dal piu recente al piu vecchio — e uno screen reader
 * lo annuncia come "elemento 2 di 4" invece di leggere quattro blocchi
 * scollegati.
 *
 * La linea verticale e il pallino sono in CSS su pseudo-elementi e
 * `aria-hidden`: sono grammatica visiva, non contenuto. Metterli nel
 * markup significherebbe farli leggere ad alta voce.
 *
 * L'ultimo elemento perde la linea: una riga che scende nel vuoto sembra
 * un errore di rendering, non una fine.
 */
export function Timeline({ entries, locale, ariaLabel }: TimelineProps) {
  if (entries.length === 0) return null;

  return (
    <ol aria-label={ariaLabel} className="flex flex-col">
      {entries.map((entry) => {
        const isCurrent = !entry.endDate && !entry.single;

        return (
          <li
            key={entry.id}
            className="group relative pb-10 pl-14 last:pb-0 md:pl-20"
          >
            {/* Linea di collegamento verso l'elemento successivo */}
            <span
              aria-hidden
              className="absolute top-12 bottom-0 left-[1.375rem] w-px bg-gradient-to-b from-border-strong to-transparent group-last:hidden md:left-[1.75rem]"
            />

            {/* Pallino: pieno e pulsante se in corso, vuoto se concluso */}
            <span
              aria-hidden
              className={cn(
                "glass absolute top-0 left-0 inline-flex size-11 items-center justify-center rounded-pill md:size-14",
                isCurrent ? "text-violet-300" : "text-ink-subtle",
              )}
            >
              <Icon name={entry.icon} className="size-5" />
            </span>

            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="font-mono text-sm text-violet-300">
                {entry.single
                  ? formatMonthYear(entry.startDate, locale)
                  : formatDateRange(entry.startDate, entry.endDate, locale)}
              </p>

              {entry.location && (
                <p className="text-sm text-ink-subtle">{entry.location}</p>
              )}
            </div>

            <h3 className="mt-2 font-display text-xl font-bold text-ink">
              {entry.title}
            </h3>

            <p className="mt-1 text-sm font-medium text-ink-muted">
              {entry.url ? (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                >
                  {entry.subtitle}
                  <Icon name="external" className="size-3.5" />
                </a>
              ) : (
                entry.subtitle
              )}
            </p>

            {entry.description && (
              <p className="mt-4 max-w-3xl leading-relaxed text-ink-muted">
                {entry.description}
              </p>
            )}

            {entry.details && entry.details.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {entry.details.map((detail) => (
                  <li
                    key={detail}
                    className="rounded-badge bg-surface-strong px-2.5 py-1 text-xs text-ink-muted"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
