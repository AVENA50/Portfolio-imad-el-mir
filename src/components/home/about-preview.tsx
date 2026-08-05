import Link from "next/link";

import { Reveal } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { EDUCATION, LANGUAGES, LOCATION } from "@/data/about";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface AboutPreviewProps {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Anteprima di "Chi sono" in home (M8-T5).
 *
 * Non e la pagina About in miniatura: e l'amo. Due paragrafi che dicono
 * chi sei e cosa cerchi, tre fatti verificabili accanto, e un invito ad
 * andare avanti. Chi vuole i dettagli clicca; chi voleva solo capire con
 * chi ha a che fare ha gia finito.
 *
 * I fatti a destra sono **dedotti dai dati** (data/about.ts): il corso in
 * corso e il primo elemento della formazione senza data di fine, le lingue
 * si contano. Scriverli qui a mano significherebbe che fra sei mesi la
 * home direbbe una cosa e la pagina About un'altra.
 */
export function AboutPreview({ locale, dictionary }: AboutPreviewProps) {
  // Il percorso in corso: il primo senza data di fine.
  const current = EDUCATION.find((entry) => !entry.endDate);

  const facts: { icon: IconName; label: string; value: string }[] = [
    {
      icon: "globe",
      label: dictionary.home.about.factLocation,
      value: LOCATION[locale],
    },
    {
      icon: "target",
      label: dictionary.home.about.factStudying,
      value: current?.institution ?? "",
    },
    {
      icon: "users",
      label: dictionary.home.about.factLanguages,
      value: LANGUAGES.map(
        (language) => dictionary.home.about.languages[language.key],
      ).join(", "),
    },
  ];

  return (
    <Section spacing="md">
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <SectionHeading
            eyebrow={dictionary.home.about.eyebrow}
            title={dictionary.home.about.title}
          />

          <div className="mt-8 flex flex-col gap-5 leading-relaxed text-ink-muted">
            <p className="text-lg">{dictionary.home.about.paragraphOne}</p>
            <p className="text-lg">{dictionary.home.about.paragraphTwo}</p>
            {/* L'ultimo paragrafo dice cosa cerchi: piu piccolo e in colore
                pieno, cosi si stacca dal racconto e si legge come una
                richiesta invece che come un'altra frase di biografia. */}
            <p className="text-base text-ink">
              {dictionary.home.about.paragraphThree}
            </p>
          </div>

          <Button
            asChild
            variant="secondary"
            iconRight="arrow-right"
            className="mt-10"
          >
            <Link href={localePath(locale, "/about")}>
              {dictionary.home.about.cta}
            </Link>
          </Button>
        </div>

        <Reveal direction="up">
          <ul className="glass flex flex-col gap-6 rounded-panel p-8">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-card border border-violet-500/25 bg-violet-500/12 text-violet-300">
                  <Icon name={fact.icon} className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs tracking-wide text-ink-subtle uppercase">
                    {fact.label}
                  </p>
                  <p className="mt-1 leading-snug font-medium text-ink">
                    {fact.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
