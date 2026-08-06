import { Icon } from "@/components/shared/icon";
import type { Locale } from "@/config/i18n";
import { SITE } from "@/config/site";
import { LOCATION } from "@/data/about";
import { SOCIAL_LINKS } from "@/data/social";
import type { Dictionary } from "@/lib/dictionary";

interface ContactInfoProps {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Il blocco accanto al form (M9-T9).
 *
 * **Perche esiste, visto che il form c'e gia.** Non tutti scrivono da un
 * form: chi vuole aggiungerti un allegato, chi preferisce scriverti dal
 * telefono, chi vuole solo controllare che l'indirizzo sia vero prima di
 * fidarsi. Un form da solo e una scatola nera — non sai dove va a finire
 * quello che scrivi ne se qualcuno lo leggera.
 *
 * Per questo l'email e scritta per esteso e cliccabile, e c'e una riga sui
 * tempi di risposta: sono le due cose che tolgono l'incertezza.
 *
 * Resta un Server Component: e solo markup, non serve JavaScript.
 */
export function ContactInfo({ locale, dictionary }: ContactInfoProps) {
  const t = dictionary.contact;

  // Il CV ha gia il suo bottone altrove: qui restano i profili.
  const profiles = SOCIAL_LINKS.filter((link) => link.label !== "CV");

  return (
    <div className="flex flex-col gap-6">
      <div className="glass rounded-panel p-7">
        <h2 className="font-display text-lg font-bold text-ink">
          {t.info.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {t.info.description}
        </p>

        <a
          href={`mailto:${SITE.email}`}
          className="glow-hover mt-6 flex items-center gap-3.5 rounded-card border border-border bg-surface px-4 py-3.5 transition-colors hover:border-violet-500/40"
        >
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
            <Icon name="mail" className="size-4" />
          </span>

          <span className="min-w-0">
            <span className="block text-xs text-ink-subtle">
              {t.info.emailLabel}
            </span>
            {/* `break-all` perche un indirizzo lungo su schermo stretto
                sfonderebbe la card invece di andare a capo: nelle email non
                ci sono spazi dove il browser possa spezzare. */}
            <span className="block text-sm font-medium break-all text-ink">
              {SITE.email}
            </span>
          </span>
        </a>
      </div>

      <div className="glass rounded-panel p-7">
        <ul className="flex flex-col gap-5">
          <li className="flex items-start gap-3.5">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
              <Icon name="globe" className="size-4" />
            </span>
            <div>
              <p className="text-xs text-ink-subtle">{t.info.locationLabel}</p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {LOCATION[locale]}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3.5">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-badge border border-violet-500/25 bg-violet-500/12 text-violet-300">
              <Icon name="clock" className="size-4" />
            </span>
            <div>
              <p className="text-xs text-ink-subtle">{t.info.responseLabel}</p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {t.info.responseValue}
              </p>
            </div>
          </li>

          <li className="flex items-start gap-3.5">
            {/* Verde perche e lo stesso colore dello stato "disponibile"
                usato altrove nel sito: un colore deve voler dire una cosa
                sola, sempre. */}
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-badge border border-emerald-500/25 bg-emerald-500/12 text-emerald-300">
              <Icon name="check" className="size-4" />
            </span>
            <div>
              <p className="text-xs text-ink-subtle">
                {t.info.availabilityLabel}
              </p>
              <p className="mt-0.5 text-sm font-medium text-ink">
                {dictionary.status.available}
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="glass rounded-panel p-7">
        <p className="text-xs tracking-wide text-ink-subtle uppercase">
          {t.info.socialLabel}
        </p>

        <ul className="mt-4 flex gap-3">
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
  );
}
