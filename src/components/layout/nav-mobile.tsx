"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/shared/icon";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { MAIN_NAV, isNavItemActive, localePath } from "@/config/navigation";
import { SITE } from "@/config/site";
import { SOCIAL_LINKS } from "@/data/social";
import { useIsDesktop } from "@/hooks/use-media-query";
import { useLockScroll } from "@/hooks/use-lock-scroll";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";

interface NavMobileProps {
  locale: Locale;
  dictionary: Dictionary;
}

/** Elementi che possono ricevere il focus dentro il drawer. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Drawer di navigazione mobile.
 *
 * Un pannello a tutto schermo va trattato come una finestra modale, e questo
 * comporta quattro obblighi che spesso vengono saltati:
 *
 * 1. **Focus trap** — con Tab non si esce dal drawer. Senza, la tabulazione
 *    prosegue nella pagina sottostante che l'utente non vede: chi naviga da
 *    tastiera si ritrova a interagire con qualcosa di invisibile.
 * 2. **Esc chiude** — e il gesto che tutti si aspettano.
 * 3. **Il focus torna al bottone** che ha aperto il pannello, invece di
 *    ripartire da capo.
 * 4. **Lo scroll di fondo si blocca**, senza far saltare la pagina.
 *
 * Il drawer si chiude anche quando la finestra si allarga fino al desktop:
 * altrimenti resterebbe montato e invisibile, con il focus intrappolato.
 */
export function NavMobile({ locale, dictionary }: NavMobileProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isDesktop = useIsDesktop();
  useLockScroll(isOpen);

  const close = useCallback(() => setIsOpen(false), []);

  // Si chiude cambiando pagina: il click su una voce naviga e basta
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Si chiude passando al desktop
  useEffect(() => {
    if (isDesktop) close();
  }, [isDesktop, close]);

  // Focus trap, Esc e ritorno del focus
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    const opener = triggerRef.current;

    // Il primo elemento riceve il focus, cosi lo screen reader entra
    // nel pannello invece di restare fuori
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      // Il ciclo si chiude: dall'ultimo si torna al primo e viceversa
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, [isOpen, close]);

  return (
    <div className="lg:hidden">
      <Button
        ref={triggerRef}
        variant="secondary"
        iconOnly
        iconLeft="menu"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
      >
        <span className="sr-only">{dictionary.actions.openMenu}</span>
      </Button>

      {/* Sfondo scuro: cliccandolo si chiude */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        ref={panelRef}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={dictionary.nav.home}
        // inert toglie il pannello chiuso dall'ordine di tabulazione
        // e dall'albero di accessibilita, senza smontarlo
        inert={!isOpen}
        className={cn(
          "glass-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col",
          "transition-transform duration-300 ease-out-soft",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-20 shrink-0 items-center justify-between px-6">
          <span className="font-display text-sm font-extrabold tracking-[0.14em] uppercase">
            {SITE.name}
          </span>

          <Button variant="ghost" iconOnly iconLeft="close" onClick={close}>
            <span className="sr-only">{dictionary.actions.closeMenu}</span>
          </Button>
        </div>

        <nav aria-label="Principale" className="flex-1 overflow-y-auto px-6">
          <ul className="flex flex-col">
            {MAIN_NAV.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);

              return (
                <li key={item.key} className="border-b border-border">
                  <Link
                    href={localePath(locale, item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between py-5 text-xl font-semibold transition-colors",
                      isActive
                        ? "text-violet-400"
                        : "text-ink hover:text-violet-300",
                    )}
                  >
                    {dictionary.nav[item.key]}
                    <Icon name="arrow-right" className="size-5 opacity-50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 space-y-5 px-6 py-6">
          <Button asChild fullWidth iconLeft="download">
            <a href={SITE.resumePath} download>
              {dictionary.actions.downloadCv}
            </a>
          </Button>

          <div className="flex items-center justify-between">
            <ul className="flex items-center gap-2">
              {SOCIAL_LINKS.filter((link) => link.icon !== "file").map(
                (link) => (
                  <li key={link.label}>
                    <Button
                      asChild
                      variant="ghost"
                      iconOnly
                      iconLeft={link.icon}
                    >
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="sr-only">{link.srLabel}</span>
                      </a>
                    </Button>
                  </li>
                ),
              )}
            </ul>

            <LocaleSwitcher label={dictionary.localeSwitcher.label} />
          </div>
        </div>
      </div>
    </div>
  );
}
