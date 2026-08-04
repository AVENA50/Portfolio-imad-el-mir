"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { LOCALES, LOCALE_META, type Locale } from "@/config/i18n";
import { localeFromPathname, stripLocale } from "@/config/navigation";
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
 * cookie, cosi il middleware la rispetta ai visite successive.
 */
export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = localeFromPathname(pathname);

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
      role="group"
      aria-label={label}
      className={cn(
        "border-border bg-surface inline-flex items-center gap-0.5 rounded-pill border p-0.5",
        isPending && "opacity-60",
        className,
      )}
    >
      {LOCALES.map((locale) => {
        const isActive = locale === current;

        return (
          <button
            key={locale}
            type="button"
            lang={locale}
            onClick={() => switchTo(locale)}
            aria-current={isActive ? "true" : undefined}
            disabled={isPending}
            className={cn(
              "rounded-pill px-2.5 py-1 text-xs font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-fg"
                : "text-ink-subtle hover:text-ink",
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
