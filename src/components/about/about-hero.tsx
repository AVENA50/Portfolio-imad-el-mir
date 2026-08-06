import Link from "next/link";

import { PortraitFrame } from "@/components/about/portrait-frame";
import { Section } from "@/components/shared";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { SITE } from "@/config/site";
import { EDUCATION, LOCATION, PROFILE_PHOTO } from "@/data/about";
import { SOCIAL_LINKS } from "@/data/social";
import type { Tech } from "@/config/tech-stack";
import type { Dictionary } from "@/lib/dictionary";
import type { IconName } from "@/types";

interface AboutHeroProps {
  locale: Locale;
  dictionary: Dictionary;
  /** Linguaggio dedotto dai progetti, per il pannello nella cornice. */
  language: Tech | null;
}

/** "Imad El Mir" diventa "IM". */
function monogram(name: string): string {
  const words = name.trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * Apertura della pagina "Chi sono".
 *
 * I tre riquadri sotto il testo sono **dedotti**, non scritti: la citta
 * arriva da `LOCATION`, il corso in corso e il primo elemento della
 * formazione senza data di fine, quello precedente e il successivo. Il
 * giorno in cui l'ITS finisce e ne comincia un altro, questa sezione si
 * aggiorna da sola invece di raccontare una cosa vecchia.
 *
 * I link social non sono ricopiati qui: sono gli stessi di header e footer,
 * filtrati per togliere il CV, che ha gia il suo bottone due righe sopra.
 */
export function AboutHero({ locale, dictionary, language }: AboutHeroProps) {
  const t = dictionary.about;

  const current = EDUCATION.find((entry) => !entry.endDate);
  const previous = EDUCATION.find((entry) => entry !== current);

  const facts: { icon: IconName; value: string; label: string }[] = [
    { icon: "globe", value: LOCATION[locale], label: t.factLocation },
    {
      icon: "target",
      value: current?.institution ?? "",
      label: t.factStudying,
    },
    {
      // Ateneo e citta si compongono dai dati invece di essere riscritti:
      // il nome dell'universita esiste gia in data/about.ts e ripeterlo qui
      // vorrebbe dire due posti da correggere se sbagliassi un accento.
      icon: "activity",
      value: t.factBeforeValue,
      label: previous
        ? `${previous.institution} · ${previous.location}`
        : t.factStudying,
    },
  ];

  const profiles = SOCIAL_LINKS.filter((link) => link.label !== "CV");

  return (
    // Due scelte in una riga di classi.
    //
    // `overflow-x-clip` sta sulla sezione e non sul contenitore: i riquadri
    // fluttuanti sporgono oltre la cornice apposta, e a certe larghezze di
    // finestra farebbero comparire la barra di scorrimento orizzontale. Il
    // taglio avviene ai bordi della finestra, quindi non si vede nulla di
    // tagliato. `clip` e non `hidden`, perche `hidden` creerebbe un
    // contenitore di scorrimento e romperebbe gli sticky altrove.
    //
    // Poco spazio sopra e piu sotto: sopra c'e gia l'header a distanziare,
    // mentre sotto il podio sporge oltre il fondo della cornice. Cosi
    // l'apertura entra in uno schermo senza doverla inseguire scorrendo.
    <Section spacing="none" className="overflow-x-clip pt-8 pb-16 md:pt-14">
      <div className="grid items-center gap-16 lg:grid-cols-[1fr_0.95fr] lg:gap-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill border border-violet-500/30 bg-violet-500/12 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-violet-300 uppercase">
            <span aria-hidden className="size-2 rounded-full bg-violet-400" />
            {t.eyebrow}
          </span>

          <h1 className="mt-6 text-h1">
            {t.titleLead}{" "}
            {/* Il gradiente sul testo e `background-clip`: il colore vero
                resta sotto come fallback, quindi se un browser non supporta
                il ritaglio il titolo si legge lo stesso invece di sparire. */}
            <span className="bg-brand-gradient bg-clip-text text-transparent text-violet-400">
              {t.titleAccent}
            </span>
          </h1>

          <p className="mt-4 text-lg text-ink-muted">{t.subtitle}</p>

          <div className="mt-7 flex max-w-2xl flex-col gap-4 leading-relaxed text-ink-muted">
            <p>{t.leadOne}</p>
            <p>{t.leadTwo}</p>
          </div>

          <ul className="mt-9 flex flex-wrap gap-3">
            {facts.map((fact) => (
              <li
                key={fact.label + fact.value}
                className="glass flex items-start gap-3 rounded-card px-4 py-3"
              >
                <Icon
                  name={fact.icon}
                  className="mt-0.5 size-4 shrink-0 text-violet-300"
                />
                <div>
                  <p className="text-sm font-semibold text-ink">{fact.value}</p>
                  <p className="mt-0.5 text-xs text-ink-subtle">{fact.label}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild iconRight="arrow-right">
              <Link href={localePath(locale, "/contact")}>
                {dictionary.actions.getInTouch}
              </Link>
            </Button>

            <Button asChild variant="secondary" iconLeft="download">
              {/* Il CV e un file, non una rotta: niente prefisso di lingua e
                  niente prefetch, che su un PDF non ha senso. */}
              <a href={SITE.resumePath} download>
                {dictionary.actions.downloadCv}
              </a>
            </Button>
          </div>

          <div className="mt-10">
            <p className="text-xs tracking-wide text-ink-subtle uppercase">
              {t.followLabel}
            </p>

            <ul className="mt-3 flex gap-3">
              {profiles.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="glass glow-hover inline-flex size-12 items-center justify-center rounded-card text-ink-muted transition-colors hover:text-ink"
                  >
                    <Icon name={link.icon} className="size-5" />
                    <span className="sr-only">{link.srLabel}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <PortraitFrame
          photoSrc={PROFILE_PHOTO}
          photoAlt={t.photoAlt}
          monogram={monogram(SITE.name)}
          language={language}
          dictionary={dictionary}
        />
      </div>
    </Section>
  );
}
