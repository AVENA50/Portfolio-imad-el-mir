import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AboutHero,
  AboutStory,
  AboutTransferable,
  Passions,
} from "@/components/about";
import { Section, SectionHeading } from "@/components/shared";
import { Button } from "@/components/ui";
import { isLocale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { getAllProjects } from "@/lib/content/projects";
import { getDictionary } from "@/lib/dictionary";
import { EMPTY_METADATA, buildPageMetadata } from "@/lib/metadata";
import { primaryLanguage } from "@/lib/stats";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return EMPTY_METADATA;

  const dictionary = await getDictionary(locale);

  return buildPageMetadata({
    locale,
    path: "/about",
    title: dictionary.nav.about,
    description: dictionary.about.leadOne,
  });
}

/**
 * Pagina "Chi sono" (M9-T7).
 *
 * Cinque blocchi in un ordine che ha una logica: chi sei, cosa ti piace,
 * come ci sei arrivato, cosa porti da quello che non e informatica, dove
 * andare adesso. Le prove — progetti, date, certificati — stanno altrove,
 * e questa pagina si limita a indicarle: duplicare la timeline qui
 * significherebbe due posti da aggiornare a ogni esame.
 *
 * I progetti si leggono qui e non dentro l'hero perche leggerli e un
 * accesso al disco: farlo nel componente lo legherebbe al filesystem e lo
 * renderebbe impossibile da testare. Cosi l'hero riceve un dato gia
 * pronto e non sa da dove viene.
 */
export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);
  const language = primaryLanguage(getAllProjects(locale));

  return (
    <>
      <AboutHero locale={locale} dictionary={t} language={language} />
      <Passions dictionary={t} />
      <AboutStory dictionary={t} />
      <AboutTransferable dictionary={t} />

      <Section tone="subtle" spacing="md">
        <SectionHeading
          align="center"
          title={t.about.ctaTitle}
          description={t.about.ctaDescription}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild iconRight="arrow-right">
            <Link href={localePath(locale, "/experience")}>
              {t.about.ctaTimeline}
            </Link>
          </Button>

          <Button asChild variant="secondary" iconRight="arrow-right">
            <Link href={localePath(locale, "/projects")}>
              {t.about.ctaProjects}
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
