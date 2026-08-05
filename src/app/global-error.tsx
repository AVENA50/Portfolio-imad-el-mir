"use client";

/**
 * Errore globale.
 *
 * Scatta solo quando fallisce il root layout: a quel punto non esistono piu
 * ne provider ne fogli di stile, quindi questo file deve rendere <html> e
 * <body> da solo e non puo contare su Tailwind. Per questo gli stili sono
 * inline: e l'unica pagina del progetto dove e la scelta giusta.
 *
 * Niente dizionari: `getDictionary` e server-only e qui siamo in un client
 * component di emergenza. Il testo e bilingue, cosi resta comprensibile
 * comunque.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#05060d",
          color: "#f8fafc",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "32rem" }}>
          <h1 style={{ fontSize: "2rem", margin: 0, fontWeight: 700 }}>
            Qualcosa è andato storto
          </h1>

          <p style={{ marginTop: "0.5rem", color: "#94a3b8" }}>
            Something went wrong
          </p>

          <p
            style={{
              marginTop: "1.5rem",
              lineHeight: 1.6,
              color: "#94a3b8",
            }}
          >
            Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
          </p>

          {/* Il digest e l'unico appiglio per ritrovare l'errore nei log
              del server: senza, un utente puo solo dire "non funziona". */}
          {error.digest && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.75rem",
                color: "#64748b",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.875rem 2rem",
              borderRadius: "9999px",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              backgroundImage: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            }}
          >
            Riprova · Try again
          </button>
        </main>
      </body>
    </html>
  );
}
