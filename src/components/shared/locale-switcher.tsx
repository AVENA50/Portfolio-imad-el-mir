"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, LOCALE_META, type Locale } from "@/config/i18n";
import { localeFromPathname, stripLocale } from "@/config/navigation";
import {
  INDICATOR_CLASSES,
  useSlidingIndicator,
} from "@/hooks/use-sliding-indicator";
import { cn } from "@/lib/cn";

interface LocaleSwitcherProps {
  /** Etichetta accessibile, tradotta: dictionary.localeSwitcher.label */
  label: string;
  className?: string;
}

/**
 * Selettore di lingua.
 *
 * Cambia solo il primo segmento del path, quindi resti sulla stessa pagina:
 * /it/projects/arcadium diventa /en/projects/arcadium.
 *
 * **Sono link, non bottoni**, e la differenza si sente. Next precarica i
 * link appena entrano nella viewport: quando clicchi, la pagina nell'altra
 * lingua e gia scaricata e il passaggio e istantaneo. Con un bottone e
 * `router.push` il download comincia al click, e si aspetta.
 *
 * In piu un link e la cosa giusta anche a prescindere dalla velocita: si
 * apre in una nuova scheda col tasto centrale, si copia col tasto destro, e
 * `hreflang` dice ai motori di ricerca che quella e la stessa pagina in
 * un'altra lingua.
 *
 * Il cookie viene scritto nel click **senza bloccare la navigazione**: non
 * c'e preventDefault, il link fa il suo lavoro subito dopo. Serve solo
 * perche la prossima volta che arrivi su un indirizzo senza prefisso il
 * middleware sappia dove mandarti.
 */
export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const pathname = usePathname();

  const current = localeFromPathname(pathname);
  const rest = stripLocale(pathname);

  const { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle } =
    useSlidingIndicator<HTMLDivElement, HTMLAnchorElement>(current);

  function remember(locale: Locale) {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={label}
      onMouseLeave={settle}
      className={cn("relative inline-flex items-center gap-1 p-1", className)}
    >
      <span
        aria-hidden
        className={cn(
          INDICATOR_CLASSES,
          "inset-y-1",
          indicator.visible ? "opacity-100" : "opacity-0",
        )}
        style={indicatorStyle}
      />

      {LOCALES.map((locale) => {
        const isActive = locale === current;
        const href = rest === "/" ? `/${locale}` : `/${locale}${rest}`;

        return (
          <Link
            key={locale}
            ref={isActive ? activeRef : undefined}
            href={href}
            hrefLang={LOCALE_META[locale].htmlLang}
            lang={locale}
            // La pagina corrente non si precarica: e gia qui.
            prefetch={isActive ? false : undefined}
            onClick={() => remember(locale)}
            onMouseEnter={(event) => moveTo(event.currentTarget)}
            onFocus={(event) => moveTo(event.currentTarget)}
            onBlur={settle}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "relative z-10 rounded-pill px-5 py-2.5 text-base font-bold transition-colors",
              isActive ? "text-ink" : "text-ink/60 hover:text-ink",
            )}
          >
            <span className="sr-only">{LOCALE_META[locale].label}</span>
            <span aria-hidden>{LOCALE_META[locale].shortLabel}</span>
          </Link>
        );
      })}
    </div>
  );
}
