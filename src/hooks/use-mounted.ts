"use client";

import { useEffect, useState } from "react";

/**
 * Dice se il componente e stato idratato nel browser.
 *
 * Serve per tutto cio che sul server non ha risposta: larghezza della
 * finestra, tema salvato, contenuto di localStorage. Renderizzare quei
 * valori al primo passaggio produce un mismatch di idratazione, che React
 * segnala come errore e risolve buttando via il markup del server.
 *
 * @example
 * const mounted = useMounted();
 * if (!mounted) return null; // oppure uno scheletro della stessa altezza
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
