"use client";

import { useEffect } from "react";

/**
 * Blocca lo scroll della pagina mentre un overlay e aperto.
 *
 * Il dettaglio che quasi tutti sbagliano: mettere `overflow: hidden` sul
 * body fa sparire la scrollbar, la pagina si allarga di 15px e tutto il
 * contenuto salta di lato nel momento in cui apri il menu. Qui misuriamo
 * la larghezza della scrollbar e la compensiamo con un padding, cosi la
 * pagina resta ferma.
 *
 * Ripristina i valori originali invece di azzerarli: se un giorno il body
 * avesse un padding suo, non glielo cancelliamo.
 */
export function useLockScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement } = document;

    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Larghezza della scrollbar: differenza fra finestra e area visibile
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(
        window.getComputedStyle(body).paddingRight || "0",
      );
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [locked]);
}
