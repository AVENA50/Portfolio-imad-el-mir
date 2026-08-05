"use client";

import { useEffect, useRef } from "react";

/**
 * Barra di avanzamento della lettura (M3-T7).
 *
 * Una riga sottile in cima che si riempie da sinistra a destra man mano
 * che si scende. Su una pagina lunga — un case study da otto sezioni —
 * dice quanto manca senza che serva guardare la scrollbar.
 *
 * Tre scelte di prestazione, e la ragione di ognuna:
 *
 * 1. **Nessuno stato React.** Aggiornare uno `useState` a ogni pixel di
 *    scroll significa un rendering di React per pixel. Qui si scrive
 *    direttamente sullo stile del nodo tramite una ref: il browser fa una
 *    composizione e basta, React non viene neanche svegliato.
 * 2. **`transform: scaleX`** invece di `width`. La larghezza costringe il
 *    browser a ricalcolare il layout a ogni fotogramma; la trasformazione
 *    viene gestita dal compositore, spesso senza toccare il thread
 *    principale.
 * 3. **requestAnimationFrame + listener passivo.** L'evento scroll scatta
 *    molto piu spesso di quanto lo schermo si aggiorni: senza il freno si
 *    farebbero calcoli buttati via. `passive: true` promette al browser
 *    che non chiameremo preventDefault, e gli permette di far scorrere la
 *    pagina senza aspettarci.
 *
 * La barra e `aria-hidden`: e un doppione visivo della scrollbar, che gli
 * screen reader gia gestiscono. Annunciare "37 per cento" a ogni movimento
 * sarebbe rumore, non informazione.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;

    function update() {
      frame = 0;
      if (!bar) return;

      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      // Quanto si puo ancora scorrere. Su una pagina corta e zero, e
      // dividere per zero darebbe NaN: in quel caso la barra resta vuota.
      const scrollable = scrollHeight - clientHeight;
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;

      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    }

    function onScroll() {
      // Un solo aggiornamento per fotogramma, non uno per evento
      if (frame === 0) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        ref={barRef}
        className="bg-brand-gradient h-full w-full origin-left scale-x-0"
      />
    </div>
  );
}
