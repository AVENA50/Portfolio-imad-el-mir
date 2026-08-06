import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExperienceTabs } from "@/components/timeline/experience-tabs";
import type { TimelineEntry } from "@/components/timeline/timeline";
import { Section, SectionHeading } from "@/components/shared";
import { isLocale } from "@/config/i18n";
import { CERTIFICATES, EDUCATION, EXPERIENCE } from "@/data/about";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { EMPTY_METADATA, buildPageMetadata } from "@/lib/metadata";

interface ExperiencePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ExperiencePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return EMPTY_METADATA;

  const dictionary = await getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "/experience",
    title: dictionary.experience.title,
    description: dictionary.experience.description,
  });
}

/**
 * Pagina Percorso (M9-T6).
 *
 * I dati strutturati stanno in data/about.ts, i testi nei dizionari, e qui
 * si uniscono. La divisione non e pedanteria: una data non si traduce e
 * una descrizione si, e tenerle nello stesso posto significa duplicare le
 * date a ogni lingua — con il rischio che una delle due resti indietro.
 */
export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  const education: TimelineEntry[] = EDUCATION.map((entry) => {
    const text =
      t.experience.education[
        entry.key as keyof Dictionary["experience"]["education"]
      ];

    return {
      id: entry.key,
      title: text.title,
      subtitle: entry.institution,
      description: text.description,
      details: text.details,
      startDate: entry.startDate,
      endDate: entry.endDate,
      location: entry.location,
      url: entry.url,
      icon: "target",
    };
  });

  const work: TimelineEntry[] = EXPERIENCE.map((entry) => {
    const text =
      t.experience.work[entry.key as keyof Dictionary["experience"]["work"]];

    return {
      id: entry.key,
      title: text.title,
      subtitle: entry.organization,
      description: text.description,
      details: text.details,
      startDate: entry.startDate,
      endDate: entry.endDate,
      location: entry.location,
      icon: "users",
    };
  });

  const certificates: TimelineEntry[] = CERTIFICATES.map((entry) => {
    const text =
      t.experience.certificates[
        entry.key as keyof Dictionary["experience"]["certificates"]
      ];

    return {
      id: entry.key,
      title: text.title,
      subtitle: entry.issuer,
      description: text.description,
      startDate: entry.date,
      single: true,
      url: entry.url,
      icon: "trophy",
    };
  });

  return (
    <Section width="wide" spacing="none" className="pt-24 pb-24">
      <SectionHeading
        as="h1"
        eyebrow={t.experience.eyebrow}
        title={t.experience.title}
        description={t.experience.description}
      />

      <div className="mt-12">
        <ExperienceTabs
          education={education}
          work={work}
          certificates={certificates}
          locale={locale}
          dictionary={t}
        />
      </div>
    </Section>
  );
}
