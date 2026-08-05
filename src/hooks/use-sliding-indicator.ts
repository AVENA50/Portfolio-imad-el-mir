"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface IndicatorState {
  left: number;
  width: number;
  visible: boolean;
}

const HIDDEN: IndicatorState = { left: 0, width: 0, visible: false };

/**
 * Indicatore scorrevole condiviso.
 *
 * Una sola pill che si sposta e si ridimensiona sull'elemento puntato, e a
 * riposo torna su quello attivo. Usato da navigazione desktop, selettore di
 * lingua e Tabs: tre componenti, un solo comportamento.
 *
 * La posizione va misurata a runtime e non puo stare in CSS, perche dipende
 * dalla larghezza del testo — che cambia con la lingua: "Competenze" e
 * "Skills" non occupano lo stesso spazio.
 *
 * @param resetKey valore che, cambiando, forza il riallineamento
 *                 (pathname, lingua, tab selezionata)
 *
 * @example
 * const { containerRef, activeRef, indicator, moveTo, settle } =
 *   useSlidingIndicator<HTMLUListElement, HTMLAnchorElement>(pathname);
 */
export function useSlidingIndicator<
  Container extends HTMLElement = HTMLElement,
  Item extends HTMLElement = HTMLElement,
>(resetKey?: unknown) {
  const containerRef = useRef<Container>(null);
  const activeRef = useRef<Item>(null);
  const [indicator, setIndicator] = useState<IndicatorState>(HIDDEN);

  const moveTo = useCallback((target: HTMLElement | null) => {
    const container = containerRef.current;
    if (!container || !target) {
      setIndicator(HIDDEN);
      return;
    }

    const containerBox = container.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();

    setIndicator({
      left: targetBox.left - containerBox.left,
      width: targetBox.width,
      visible: true,
    });
  }, []);

  /** Riporta l'indicatore sull'elemento attivo. */
  const settle = useCallback(() => {
    moveTo(activeRef.current);
  }, [moveTo]);

  useEffect(() => {
    settle();

    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [settle, resetKey]);

  /** Stile pronto da applicare all'elemento indicatore. */
  const indicatorStyle = {
    width: `${indicator.width}px`,
    transform: `translateX(${indicator.left}px)`,
  };

  return { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle };
}

/** Classi condivise dall'elemento indicatore. */
export const INDICATOR_CLASSES =
  "glass pointer-events-none absolute rounded-pill transition-[transform,width,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
