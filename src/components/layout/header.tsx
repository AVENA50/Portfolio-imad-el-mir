import Link from "next/link";

import { HeaderBackdrop } from "@/components/layout/header-backdrop";
import { NavDesktop } from "@/components/layout/nav-desktop";
import { NavMobile } from "@/components/layout/nav-mobile";
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
 * Resta agganciato in cima su qualunque schermo. Perche funzioni, nessun
 * antenato deve avere `overflow` diverso da `visible` ne una proprieta che
 * crei un contenitore — `transform`, `filter`, `backdrop-filter`: e la
 * ragione per cui l'header e figlio diretto del `body` e per cui il vetro
 * sta in `HeaderBackdrop` invece che qui sopra.
 *
 * Lo sfondo non c'e a pagina ferma — il nome galleggia sul cielo stellato —
 * e compare scorrendo, quando serve a tenere leggibile il menu sopra il
 * contenuto. Se ne occupa `HeaderBackdrop`, l'unico pezzo che deve girare
 * nel browser: tutto il resto e reso sul server.
 */
export function Header({ locale, dictionary }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50">
      {/* Primo nel DOM e senza z-index: resta sotto al contenuto della
          barra per semplice ordine di disegno, senza aprire una gara di
          livelli con il drawer mobile che vive qui dentro. */}
      <HeaderBackdrop />

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
          <div className="hidden lg:block">
            <LocaleSwitcher label={dictionary.localeSwitcher.label} />
          </div>

          <NavMobile locale={locale} dictionary={dictionary} />

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
