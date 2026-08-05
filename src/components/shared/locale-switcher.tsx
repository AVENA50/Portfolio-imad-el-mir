"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import { LOCALES, LOCALE_META, type Locale } from "@/config/i18n";
import { localeFromPathname, stripLocale } from "@/config/navigation";
import { cn } from "@/lib/cn";

interface LocaleSwitcherProps {
  /** Etichetta accessibile, tradotta: dictionary.localeSwitcher.label */
  label: string;
  className?: string;
}

interface Indicator {
  left: number;
  width: number;
  visible: boolean;
}

const HIDDEN: Indicator = { left: 0, width: 0, visible: false };

/**
 * Selettore di lingua.
 *
 * Cambia solo il primo segmento del path, quindi resti sulla stessa pagina:
 * /it/projects/arcadium diventa /en/projects/arcadium. Salva la scelta in un
 * cookie, cosi il middleware la rispetta alle visite successive.
 *
 * Stesso indicatore scorrevole del menu principale: una pill di vetro che
 * si sposta sulla lingua puntata e a riposo torna su quella attiva.
 */
export function LocaleSwitcher({ label, className }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState<Indicator>(HIDDEN);

  const current = localeFromPathname(pathname);

  const moveTo = useCallback((target: HTMLElement | null) => {
    const list = listRef.current;
    if (!list || !target) {
      setIndicator(HIDDEN);
      return;
    }

    const listBox = list.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();

    setIndicator({
      left: targetBox.left - listBox.left,
      width: targetBox.width,
      visible: true,
    });
  }, []);

  const settle = useCallback(() => {
    moveTo(activeRef.current);
  }, [moveTo]);

  useEffect(() => {
    settle();

    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [settle, current]);

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
      ref={listRef}
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
          "glass pointer-events-none absolute inset-y-1 -z-0 rounded-pill",
          "transition-[transform,width,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          indicator.visible ? "opacity-100" : "opacity-0",
        )}
        style={{
          width: `${indicator.width}px`,
          transform: `translateX(${indicator.left}px)`,
        }}
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
