import Link from "next/link";

import { Button } from "@/components/ui";
import type { Locale } from "@/config/i18n";
import { MAIN_NAV, localePath } from "@/config/navigation";
import { SITE } from "@/config/site";
import { SOCIAL_LINKS } from "@/data/social";
import type { Dictionary } from "@/lib/dictionary";

interface FooterProps {
  locale: Locale;
  dictionary: Dictionary;
}

/**
 * Footer del sito.
 *
 * Server component: nessuno stato, nessun evento. Le voci arrivano dallo
 * stesso MAIN_NAV dell'header, quindi aggiungere una pagina la fa comparire
 * in entrambi senza toccare due file.
 *
 * L'anno del copyright si calcola a ogni build: un footer con "2026" scritto
 * a mano diventa la prima cosa vecchia del sito il primo gennaio.
 */
export function Footer({ locale, dictionary }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-site py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link
              href={localePath(locale, "/")}
              className="group inline-flex items-center gap-2.5"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-pill bg-blue-500 transition-colors group-hover:bg-violet-500"
              />
              <span className="font-display text-sm font-extrabold tracking-[0.14em] uppercase">
                {SITE.name}
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-ink-subtle">
              {dictionary.meta.description}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3 md:grid-cols-2">
              {MAIN_NAV.map((item) => (
                <li key={item.key}>
                  <Link
                    href={localePath(locale, item.href)}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {dictionary.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-2">
            {SOCIAL_LINKS.map((link) => {
              const isExternal = link.href.startsWith("http");

              return (
                <li key={link.label}>
                  <Button
                    asChild
                    variant="ghost"
                    iconOnly
                    iconLeft={link.icon}
                    className="text-ink-subtle hover:text-ink"
                  >
                    <a
                      href={link.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      download={link.icon === "file" ? true : undefined}
                    >
                      <span className="sr-only">{link.srLabel}</span>
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. {dictionary.footer.rights}
          </p>
          <p>{dictionary.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
