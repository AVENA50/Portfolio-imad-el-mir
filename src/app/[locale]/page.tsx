import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroVisual } from "@/components/home/hero-visual";
import { Header } from "@/components/layout/header";
import { Icon } from "@/components/shared/icon";
import { isLocale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { SOCIAL_LINKS } from "@/data/social";
import { getDictionary } from "@/lib/dictionary";

/**
 * Home.
 *
 * Per ora contiene solo l'hero, dimensionato per occupare tutta la finestra
 * meno l'header. Le altre sezioni (progetti in evidenza, orbita tecnologie,
 * banda statistiche) arrivano in M8; l'header si spostera nel layout del
 * route group (site) in M3-T9.
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
    <>
      <Header locale={locale} dictionary={t} />

      <main>
        {/* min-h calcolata sull'altezza dell'header (5rem): l'hero riempie
            esattamente il resto della finestra, senza scroll parassita. */}
        <section className="relative flex min-h-[calc(100dvh-5rem)] items-center overflow-hidden">
          <div
            className="bg-hero-orb pointer-events-none absolute inset-0"
            aria-hidden
          />

          <div className="relative mx-auto grid w-full max-w-[110rem] items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            <div>
              <p className="glass text-ink-muted inline-flex items-center gap-2.5 rounded-pill px-4 py-2 text-sm font-medium">
                <span aria-hidden className="bg-success size-2 rounded-pill" />
                {t.hero.badge}
              </p>

              <h1 className="text-display mt-8">
                {t.hero.greeting}{" "}
                <span className="text-gradient">{t.hero.name}</span>
              </h1>

              <p className="text-h3 text-ink-muted font-display mt-4 font-semibold">
                {t.hero.role}
              </p>

              <p className="text-ink-subtle mt-6 max-w-xl text-lg leading-relaxed lg:text-xl">
                {t.hero.intro}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={localePath(locale, "/projects")}
                  className="bg-button-gradient text-primary-fg shadow-glow hover:shadow-glow-strong rounded-pill inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold transition-shadow"
                >
                  {t.hero.primaryCta}
                  <Icon name="arrow-right" className="size-5" />
                </Link>

                <Link
                  href={localePath(locale, "/contact")}
                  className="glass glass-hover rounded-pill inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold transition-colors"
                >
                  {t.hero.secondaryCta}
                  <Icon name="mail" className="size-5" />
                </Link>
              </div>

              {/* Contatti rapidi sotto i bottoni */}
              <ul className="mt-10 flex items-center gap-4">
                {SOCIAL_LINKS.map((link) => {
                  const isExternal = link.href.startsWith("http");

                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        download={link.icon === "file" ? true : undefined}
                        title={link.label}
                        className="glass glass-hover text-ink-muted hover:text-ink rounded-card flex size-14 items-center justify-center transition-colors"
                      >
                        <Icon name={link.icon} className="size-6" />
                        <span className="sr-only">{link.srLabel}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <HeroVisual className="hidden justify-self-center lg:block" />
          </div>
        </section>
      </main>
    </>
  );
}
