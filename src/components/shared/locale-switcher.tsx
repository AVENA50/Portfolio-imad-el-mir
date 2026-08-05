"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

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
 * /it/projects/arcadium diventa /en/projects/arcadium. Salva la scelta in un
 * cookie, cosi il middleware la rispetta alle visite successive.
 */
export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = localeFromPathname(pathname);
  const { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle } =
    useSlidingIndicator<HTMLDivElement, HTMLButtonElement>(current);

  function switchTo(locale: Locale) {
    if (locale === current) return;

    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;samesite=lax`;

    const rest = stripLocale(pathname);
    startTransition(() => {
      router.push(rest === "/" ? `/${locale}` : `/${locale}${rest}`);
      router.refresh();
    });
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={label}
      onMouseLeave={settle}
      className={cn(
        "relative inline-flex items-center gap-1 p-1",
        isPending && "opacity-60",
        className,
      )}
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

        return (
          <button
            key={locale}
            ref={isActive ? activeRef : undefined}
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
            onMouseEnter={(event) => moveTo(event.currentTarget)}
            onFocus={(event) => moveTo(event.currentTarget)}
            onBlur={settle}
            aria-current={isActive ? "true" : undefined}
            disabled={isPending}
            className={cn(
              "relative z-10 rounded-pill px-5 py-2.5 text-base font-bold transition-colors",
              isActive ? "text-ink" : "text-ink/60 hover:text-ink",
            )}
          >
            <span className="sr-only">{LOCALE_META[locale].label}</span>
            <span aria-hidden>{LOCALE_META[locale].shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
