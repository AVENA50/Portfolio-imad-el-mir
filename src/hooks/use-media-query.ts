"use client";

import { useEffect, useState } from "react";

/**
 * Segue una media query e restituisce se e soddisfatta.
 *
 * Sul server restituisce sempre `false`: non esiste una finestra, quindi
 * non esiste una risposta. Chi deve renderizzare cose diverse in base al
 * risultato lo combini con `useMounted`, altrimenti il primo frame nel
 * browser puo differire dal markup del server.
 *
 * Da usare per la logica, non per lo stile: nascondere un elemento sotto
 * i 1024px si fa con `hidden lg:block`, non con JavaScript. Questo hook
 * serve quando il comportamento cambia — per esempio chiudere il drawer
 * mobile se la finestra si allarga fino al desktop.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

/** Breakpoint del progetto, allineati a Tailwind. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
export const useIsTablet = () => useMediaQuery("(min-width: 768px)");
export const usePrefersReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
