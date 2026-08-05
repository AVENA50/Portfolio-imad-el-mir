"use client";

import { useMemo } from "react";

import { ProjectFiltersBar } from "@/components/projects/project-filters";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectList } from "@/components/projects/project-list";
import type { Locale } from "@/config/i18n";
import { useProjectFilters } from "@/hooks/use-project-filters";
import type { Dictionary } from "@/lib/dictionary";
import { applyFilters, countByCategory } from "@/lib/projects-filter";
import type { ProjectSummary } from "@/types";

interface ProjectsBrowserProps {
  projects: readonly ProjectSummary[];
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * La pagina Progetti nella sua parte interattiva (M6-T8).
 *
 * Riceve **tutti** i progetti gia letti dal server e filtra qui, nel
 * browser. Con otto progetti — e anche con cento — rifare il giro al
 * server a ogni click sarebbe piu lento e romperebbe la sensazione di
 * immediatezza: l'array e gia in memoria, filtrarlo costa un millesimo di
 * quanto costa una richiesta di rete.
 *
 * Il confine e disegnato qui e non piu in alto: la pagina resta un
 * componente server che legge il filesystem, e solo questo pezzo diventa
 * client. Card e righe restano componenti server renderizzati come figli.
 *
 * `useMemo` sul risultato non e superstizione: senza, ogni cambio di stato
 * — anche il passaggio del mouse su un filtro — riordinerebbe l'array e
 * darebbe a React un riferimento nuovo, facendo ricalcolare tutte le card.
 */
export function ProjectsBrowser({
  projects,
  locale,
  dictionary,
}: ProjectsBrowserProps) {
  const { filters, setFilters, reset, isFiltered } = useProjectFilters();

  const counts = useMemo(() => countByCategory(projects), [projects]);

  const visible = useMemo(
    () => applyFilters(projects, filters),
    [projects, filters],
  );

  const count =
    visible.length === 1
      ? dictionary.projects.countOne
      : dictionary.projects.count.replace("{n}", String(visible.length));

  return (
    <>
      <ProjectFiltersBar
        filters={filters}
        counts={counts}
        isFiltered={isFiltered}
        dictionary={dictionary}
        onChange={setFilters}
        onReset={reset}
      />

      {/* Il conteggio e in una regione live: chi non vede la griglia
          cambiare deve comunque sapere che il filtro ha avuto effetto. */}
      <p aria-live="polite" className="mt-6 text-sm text-ink-subtle">
        {count}
      </p>

      <div className="mt-8">
        {filters.view === "list" ? (
          <ProjectList
            projects={visible}
            locale={locale}
            dictionary={dictionary}
          />
        ) : (
          <ProjectGrid
            projects={visible}
            locale={locale}
            dictionary={dictionary}
          />
        )}
      </div>
    </>
  );
}
