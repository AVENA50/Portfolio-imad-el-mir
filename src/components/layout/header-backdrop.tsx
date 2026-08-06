"use client";

import { useEffect, useRef } from "react";

/**
 * Il fondale dell'header, che compare quando la pagina scorre.
 *
 * **Il problema che risolve.** L'header e sempre stato `sticky top-0`, ma
 * senza sfondo: in cima alla pagina e la scelta giusta — il nome galleggia
 * sul cielo stellato e il sito respira — mentre appena si scende il testo
 * della pagina passa dietro al menu e i due si sovrappongono. Non e
 * l'header che se ne va: e che smette di essere leggibile.
 *
 * Quindi il fondale non c'e a scroll zero e appare dopo pochi pixel, con
 * una dissolvenza. Si guadagna la leggibilita senza perdere l'effetto
 * d'apertura.
 *
 * **Perche un livello separato e non `backdrop-filter` sull'header.**
 * Questo e il punto che conta. Un elemento con `backdrop-filter` diventa
 * il blocco contenitore dei suoi discendenti `position: fixed` — la
 * specifica lo equipara a `filter` e `transform`. Il drawer mobile e
 * `fixed inset-y-0` e vive dentro l'header: mettendo il filtro sull'header
 * il pannello smetterebbe di riferirsi alla finestra e si schiaccerebbe
 * nei 5rem della barra. Il filtro sta quindi su un `div` fratello del
 * contenuto, che non ha discendenti fissi.
 *
 * **Nessuno stato React**, per la stessa ragione di `ScrollProgress`: uno
 * `useState` aggiornato a ogni evento di scroll significa un rendering di
 * React per evento. Qui si scrive un attributo sul nodo tramite una ref, e
 * solo quando il valore cambia davvero — cioe due volte in tutta la
 * scrollata, non seicento.
 *
 * L'aspetto viene da `.glass-bar`, l'utility scritta in M1-T3b proprio per
 * questo e rimasta finora inutilizzata. Da li arrivano anche i due
 * ripieghi gia previsti: superficie opaca sui browser senza
 * `backdrop-filter`, e sui sistemi dove l'utente ha chiesto meno
 * trasparenza.
 */

/**
 * Quanti pixel di scorrimento prima che il fondale compaia.
 *
 * Otto e non zero: sui trackpad e sui telefoni un micro-movimento
 * involontario basta a portare `scrollTop` a 1 o 2, e il fondale
 * lampeggerebbe mentre si sta fermi in cima.
 */
const SOGLIA_PX = 8;

export function HeaderBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    let frame = 0;

    function aggiorna() {
      frame = 0;
      if (!nodo) return;

      const oltre = document.documentElement.scrollTop > SOGLIA_PX;
      const valore = oltre ? "true" : "false";

      // Si tocca il DOM solo alla transizione, non a ogni fotogramma.
      if (nodo.dataset.scrolled !== valore) nodo.dataset.scrolled = valore;
    }

    function alloScroll() {
      // Un aggiornamento per fotogramma: l'evento scroll scatta molto piu
      // spesso di quanto lo schermo si ridisegni.
      if (frame === 0) frame = window.requestAnimationFrame(aggiorna);
    }

    // Subito, non solo al primo scroll: chi arriva su un'ancora o ricarica
    // a meta pagina deve trovare il fondale gia acceso.
    aggiorna();

    window.addEventListener("scroll", alloScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", alloScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-scrolled="false"
      className="glass-bar pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out-soft data-[scrolled=true]:opacity-100"
    />
  );
}
