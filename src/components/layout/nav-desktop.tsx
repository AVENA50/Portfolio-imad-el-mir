"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/config/i18n";
import { MAIN_NAV, isNavItemActive, localePath } from "@/config/navigation";
import {
  INDICATOR_CLASSES,
  useSlidingIndicator,
} from "@/hooks/use-sliding-indicator";
import { cn } from "@/lib/cn";
import type { NavKey } from "@/types";

interface NavDesktopProps {
  locale: Locale;
  /** Etichette tradotte: dictionary.nav */
  labels: Record<NavKey, string>;
}

/**
 * Navigazione desktop con indicatore di vetro scorrevole.
 *
 * La pill non e un bordo su ogni voce: e un solo elemento che si sposta
 * sulla voce puntata e a riposo torna sulla pagina corrente. La logica
 * sta in useSlidingIndicator, condivisa con switcher di lingua e Tabs.
 */
export function NavDesktop({ locale, labels }: NavDesktopProps) {
  const pathname = usePathname();
  const { containerRef, activeRef, indicator, indicatorStyle, moveTo, settle } =
    useSlidingIndicator<HTMLUListElement, HTMLAnchorElement>(pathname);

  return (
    <nav aria-label="Principale" className="hidden lg:block">
      <ul
        ref={containerRef}
        onMouseLeave={settle}
        className="relative flex items-center gap-1.5"
      >
        <span
          aria-hidden
          className={cn(
            INDICATOR_CLASSES,
            "inset-y-0",
            indicator.visible ? "opacity-100" : "opacity-0",
          )}
          style={indicatorStyle}
        />

        {MAIN_NAV.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <li key={item.key} className="relative z-10">
              <Link
                ref={isActive ? activeRef : undefined}
                href={localePath(locale, item.href)}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={(event) => moveTo(event.currentTarget)}
                onFocus={(event) => moveTo(event.currentTarget)}
                onBlur={settle}
                className={cn(
                  "block rounded-pill px-7 py-3.5 text-lg font-medium transition-colors",
                  isActive ? "text-ink" : "text-ink/85 hover:text-ink",
                )}
              >
                {labels[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
