"use client";

import { useId, useRef, type KeyboardEvent } from "react";

import {
  INDICATOR_CLASSES,
  useSlidingIndicator,
} from "@/hooks/use-sliding-indicator";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: string;
  /** Numero mostrato accanto all'etichetta: "Progetti 8". */
  count?: number;
}

interface TabsProps {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Identificatore condiviso con i TabPanel. Se omesso viene generato. */
  idPrefix?: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Barra di tab accessibile.
 *
 * Implementa il pattern ARIA completo, che non e solo `role="tab"`:
 *
 * - **tabindex a rotazione**: solo la tab selezionata e raggiungibile con Tab.
 *   Fra le tab ci si muove con le frecce. Senza, chi naviga da tastiera deve
 *   premere Tab sei volte per superare i filtri.
 * - **Home e End** portano alla prima e all'ultima.
 * - `aria-controls` e `aria-labelledby` legano tab e pannello, cosi lo screen
 *   reader annuncia "scheda 2 di 3, Formazione".
 *
 * L'indicatore e lo stesso del menu principale: un hook condiviso.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  idPrefix,
  ariaLabel,
  className,
}: TabsProps) {
  const generatedId = useId();
  const prefix = idPrefix ?? generatedId;

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle } =
    useSlidingIndicator<HTMLDivElement, HTMLButtonElement>(value);

  function focusTab(nextValue: string) {
    onValueChange(nextValue);
    tabRefs.current.get(nextValue)?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = items.findIndex((item) => item.value === value);
    if (index === -1) return;

    const last = items.length - 1;
    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        nextIndex = index === 0 ? last : index - 1;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = last;
        break;
      default:
        return;
    }

    const next = items[nextIndex];
    if (!next) return;

    event.preventDefault();
    focusTab(next.value);
  }

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onMouseLeave={settle}
      className={cn("relative inline-flex items-center gap-1 p-1", className)}
    >
      <span
        aria-hidden
        className={cn(
          INDICATOR_CLASSES,
          "inset-y-1",
          indicator.visible ? "opacity-100" : "opacity-0",
        )}
        style={indicatorStyle}
      />

      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) tabRefs.current.set(item.value, node);
              else tabRefs.current.delete(item.value);
              if (isActive) activeRef.current = node;
            }}
            type="button"
            role="tab"
            id={`${prefix}-tab-${item.value}`}
            aria-selected={isActive}
            aria-controls={`${prefix}-panel-${item.value}`}
            // tabindex a rotazione: fuori dalla barra si entra e si esce
            // con un solo Tab, dentro ci si muove con le frecce
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            onMouseEnter={(event) => moveTo(event.currentTarget)}
            onFocus={(event) => moveTo(event.currentTarget)}
            onBlur={settle}
            className={cn(
              "relative z-10 rounded-pill px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
              isActive ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-2 text-xs text-ink-subtle">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  value: string;
  activeValue: string;
  idPrefix: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Pannello di una tab.
 *
 * Quando non e attivo esce dal DOM accessibile con `hidden`: gli screen
 * reader non leggono contenuti nascosti, e la ricerca del browser non
 * trova testo invisibile.
 */
export function TabPanel({
  value,
  activeValue,
  idPrefix,
  children,
  className,
}: TabPanelProps) {
  const isActive = value === activeValue;

  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={className}
    >
      {isActive && children}
    </div>
  );
}
