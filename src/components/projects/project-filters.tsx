"use client";

import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui";
import { PROJECT_CATEGORIES } from "@/config/project-categories";
import {
  INDICATOR_CLASSES,
  useSlidingIndicator,
} from "@/hooks/use-sliding-indicator";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import { SORT_OPTIONS } from "@/lib/projects-filter";
import type { CategorySlug, ProjectFilters, ProjectSort } from "@/types";

interface ProjectFiltersBarProps {
  filters: ProjectFilters;
  counts: Record<string, number>;
  isFiltered: boolean;
  dictionary: Dictionary;
  onChange: (patch: Partial<ProjectFilters>) => void;
  onReset: () => void;
}

/** Le categorie nell'ordine dichiarato, con "tutti" davanti. */
const CATEGORY_ORDER = [...PROJECT_CATEGORIES].sort(
  (a, b) => a.order - b.order,
);

/**
 * Barra dei filtri della pagina Progetti (M6-T5, T6, T7).
 *
 * Tre controlli, tre forme diverse, e non e una scelta estetica:
 *
 * - **Categorie**: bottoni a scelta singola. Sono poche e vanno viste
 *   tutte insieme, con quante ne contiene ciascuna. Un menu a tendina
 *   nasconderebbe proprio l'informazione utile.
 * - **Ordinamento**: un `<select>` nativo. Tre voci che si escludono, che
 *   nessuno guarda finche non serve. Il menu di sistema e gia accessibile,
 *   funziona da tastiera e su mobile apre il selettore del telefono: una
 *   tendina fatta a mano sarebbe piu bella e peggiore.
 * - **Vista**: due bottoni con `aria-pressed`, che dice allo screen reader
 *   quale dei due e attivo — cosa che una classe CSS non comunica.
 *
 * La pillola scorrevole sotto la categoria attiva riusa lo stesso hook del
 * menu principale, cosi il movimento e identico in tutto il sito.
 */
export function ProjectFiltersBar({
  filters,
  counts,
  isFiltered,
  dictionary,
  onChange,
  onReset,
}: ProjectFiltersBarProps) {
  const { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle } =
    useSlidingIndicator<HTMLUListElement, HTMLButtonElement>(filters.category);

  function renderCategory(value: CategorySlug | "all", label: string) {
    const isActive = filters.category === value;
    const count = counts[value] ?? 0;

    return (
      <li key={value}>
        <button
          type="button"
          ref={isActive ? activeRef : undefined}
          onClick={() => onChange({ category: value })}
          onMouseEnter={(event) => moveTo(event.currentTarget)}
          aria-pressed={isActive}
          className={cn(
            "relative z-10 inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            isActive ? "text-ink" : "text-ink-muted hover:text-ink",
          )}
        >
          {label}
          <span
            className={cn(
              "text-xs tabular-nums",
              isActive ? "text-violet-300" : "text-ink-subtle",
            )}
          >
            {count}
          </span>
        </button>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* -------------------------------------------------- categorie -- */}
      <ul
        ref={containerRef}
        onMouseLeave={settle}
        className="glass relative flex flex-wrap items-center gap-1 rounded-pill p-1"
      >
        <span
          aria-hidden
          style={indicatorStyle}
          className={cn(
            INDICATOR_CLASSES,
            "inset-y-1",
            indicator.visible ? "opacity-100" : "opacity-0",
          )}
        />

        {renderCategory("all", dictionary.projects.filterAll)}

        {CATEGORY_ORDER.map((category) =>
          renderCategory(category.slug, dictionary.categories[category.slug]),
        )}
      </ul>

      <div className="flex items-center gap-3">
        {isFiltered && (
          <Button variant="ghost" iconLeft="close" size="sm" onClick={onReset}>
            {dictionary.projects.resetFilters}
          </Button>
        )}

        {/* ------------------------------------------------ ordinamento -- */}
        <label className="glass inline-flex items-center gap-2 rounded-pill px-4 py-2">
          <span className="text-xs whitespace-nowrap text-ink-subtle">
            {dictionary.projects.sortLabel}
          </span>

          <select
            value={filters.sort}
            onChange={(event) =>
              onChange({ sort: event.target.value as ProjectSort })
            }
            className="cursor-pointer bg-transparent text-sm font-medium text-ink outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              // La voce del menu si disegna sul fondo di sistema, non sul
              // nostro: senza un colore esplicito, su Windows e testo
              // bianco su bianco.
              <option
                key={option}
                value={option}
                className="bg-surface text-ink"
              >
                {dictionary.projects.sort[option]}
              </option>
            ))}
          </select>
        </label>

        {/* ------------------------------------------------------ vista -- */}
        <div className="glass hidden items-center gap-1 rounded-pill p-1 sm:inline-flex">
          {(["grid", "list"] as const).map((view) => {
            const isActive = filters.view === view;

            return (
              <button
                key={view}
                type="button"
                onClick={() => onChange({ view })}
                aria-pressed={isActive}
                title={dictionary.projects.view[view]}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-pill transition-colors",
                  isActive
                    ? "glass-strong text-ink"
                    : "text-ink-subtle hover:text-ink",
                )}
              >
                <Icon name={view} className="size-4" />
                <span className="sr-only">
                  {dictionary.projects.view[view]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
