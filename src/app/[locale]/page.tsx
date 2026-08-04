import { notFound } from "next/navigation";

import { isLocale } from "@/config/i18n";
import { MAIN_NAV, localePath } from "@/config/navigation";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { getDictionary } from "@/lib/dictionary";

/**
 * Home temporanea.
 *
 * Verifica design token (M1-T3) e i18n (M1-T6b) nel browser.
 * Viene sostituita dalla home vera in M8-T7.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="bg-hero-glow pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      <div className="container-site relative flex min-h-dvh flex-col justify-center py-24">
        <div className="flex items-center justify-between gap-4">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <LocaleSwitcher label={t.localeSwitcher.label} />
        </div>

        <h1 className="text-display mt-6 max-w-3xl">
          {t.home.greeting} <span className="text-gradient">{t.home.name}</span>
        </h1>

        <p className="text-ink-muted mt-6 max-w-xl text-lg">{t.home.intro}</p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-button-gradient text-primary-fg shadow-glow hover:shadow-glow-strong rounded-button px-6 py-3 font-semibold transition-shadow"
          >
            {t.home.primaryCta}
          </button>

          <button
            type="button"
            className="bg-surface hover:bg-surface-hover border-border hover:border-border-strong rounded-button border px-6 py-3 font-semibold transition-colors"
          >
            {t.home.secondaryCta}
          </button>
        </div>

        {/* Verifica che dizionario e navigazione siano allineati */}
        <ul className="mt-16 flex flex-wrap gap-2">
          {MAIN_NAV.map((item) => (
            <li key={item.key}>
              <span className="border-border bg-surface text-ink-muted rounded-pill border px-3 py-1.5 text-sm">
                {t.nav[item.key]}
                <span className="text-ink-subtle ml-2 text-xs">
                  {localePath(locale, item.href)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              { key: "algorithms", color: "bg-accent-violet" },
              { key: "data-bi", color: "bg-accent-blue" },
              { key: "full-stack", color: "bg-accent-indigo" },
              { key: "ai-ml", color: "bg-accent-cyan" },
            ] as const
          ).map((category) => (
            <li
              key={category.key}
              className="bg-surface border-border shadow-card hover:border-border-strong rounded-card border p-5 transition-colors"
            >
              <span className={`${category.color} rounded-pill block size-3`} />
              <h2 className="text-h3 mt-4">{t.categories[category.key]}</h2>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
