import Link from "next/link";

import { NavDesktop } from "@/components/layout/nav-desktop";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { localePath } from "@/config/navigation";
import { SITE } from "@/config/site";
import type { Dictionary } from "@/lib/dictionary";

interface HeaderProps {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Header sticky.
 *
 * Tre zone su una riga: nome a sinistra, navigazione al centro, azioni a
 * destra. Il nav e centrato in assoluto rispetto alla finestra, non fra i
 * due blocchi laterali: cosi resta al centro anche se il nome e le azioni
 * hanno larghezze diverse — e le hanno, perche cambiano con la lingua.
 *
 * Server component: gli unici pezzi interattivi sono il nav e lo switcher.
 * Il drawer mobile arriva in M3-T4.
 */
export function Header({ locale, dictionary }: HeaderProps) {
  return (
    // Nessuno sfondo: l'header e fuso col body e lascia passare le stelle.
    // A dare corpo ai controlli ci pensano il vetro dello switcher, del
    // bottone CV e la pill scorrevole del menu.
    <header className="sticky top-0 z-50">
      <div className="relative mx-auto flex h-20 max-w-[110rem] items-center justify-between gap-6 px-6 lg:px-10">
        <Link
          href={localePath(locale, "/")}
          className="group flex shrink-0 items-center gap-3"
        >
          <span
            aria-hidden
            className="size-3 rounded-pill bg-blue-500 transition-colors group-hover:bg-violet-500"
          />
          <span className="font-display text-xl font-extrabold tracking-[0.14em] uppercase lg:text-2xl">
            {SITE.name}
          </span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          <NavDesktop locale={locale} labels={dictionary.nav} />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LocaleSwitcher label={dictionary.localeSwitcher.label} />

          <Button
            asChild
            variant="secondary"
            iconLeft="download"
            className="hidden sm:inline-flex"
          >
            <a href={SITE.resumePath} download>
              {dictionary.actions.downloadCv}
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
