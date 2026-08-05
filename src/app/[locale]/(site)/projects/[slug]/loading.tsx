/**
 * Scheletro della pagina progetto (M7-T11).
 *
 * Le pagine sono generate a build time, quindi in produzione si vede di
 * rado: serve in sviluppo e nelle navigazioni in cui Next deve ancora
 * recuperare il payload della route.
 *
 * Le forme ricalcano l'ingombro reale dell'hero — titolo, sottotitolo,
 * copertina 16:9. Uno scheletro con proporzioni diverse dal contenuto vero
 * fa saltare la pagina nel momento della sostituzione, che e peggio del non
 * mostrare nulla.
 *
 * Tutto `aria-hidden` e senza `role="status"`: l'App Router annuncia gia il
 * cambio di pagina agli screen reader, e un messaggio di caricamento qui
 * dentro andrebbe tradotto leggendo la lingua dagli header — cioe
 * renderebbe dinamica una route che oggi e completamente statica.
 */
export default function CaseStudyLoading() {
  return (
    <div aria-hidden className="container-site animate-pulse py-16">
      <div className="h-4 w-32 rounded-pill bg-surface-strong" />

      <div className="mt-8 flex gap-3">
        <div className="h-7 w-28 rounded-pill bg-surface-strong" />
        <div className="h-7 w-24 rounded-pill bg-surface-strong" />
      </div>

      <div className="mt-6 h-12 w-full max-w-2xl rounded-card bg-surface-strong" />
      <div className="mt-4 h-5 w-full max-w-xl rounded-pill bg-surface" />
      <div className="mt-3 h-5 w-2/3 max-w-md rounded-pill bg-surface" />

      <div className="mt-9 flex gap-4">
        <div className="h-14 w-40 rounded-pill bg-surface-strong" />
        <div className="h-14 w-40 rounded-pill bg-surface" />
      </div>

      <div className="mt-14 aspect-[16/9] w-full rounded-panel bg-surface" />

      <div className="mt-16 space-y-4">
        <div className="h-5 w-full max-w-3xl rounded-pill bg-surface" />
        <div className="h-5 w-11/12 max-w-3xl rounded-pill bg-surface" />
        <div className="h-5 w-4/5 max-w-2xl rounded-pill bg-surface" />
      </div>
    </div>
  );
}
