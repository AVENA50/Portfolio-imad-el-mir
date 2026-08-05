"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  DEFAULT_FILTERS,
  isCategoryFilter,
  isSort,
  isView,
} from "@/lib/projects-filter";
import type { ProjectFilters } from "@/types";

/**
 * Filtri della pagina Progetti, con la URL come unica fonte di verita (M6-T4).
 *
 * Non c'e uno `useState`: lo stato **e** la query string. La differenza si
 * vede subito:
 *
 * - il link a "solo i progetti full stack, ordinati dal piu vecchio" si
 *   copia e si manda a qualcuno;
 * - il tasto indietro del browser torna alla selezione precedente invece
 *   di uscire dalla pagina;
 * - ricaricando, i filtri restano quelli.
 *
 * Con uno stato locale nessuna delle tre cose funziona, e sono esattamente
 * quelle che una persona si aspetta da una pagina con dei filtri.
 *
 * I valori di default **non finiscono nella URL**: `/projects` invece di
 * `/projects?category=all&sort=newest&view=grid`. Un indirizzo pulito e
 * anche condivisibile, e i motori di ricerca non indicizzano dieci varianti
 * della stessa pagina.
 *
 * `router.replace` e non `push`: cambiare un filtro non e navigare. Con
 * push, tornare indietro dalla pagina significherebbe ripercorrere a
 * ritroso ogni click sui filtri.
 */
export function useProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<ProjectFilters>(() => {
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const view = searchParams.get("view");

    // Un valore inventato a mano nella URL non deve rompere la pagina:
    // si ricade sul default invece di mostrare una lista vuota.
    return {
      category: isCategoryFilter(category)
        ? category
        : DEFAULT_FILTERS.category,
      sort: isSort(sort) ? sort : DEFAULT_FILTERS.sort,
      view: isView(view) ? view : DEFAULT_FILTERS.view,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<ProjectFilters>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();

      for (const key of ["category", "sort", "view"] as const) {
        if (next[key] !== DEFAULT_FILTERS[key]) params.set(key, next[key]);
      }

      const query = params.toString();

      // scroll: false e la ragione per cui la pagina non salta in cima
      // ogni volta che si tocca un filtro.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [filters, pathname, router],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const isFiltered =
    filters.category !== DEFAULT_FILTERS.category ||
    filters.sort !== DEFAULT_FILTERS.sort;

  return { filters, setFilters, reset, isFiltered };
}
