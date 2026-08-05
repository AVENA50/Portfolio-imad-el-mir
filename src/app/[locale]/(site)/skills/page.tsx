import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Stagger } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import { SkillGroupCard } from "@/components/skills/skill-group-card";
import { LOCALES, LOCALE_META, isLocale } from "@/config/i18n";
import { LANGUAGES } from "@/data/about";
import { SKILL_GROUPS } from "@/data/skills";
import { getDictionary } from "@/lib/dictionary";

interface SkillsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SkillsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dictionary = await getDictionary(locale);
  const path = `/${locale}/skills`;

  return {
    title: dictionary.skills.title,
    description: dictionary.skills.description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(
        LOCALES.map((code) => [LOCALE_META[code].htmlLang, `/${code}/skills`]),
      ),
    },
  };
}

/**
 * Pagina Competenze (M9-T3).
 *
 * Componente server puro: i dati sono statici, non c'e niente da filtrare
 * ne da cliccare oltre ai link verso i progetti.
 *
 * La legenda in cima non e decorazione: senza, la differenza fra pillola
 * piena e pillola tratteggiata resterebbe un codice che solo io conosco.
 * Una distinzione visiva che non viene spiegata non e una distinzione, e
 * un mistero.
 */
export default async function SkillsPage({ params }: SkillsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <>
      <Section width="wide" spacing="none" className="pt-24 pb-16">
        <SectionHeading
          as="h1"
          eyebrow={t.skills.eyebrow}
          title={t.skills.title}
          description={t.skills.description}
        />

        {/* Legenda */}
        <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          <li className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-block h-6 w-10 rounded-pill border border-violet-500/30 bg-violet-500/12"
            />
            <span className="text-ink-muted">{t.skills.legendProven}</span>
          </li>

          <li className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="inline-block h-6 w-10 rounded-pill border border-dashed border-border-strong"
            />
            <span className="text-ink-muted">{t.skills.legendLearning}</span>
          </li>
        </ul>

        <Stagger step={70} className="mt-10 grid gap-6 lg:grid-cols-2">
          {SKILL_GROUPS.map((group) => (
            <SkillGroupCard
              key={group.key}
              group={group}
              locale={locale}
              dictionary={t}
            />
          ))}
        </Stagger>
      </Section>

      {/* ------------------------------------------------------- lingue -- */}
      <Section width="wide" spacing="none" className="pb-24">
        <SectionHeading
          eyebrow={t.skills.languagesEyebrow}
          title={t.skills.languagesTitle}
          description={t.skills.languagesDescription}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGES.map((language) => (
            <li
              key={language.key}
              className="glass-flat glow-hover flex items-center gap-4 rounded-card p-5"
            >
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-card border border-violet-500/25 bg-violet-500/12 text-violet-300">
                <Icon name="globe" className="size-5" />
              </span>

              <div>
                <p className="font-medium text-ink">
                  {t.home.about.languages[language.key]}
                </p>
                <p className="mt-0.5 text-sm text-ink-subtle">
                  {language.level === "native"
                    ? t.skills.nativeLevel
                    : language.level}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
