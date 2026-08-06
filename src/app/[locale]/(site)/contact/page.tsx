import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactForm, ContactInfo } from "@/components/contact";
import { Section, SectionHeading } from "@/components/shared";
import { LOCALES, LOCALE_META, isLocale } from "@/config/i18n";
import { getDictionary } from "@/lib/dictionary";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dictionary = await getDictionary(locale);

  return {
    title: dictionary.contact.title,
    description: dictionary.contact.description,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        LOCALES.map((code) => [LOCALE_META[code].htmlLang, `/${code}/contact`]),
      ),
    },
  };
}

/**
 * Pagina Contatti (M9-T11).
 *
 * Il form a sinistra e piu largo perche e la cosa da fare; le informazioni
 * a destra sono l'alternativa per chi il form non vuole usarlo. Su schermo
 * stretto il form resta comunque **primo**: chi apre questa pagina ha gia
 * deciso di scrivere, e fargli scorrere tre riquadri prima di trovare la
 * casella sarebbe un ostacolo messo per ordine estetico.
 */
export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);

  return (
    <Section width="wide" spacing="none" className="pt-20 pb-24 md:pt-24">
      <SectionHeading
        as="h1"
        eyebrow={t.contact.eyebrow}
        title={t.contact.title}
        description={t.contact.description}
      />

      {/* Con il contenitore largo il rapporto scende da 1.35 a 1.15: a
          104rem un rapporto piu sbilanciato porterebbe le caselle del form
          oltre gli 850px, e una riga di testo cosi lunga si scrive male —
          l'occhio perde il punto in cui si trovava. Dando piu spazio alla
          colonna di destra la pagina si riempie lo stesso, ma con contenuto
          invece che con caselle stirate. */}
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ContactForm dictionary={t} />
        <ContactInfo locale={locale} dictionary={t} />
      </div>
    </Section>
  );
}
