"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Quanto dell'elemento deve essere visibile. 0.2 = un quinto. */
  threshold?: number;
  /** Margine attorno alla viewport: "-80px" anticipa lo scatto. */
  rootMargin?: string;
  /** Se true smette di osservare al primo ingresso. */
  once?: boolean;
}

/**
 * Dice se un elemento e entrato nella viewport.
 *
 * Basato su IntersectionObserver, che il browser valuta fuori dal thread
 * principale: nessun listener sullo scroll, nessun `getBoundingClientRect`
 * a ogni pixel. Con trenta elementi animati la differenza si vede.
 *
 * Chi ha `prefers-reduced-motion` parte gia visibile: non osserviamo
 * nemmeno, cosi il contenuto e li dal primo frame.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
