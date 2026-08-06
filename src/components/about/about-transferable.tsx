import { Reveal } from "@/components/effects";
import { Section, SectionHeading } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import { Card } from "@/components/ui";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface AboutTransferableProps {
  dictionary: Dictionary;
}

const ITEMS = [
  { key: "audience", icon: "chart" },
  { key: "clients", icon: "users" },
  { key: "discipline", icon: "trophy" },
] as const satisfies readonly { key: string; icon: IconName }[];

/**
 * Cosa lascia in eredita il lavoro non tecnico.
 *
 * Questa sezione esiste per una scelta presa in `data/about.ts`: le
 * esperienze da content creator e da personal trainer non si nascondono.
 * Su un primo portfolio la domanda che si fa chi legge non e "ha gia fatto
 * lo sviluppatore" — lo sa che non l'hai fatto — ma "questa persona
 * conclude le cose". Quelle due esperienze rispondono, purche il
 * collegamento sia scritto invece che lasciato intuire.
 */
export function AboutTransferable({ dictionary }: AboutTransferableProps) {
  const t = dictionary.about;

  return (
    <Section spacing="md">
      <SectionHeading
        eyebrow={t.bringEyebrow}
        title={t.bringTitle}
        description={t.bringDescription}
      />

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {ITEMS.map((item, index) => {
          const text = t.bring[item.key];

          return (
            <li key={item.key} className="flex">
              <Reveal direction="up" delay={index * 80} className="flex w-full">
                <Card className="glow-hover flex h-full flex-col p-7">
                  <span className="inline-flex size-12 items-center justify-center rounded-card border border-violet-500/25 bg-violet-500/12 text-violet-300">
                    <Icon name={item.icon} className="size-5" />
                  </span>

                  <h3 className="mt-5 font-display text-lg leading-snug font-bold text-ink">
                    {text.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {text.body}
                  </p>
                </Card>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
