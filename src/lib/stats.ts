import { TECH_STACK, type Tech } from "@/config/tech-stack";
import { isBuilt } from "@/lib/projects-filter";
import type { ProjectSummary } from "@/types";

/**
 * Fatti sul portfolio, **dedotti dai progetti**.
 *
 * Niente e scritto a mano. Il motivo non e pigrizia: un dato scritto a mano
 * e vero il giorno in cui lo scrivi e falso da quello dopo. Se il prossimo
 * progetto e in Java, questo file se ne accorge da solo — e soprattutto non
 * puo dire una cosa mentre la pagina /projects ne mostra un'altra.
 *
 * Chi legge un portfolio verifica: apre i progetti e conta.
 */

/**
 * Il linguaggio piu ricorrente nei progetti **costruiti**.
 *
 * I progetti solo pianificati non contano: uno stack dichiarato in un
 * progetto mai aperto e un'intenzione, non un'esperienza. Dire "Python,
 * linguaggio principale" perche compare in tre schede di progetti futuri
 * sarebbe esattamente il tipo di numero gonfiato che questa pagina evita.
 *
 * A parita di conteggio vince l'ordine del registro: serve un risultato
 * stabile, altrimenti la pagina cambierebbe fra una build e l'altra a
 * seconda di come il filesystem elenca i file.
 *
 * @returns il Tech completo, oppure null se non c'e ancora niente di
 *          costruito — su un portfolio appena nato e la risposta giusta.
 */
export function primaryLanguage(
  projects: readonly ProjectSummary[],
): Tech | null {
  const uses = new Map<string, number>();

  for (const project of projects.filter(isBuilt)) {
    for (const slug of project.stack ?? []) {
      if (TECH_STACK[slug].group !== "language") continue;
      uses.set(slug, (uses.get(slug) ?? 0) + 1);
    }
  }

  let best: Tech | null = null;
  let bestCount = 0;

  for (const tech of Object.values(TECH_STACK)) {
    const count = uses.get(tech.slug) ?? 0;
    if (count > bestCount) {
      best = tech;
      bestCount = count;
    }
  }

  return best;
}
