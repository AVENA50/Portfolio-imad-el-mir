import { headers } from "next/headers";
import Link from "next/link";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/shared/icon";
import { Button, Card } from "@/components/ui";
import { resolveLocale } from "@/config/i18n";
import { MAIN_NAV, localePath } from "@/config/navigation";
import { getDictionary } from "@/lib/dictionary";
import { LOCALE_HEADER } from "@/middleware";
import type { IconName } from "@/types";

/** Icona per ciascuna scorciatoia della 404. */
const SHORTCUT_ICONS: Partial<Record<string, IconName>> = {
  about: "home",
  projects: "grid",
  skills: "search",
  contact: "mail",
};

/**
 * Pagina 404.
 *
 * Non riceve `params`: Next non le passa alle pagine di errore. La lingua
 * arriva dall'header `x-locale` che il middleware imposta a ogni richiesta —
 * senza, un utente su /en si vedrebbe una 404 in italiano.
 *
 * Sta fuori dal gruppo (site) e monta header e footer da sola: cosi puo
 * occupare tutta la finestra e restare comunque navigabile.
 */
export default async function NotFound() {
  const locale = resolveLocale(
    (await headers()).get(LOCALE_HEADER) ?? undefined,
  );
  const t = await getDictionary(locale);

  const shortcuts = MAIN_NAV.filter((item) => item.key !== "home").slice(0, 4);

  return (
    <>
      <Header locale={locale} dictionary={t} />

      <main className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden">
        <div
          className="bg-hero-orb pointer-events-none absolute inset-0"
          aria-hidden
        />

        <div className="container-site relative flex flex-col items-center py-20 text-center">
          <span
            aria-hidden
            className="glass flex size-20 items-center justify-center rounded-panel text-violet-300"
          >
            <Icon name="search" className="size-8" />
          </span>

          <p className="text-gradient mt-10 font-display text-[clamp(5rem,18vw,11rem)] leading-none font-extrabold tracking-tight">
            {t.notFound.code}
          </p>

          <h1 className="mt-4 max-w-2xl text-h1">{t.notFound.title}</h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            {t.notFound.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" iconLeft="home">
              <Link href={localePath(locale, "/")}>{t.actions.backToHome}</Link>
            </Button>

            <Button asChild size="lg" variant="secondary" iconLeft="grid">
              <Link href={localePath(locale, "/projects")}>
                {t.actions.viewProjects}
              </Link>
            </Button>
          </div>

          <p className="eyebrow mt-16 justify-center">
            {t.notFound.suggestions}
          </p>

          <ul className="mt-6 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((item) => (
              <li key={item.key}>
                <Card asChild surface="flat" interactive padding="sm">
                  <Link
                    href={localePath(locale, item.href)}
                    className="flex items-center gap-3 text-left"
                  >
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-badge bg-surface-strong text-violet-300"
                    >
                      <Icon name={SHORTCUT_ICONS[item.key] ?? "arrow-right"} />
                    </span>

                    <span className="font-semibold">{t.nav[item.key]}</span>

                    <Icon
                      name="arrow-right"
                      className="ml-auto text-ink-subtle"
                    />
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer locale={locale} dictionary={t} />
    </>
  );
}
