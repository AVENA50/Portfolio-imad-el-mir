import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_HEADER,
  isLocale,
  type Locale,
} from "@/config/i18n";

/** Cookie in cui salviamo la scelta esplicita dell'utente. */
const LOCALE_COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Sceglie la lingua leggendo l'header Accept-Language.
 *
 * Implementazione minima e volutamente senza dipendenze: ordina le lingue
 * dichiarate dal browser per fattore di qualita e restituisce la prima
 * supportata. "it-CH" vale come "it".
 */
function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return {
        tag: (tag ?? "").trim().toLowerCase(),
        quality: quality ? Number.parseFloat(quality.slice(2)) : 1,
      };
    })
    .filter((entry) => entry.tag.length > 0 && !Number.isNaN(entry.quality))
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (base && isLocale(base)) return base;
  }

  return null;
}

function resolvePreferredLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (fromCookie && isLocale(fromCookie)) return fromCookie;

  return (
    matchAcceptLanguage(request.headers.get("accept-language")) ??
    DEFAULT_LOCALE
  );
}

/**
 * Garantisce che ogni URL abbia il prefisso di lingua.
 *
 * /projects  ->  redirect a /it/projects (o /en/projects secondo il browser)
 * /it/...    ->  passa
 *
 * Il prefisso esplicito anche per l'italiano e voluto: rende ogni pagina
 * indicizzabile con il proprio hreflang e tiene `generateStaticParams`
 * banale. Nasconderlo richiederebbe un rewrite e due sorgenti di verita
 * per lo stesso contenuto.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    // La lingua viaggia anche come header: not-found.tsx e le pagine di
    // errore non ricevono `params`, e senza questo non saprebbero in che
    // lingua parlare all'utente.
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, pathname.split("/")[1] ?? DEFAULT_LOCALE);
    return NextResponse.next({ request: { headers } });
  }

  const locale = resolvePreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  /**
   * Esclude asset statici, API e file con estensione: il middleware deve
   * girare solo sulle pagine, altrimenti rallenta ogni immagine.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
