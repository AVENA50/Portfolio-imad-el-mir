"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { LanyardSceneProps } from "./lanyard-scene";

/**
 * Il badge 3D, caricato solo se e quando serve.
 *
 * **Perche esiste questo file separato.** La scena porta con se three,
 * @react-three/fiber, drei, meshline e il motore fisico Rapier, che e
 * WebAssembly: piu di un megabyte. Importarla normalmente vorrebbe dire
 * spedirla a chiunque apra il sito, anche a chi la pagina "Chi sono" non
 * la visita mai.
 *
 * Tre filtri, in quest'ordine:
 *
 * 1. `next/dynamic` con `ssr: false` la mette in un chunk separato. Non
 *    e solo ottimizzazione: three tocca `window` all'import, quindi sul
 *    server esploderebbe comunque.
 * 2. Un IntersectionObserver fa partire il download quando la sezione si
 *    avvicina allo schermo. Chi apre la pagina e legge i primi paragrafi
 *    non aspetta niente.
 * 3. Chi ha chiesto meno animazioni al sistema operativo, o e su uno
 *    schermo piccolo, vede l'immagine e basta. Su un telefono di fascia
 *    media questa scena scalda la batteria per un dettaglio decorativo,
 *    e la decorazione non vale il prezzo che la fa pagare a qualcun altro.
 */

const LanyardScene = dynamic(() => import("./lanyard-scene"), {
  ssr: false,
  loading: () => null,
});

export interface LanyardProps extends Omit<
  LanyardSceneProps,
  "className" | "ariaLabel" | "paused"
> {
  ariaLabel: string;
  /**
   * Cosa si vede al posto della scena.
   *
   * E un nodo React e non l'URL di un'immagine per una ragione precisa:
   * il badge statico e fatto degli stessi dati del badge 3D, quindi non
   * possono divergere. Con un'immagine servirebbe ricordarsi di riesportare
   * un PNG ogni volta che cambia il ruolo scritto sulla card — e nessuno
   * se lo ricorda.
   */
  fallback: ReactNode;
  className?: string;
}

export function Lanyard({
  fallback,
  ariaLabel,
  className,
  ...scene
}: LanyardProps) {
  const container = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Il touch da solo non basta a escludere: un tablet grande regge la
    // scena senza problemi. E la combinazione schermo piccolo + touch che
    // identifica i dispositivi dove non conviene.
    if (calm || (coarse && narrow)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        setVisible(entry.isIntersecting);
        // Una volta scaricata resta montata: rimontarla a ogni passaggio
        // rifarebbe partire la fisica da zero, e la card cadrebbe di nuovo
        // dall'alto ogni volta che si scorre su e giu.
        if (entry.isIntersecting) setEnabled(true);
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={container}
      className={cn("relative touch-none select-none", className)}
    >
      {/* Il fallback resta nel flusso anche quando il 3D e attivo: e lui a
          dare l'altezza al contenitore. Se sparisse, la pagina si
          accorcerebbe di colpo nel momento in cui il canvas prende il suo
          posto, e tutto quello che sta sotto salterebbe su. */}
      <div
        aria-hidden={enabled}
        className={cn(
          "flex h-full items-center justify-center transition-opacity duration-700",
          enabled ? "opacity-0" : "opacity-100",
        )}
      >
        {fallback}
      </div>

      {enabled && (
        <LanyardScene
          {...scene}
          ariaLabel={ariaLabel}
          // Fuori dallo schermo il canvas smette davvero di disegnare: un
          // ciclo di fisica a 60 Hz per una scena che nessuno guarda e
          // batteria buttata, e su un portatile si sente dalla ventola.
          paused={!visible}
          className="!absolute inset-0"
        />
      )}
    </div>
  );
}
