import { Reveal } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface AboutStoryProps {
  dictionary: Dictionary;
}

/**
 * Le chiavi del racconto, nell'ordine in cui vanno lette.
 *
 * L'array vive qui e non nel dizionario perche l'ordine e struttura, non
 * traduzione: cambiando lingua il racconto resta fisica, poi software, poi
 * dove voglio arrivare. Se stesse nel JSON, una delle due lingue potrebbe
 * finire fuori ordine senza che nessuno se ne accorga.
 */
const CHAPTERS = [
  { key: "physics", icon: "activity" },
  { key: "data", icon: "database" },
  { key: "next", icon: "target" },
] as const satisfies readonly { key: string; icon: IconName }[];

/**
 * Il percorso in tre capitoli.
 *
 * Numerati, non puntati: il senso e che uno viene dopo l'altro. Una lista
 * puntata direbbe che sono tre fatti scollegati, e non lo sono — il terzo
 * ha senso solo se hai letto i primi due.
 */
export function AboutStory({ dictionary }: AboutStoryProps) {
  const t = dictionary.about;

  return (
    <Section tone="subtle" spacing="md">
      <SectionHeading eyebrow={t.storyEyebrow} title={t.storyTitle} />

      <ol className="mt-12 flex flex-col gap-10">
        {CHAPTERS.map((chapter, index) => {
          const text = t.story[chapter.key];

          return (
            <li key={chapter.key}>
              {/* Reveal renderizza un <div>, e fra <ol> e <li> ci puo stare
                  solo un <li>: sta dentro, non attorno. */}
              <Reveal
                direction="up"
                delay={index * 80}
                className="grid gap-5 md:grid-cols-[auto_1fr] md:gap-8"
              >
                <div className="flex items-center gap-4 md:flex-col md:gap-3">
                  <span className="glass inline-flex size-14 items-center justify-center rounded-panel text-violet-300">
                    <Icon name={chapter.icon} className="size-6" />
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-sm text-ink-subtle"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="max-w-3xl">
                  <h3 className="font-display text-2xl font-bold text-ink">
                    {text.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-muted">
                    {text.body}
                  </p>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
