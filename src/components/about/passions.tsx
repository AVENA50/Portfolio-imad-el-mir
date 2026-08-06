import { Section } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface PassionsProps {
  dictionary: Dictionary;
}

/**
 * Le cinque voci, nell'ordine in cui vanno lette.
 *
 * Cinque e il numero giusto perche stanno su una riga sola: la striscia
 * deve leggersi con un colpo d'occhio, e una seconda riga la trasforma in
 * un elenco da scorrere. L'ordine e struttura e sta qui, non nel
 * dizionario: prima i due domini, poi i due mestieri, poi il modo di
 * lavorare. Se vivesse nel JSON, una delle due lingue potrebbe finire
 * mescolata senza che nessuno se ne accorga.
 */
const PASSIONS = [
  { key: "bi", icon: "chart" },
  { key: "ai", icon: "brain" },
  { key: "software", icon: "code" },
  { key: "data", icon: "database" },
  { key: "learning", icon: "lightbulb" },
] as const satisfies readonly { key: string; icon: IconName }[];

/**
 * Striscia delle aree di interesse.
 *
 * Su schermo largo e una riga sola di cinque riquadri, come nel mockup.
 * Scendendo diventa due colonne e poi una: cinque riquadri affiancati su
 * un telefono sarebbero larghi quaranta pixel l'uno.
 */
export function Passions({ dictionary }: PassionsProps) {
  const t = dictionary.about;

  return (
    <Section spacing="none" className="pb-20">
      <div className="glass rounded-panel p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-wide text-ink uppercase">
            <Icon name="sparkles" className="size-4 text-violet-300" />
            {t.passionsLabel}
          </p>

          <ul className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {PASSIONS.map((passion) => {
              const text = t.passions[passion.key];

              return (
                <li key={passion.key} className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
                    <Icon name={passion.icon} className="size-4.5" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-semibold text-ink">
                      {text.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-ink-subtle">
                      {text.subtitle}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Section>
  );
}
