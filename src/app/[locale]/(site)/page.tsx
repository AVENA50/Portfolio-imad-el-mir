import Link from "next/link";
import { notFound } from "next/navigation";

import { AboutPreview } from "@/components/home/about-preview";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { HeroVisual } from "@/components/home/hero-visual";
import { TechSection } from "@/components/home/tech-section";
import { Icon } from "@/components/shared/icon";
import { Badge, Button } from "@/components/ui";
import { isLocale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { SOCIAL_LINKS } from "@/data/social";
import { getAllProjects, getFeaturedProjects } from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";

/**
 * Home (M8-T7).
 *
 * Header, footer e skip link arrivano dal layout del gruppo (site): qui
 * resta il contenuto, in un ordine che segue una domanda alla volta.
 *
 *   hero        chi sei
 *   progetti    fammi vedere
 *   tecnologie  con cosa
 *   chi sono    da dove vieni, cosa cerchi
 *
 * "Chi sono" chiude invece di aprire: chi arriva su un portfolio vuole
 * prima vedere il lavoro. La biografia interessa dopo, a chi ha visto
 * qualcosa che gli e piaciuto.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);
  const featured = getFeaturedProjects(locale, 4);

  // Le tecnologie si deducono da tutti i progetti, non solo dai quattro in
  // evidenza: quello che uso non dipende da cosa ho scelto di mettere in
  // vetrina. Il corpo MDX non serve e non viene portato avanti.
  const all = getAllProjects(locale).map(
    ({ content: _content, ...summary }) => summary,
  );

  return (
    <>
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

      <FeaturedProjects projects={featured} locale={locale} dictionary={t} />

      <TechSection projects={all} dictionary={t} />

      <AboutPreview locale={locale} dictionary={t} />
    </>
  );
}
