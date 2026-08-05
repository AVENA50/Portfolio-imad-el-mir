"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Locale } from "@/config/i18n";
import { MAIN_NAV, isNavItemActive, localePath } from "@/config/navigation";
import { cn } from "@/lib/cn";
import type { NavKey } from "@/types";

interface NavDesktopProps {
  locale: Locale;
  /** Etichette tradotte: dictionary.nav */
  labels: Record<NavKey, string>;
}

interface Indicator {
  left: number;
  width: number;
  visible: boolean;
}

const HIDDEN: Indicator = { left: 0, width: 0, visible: false };

/**
 * Navigazione desktop con indicatore di vetro scorrevole.
 *
 * La pill non e un bordo su ogni voce: e un solo elemento assoluto che si
 * sposta e si ridimensiona sulla voce puntata, con una transizione elastica.
 * A riposo torna sulla pagina corrente.
 *
 * La posizione va misurata a runtime perche dipende dalla larghezza del
 * testo, che cambia con la lingua: "Chi sono" e "About" non sono larghi
 * uguale. Per questo il componente e client.
 */
export function NavDesktop({ locale, labels }: NavDesktopProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [indicator, setIndicator] = useState<Indicator>(HIDDEN);

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

  /** A riposo l'indicatore sta sulla voce attiva. */
  const settle = useCallback(() => {
    moveTo(activeRef.current);
  }, [moveTo]);

  // Posizione iniziale e riallineamento quando cambia pagina, lingua
  // o larghezza della finestra.
  useEffect(() => {
    settle();

    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }, [settle, pathname, labels]);

  return (
    <nav aria-label="Principale" className="hidden lg:block">
      <ul
        ref={listRef}
        onMouseLeave={settle}
        className="relative flex items-center gap-1.5"
      >
        {/* L'indicatore: un solo elemento per tutta la barra */}
        <span
          aria-hidden
          className={cn(
            "glass rounded-pill pointer-events-none absolute inset-y-0 -z-0",
            "transition-[transform,width,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            indicator.visible ? "opacity-100" : "opacity-0",
          )}
          style={{
            width: `${indicator.width}px`,
            transform: `translateX(${indicator.left}px)`,
          }}
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
                  "rounded-pill block px-7 py-3.5 text-lg font-medium transition-colors",
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
