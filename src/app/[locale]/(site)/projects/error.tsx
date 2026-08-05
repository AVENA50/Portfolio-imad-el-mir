"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui";

interface ProjectsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Errore della pagina Progetti (M6-T9).
 *
 * I contenuti si leggono a build time, quindi qui ci si arriva solo se
 * qualcosa si e rotto davvero: un frontmatter invalido sfuggito ai test,
 * un file di contenuto sparito.
 *
 * Il testo e in inglese e non passa dal dizionario di proposito. Se a
 * fallire fosse proprio il caricamento del dizionario, una pagina d'errore
 * che dipende dal dizionario fallirebbe a sua volta — e l'utente vedrebbe
 * l'errore di Next invece del nostro. Una pagina d'errore non deve avere
 * dipendenze che possono rompersi.
 *
 * `digest` e l'identificativo che Next assegna all'errore lato server: in
 * produzione il messaggio vero non viene esposto al browser, e quel codice
 * e l'unico modo per ritrovare l'errore nei log.
 */
export default function ProjectsError({ error, reset }: ProjectsErrorProps) {
  useEffect(() => {
    console.error("Projects page error:", error);
  }, [error]);

  return (
    <div className="container-site py-24">
      <div className="glass mx-auto max-w-xl rounded-panel p-8 text-center">
        <h1 className="font-display text-h3 font-bold text-ink">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          The project list could not be loaded. This is on our side, not yours.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-ink-subtle">
            Error ID: {error.digest}
          </p>
        )}

        <Button onClick={reset} iconLeft="refresh" className="mt-8">
          Try again
        </Button>
      </div>
    </div>
  );
}
