/**
 * Home temporanea.
 *
 * Serve solo a verificare i design token di M1-T3 nel browser.
 * Viene sostituita dalla home vera in M8-T7: nessun componente
 * definito qui va riutilizzato.
 */
export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="bg-hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      <div className="container-site relative flex min-h-dvh flex-col justify-center py-24">
        <p className="eyebrow">Design system</p>

        <h1 className="text-display mt-6 max-w-3xl">
          Hi, I&apos;m <span className="text-gradient">Imad</span>
        </h1>

        <p className="text-ink-muted mt-6 max-w-xl text-lg">
          Token, scala tipografica e superfici sono attivi. Questa pagina
          verifica M1-T3 e verra sostituita dalla home definitiva in M8.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-button-gradient text-primary-fg shadow-glow hover:shadow-glow-strong rounded-button px-6 py-3 font-semibold transition-shadow"
          >
            Bottone primario
          </button>

          <button
            type="button"
            className="bg-surface hover:bg-surface-hover border-border hover:border-border-strong rounded-button border px-6 py-3 font-semibold transition-colors"
          >
            Bottone secondario
          </button>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Algorithms", color: "bg-accent-violet" },
            { name: "Data & BI", color: "bg-accent-blue" },
            { name: "Full Stack", color: "bg-accent-indigo" },
            { name: "AI & ML", color: "bg-accent-cyan" },
          ].map((category) => (
            <li
              key={category.name}
              className="bg-surface border-border shadow-card hover:border-border-strong rounded-card border p-5 transition-colors"
            >
              <span className={`${category.color} rounded-pill block size-3`} />
              <h2 className="text-h3 mt-4">{category.name}</h2>
              <p className="text-ink-subtle mt-2 text-sm">Accento di categoria</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
