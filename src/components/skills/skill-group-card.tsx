import Link from "next/link";

import { Icon } from "@/components/shared/icon";
import { TechIcon } from "@/components/shared/tech-icon";
import { Card } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import type { Skill, SkillGroup } from "@/data/skills";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { Accent } from "@/types";

interface SkillGroupCardProps {
  group: SkillGroup;
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Classi per accento, scritte per intero.
 *
 * Tailwind cerca stringhe letterali nel sorgente: `bg-${accent}-500/12` non
 * verrebbe mai generata, e le pillole resterebbero trasparenti. E la stessa
 * ragione per cui Badge tiene una tabella come questa.
 */
const ACCENT_PROVEN: Record<Accent, string> = {
  violet: "border-violet-500/30 bg-violet-500/12 text-violet-300",
  blue: "border-blue-500/30 bg-blue-500/12 text-blue-300",
  indigo: "border-indigo-500/30 bg-indigo-500/12 text-indigo-300",
  cyan: "border-cyan-400/30 bg-cyan-400/12 text-cyan-300",
  teal: "border-teal-400/30 bg-teal-400/12 text-teal-300",
  green: "border-emerald-500/30 bg-emerald-500/12 text-emerald-300",
};

const ACCENT_HOVER: Record<Accent, string> = {
  violet: "hover:border-violet-500/60 hover:bg-violet-500/20",
  blue: "hover:border-blue-500/60 hover:bg-blue-500/20",
  indigo: "hover:border-indigo-500/60 hover:bg-indigo-500/20",
  cyan: "hover:border-cyan-400/60 hover:bg-cyan-400/20",
  teal: "hover:border-teal-400/60 hover:bg-teal-400/20",
  green: "hover:border-emerald-500/60 hover:bg-emerald-500/20",
};

const ACCENT_ICON: Record<Accent, string> = {
  violet: "border-violet-500/25 bg-violet-500/12 text-violet-300",
  blue: "border-blue-500/25 bg-blue-500/12 text-blue-300",
  indigo: "border-indigo-500/25 bg-indigo-500/12 text-indigo-300",
  cyan: "border-cyan-400/25 bg-cyan-400/12 text-cyan-300",
  teal: "border-teal-400/25 bg-teal-400/12 text-teal-300",
  green: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
};

/**
 * Una competenza.
 *
 * Quando e dimostrata da un progetto diventa un link a quel progetto: e il
 * punto di tutta la pagina. Un elenco di parole lo scrive chiunque; un
 * elenco in cui ogni parola porta al codice che la dimostra e un'altra
 * cosa.
 *
 * Le competenze in apprendimento restano testo, con il bordo tratteggiato
 * e senza fondo: non hanno dove portare, e fingere che ce l'abbiano
 * sarebbe peggio che ammetterlo.
 */
function SkillPill({
  skill,
  accent,
  locale,
}: {
  skill: Skill;
  accent: Accent;
  locale: Locale;
}) {
  const isProven = skill.level === "proven";
  const target = skill.projects?.[0];

  const content = (
    <>
      {skill.tech ? (
        <TechIcon slug={skill.tech} brandColor className="size-4" />
      ) : (
        <Icon name={skill.icon ?? "code"} className="size-4" />
      )}

      <span className="text-sm font-medium">{skill.name}</span>

      {target && (
        <Icon
          name="arrow-up-right"
          className="size-3.5 opacity-60 transition-transform duration-200 group-hover/skill:translate-x-0.5 group-hover/skill:-translate-y-0.5"
        />
      )}
    </>
  );

  const className = cn(
    "inline-flex items-center gap-2.5 rounded-pill border px-3.5 py-2 transition-colors",
    isProven
      ? ACCENT_PROVEN[accent]
      : "border-dashed border-border-strong text-ink-subtle",
  );

  if (target) {
    return (
      <li>
        <Link
          href={localePath(locale, `/projects/${target}`)}
          className={cn(className, "group/skill", ACCENT_HOVER[accent])}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <span className={className}>{content}</span>
    </li>
  );
}

/**
 * Un gruppo di competenze (M9-T2).
 *
 * Dentro la card le competenze sono ordinate: prima quelle dimostrate,
 * poi quelle in studio. L'ordine non e alfabetico di proposito — chi
 * scorre veloce deve incontrare prima cio che e gia solido.
 */
export function SkillGroupCard({
  group,
  locale,
  dictionary,
}: SkillGroupCardProps) {
  const proven = group.skills.filter((skill) => skill.level === "proven");
  const learning = group.skills.filter((skill) => skill.level === "learning");

  return (
    <Card surface="flat" padding="lg" className="glow-hover h-full">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-card border",
            ACCENT_ICON[group.accent],
          )}
        >
          <Icon name={group.icon} className="size-5" />
        </span>

        <h3 className="font-display text-lg font-bold text-ink">
          {
            dictionary.skills.groups[
              group.key as keyof Dictionary["skills"]["groups"]
            ]
          }
        </h3>
      </div>

      {proven.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {proven.map((skill) => (
            <SkillPill
              key={skill.name}
              skill={skill}
              accent={group.accent}
              locale={locale}
            />
          ))}
        </ul>
      )}

      {learning.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-xs tracking-wide text-ink-subtle uppercase">
            {dictionary.skills.learning}
          </p>

          <ul className="mt-3 flex flex-wrap gap-2">
            {learning.map((skill) => (
              <SkillPill
                key={skill.name}
                skill={skill}
                accent={group.accent}
                locale={locale}
              />
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
