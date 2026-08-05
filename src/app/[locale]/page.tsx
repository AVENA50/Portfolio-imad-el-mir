import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroVisual } from "@/components/home/hero-visual";
import { Badge, Button } from "@/components/ui";
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
              <Badge accent="green" size="lg" dot>
                {t.hero.badge}
              </Badge>

              <h1 className="mt-8 text-display">
                {t.hero.greeting}{" "}
                <span className="text-gradient">{t.hero.name}</span>
              </h1>

              <p className="mt-4 font-display text-h3 font-semibold text-ink-muted">
                {t.hero.role}
              </p>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-subtle lg:text-xl">
                {t.hero.intro}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" iconRight="arrow-right">
                  <Link href={localePath(locale, "/projects")}>
                    {t.hero.primaryCta}
                  </Link>
                </Button>

                <Button asChild size="lg" variant="secondary" iconRight="mail">
                  <Link href={localePath(locale, "/contact")}>
                    {t.hero.secondaryCta}
                  </Link>
                </Button>
              </div>

              {/* Contatti rapidi sotto i bottoni */}
              <ul className="mt-10 flex items-center gap-4">
                {SOCIAL_LINKS.map((link) => {
                  const isExternal = link.href.startsWith("http");

                  return (
                    <li key={link.label}>
                      <Button
                        asChild
                        variant="secondary"
                        size="lg"
                        iconOnly
                        className="rounded-card text-ink-muted hover:text-ink"
                      >
                        <a
                          href={link.href}
                          target={isExternal ? "_blank" : undefined}
                          rel={isExternal ? "noopener noreferrer" : undefined}
                          download={link.icon === "file" ? true : undefined}
                          title={link.label}
                        >
                          <Icon name={link.icon} className="size-6" />
                          <span className="sr-only">{link.srLabel}</span>
                        </a>
                      </Button>
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
