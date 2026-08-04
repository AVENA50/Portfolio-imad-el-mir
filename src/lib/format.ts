import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/config/i18n";

/**
 * Formattazione di date e numeri.
 *
 * Tutto passa da Intl, mai da stringhe scritte a mano: le date dei progetti
 * arrivano dal frontmatter come "2026-03" o "2026-03-15" e devono uscire
 * corrette in italiano e in inglese senza duplicare tabelle di mesi.
 */

/** Testo mostrato al posto della data di fine quando il progetto e in corso. */
const ONGOING_LABEL: Record<Locale, string> = {
  it: "In corso",
  en: "Present",
};

/**
 * Converte "2026-03" o "2026-03-15" in una Date valida.
 * Usa mezzogiorno UTC per evitare che il fuso sposti il giorno indietro.
 */
function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, day ? Number(day) : 1, 12),
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function intlLocale(locale: Locale): string {
  return LOCALE_META[locale].htmlLang;
}

/**
 * Mese e anno: "mar 2026" in italiano, "Mar 2026" in inglese.
 * E il formato dei badge sulle card progetto.
 */
export function formatMonthYear(
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat(intlLocale(locale), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Data estesa: "15 marzo 2026" / "March 15, 2026". */
export function formatDate(
  value: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const date = parseIsoDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Solo l'anno: "2026". Usato dalla timeline di M9-T5. */
export function formatYear(value: string): string {
  const date = parseIsoDate(value);
  return date ? String(date.getUTCFullYear()) : value;
}

/**
 * Periodo di un progetto o di un'esperienza.
 * Senza data di fine mostra "In corso" / "Present", come nei mockup.
 *
 * @example
 * formatDateRange("2025-01", undefined, "en")   // "Jan 2025 - Present"
 * formatDateRange("2023-09", "2024-06", "it")   // "set 2023 - giu 2024"
 */
export function formatDateRange(
  start: string,
  end?: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const from = formatMonthYear(start, locale);
  const to = end ? formatMonthYear(end, locale) : ONGOING_LABEL[locale];
  return `${from} - ${to}`;
}

/** Separatore dei migliaia secondo la lingua: "2.400" / "2,400". */
export function formatNumber(
  value: number,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

/**
 * Notazione compatta per le metriche dei case study: 2_400_000 -> "2,4 Mln".
 * E il formato dei badge flottanti di M7-T3.
 */
export function formatCompactNumber(
  value: number,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Durata in secondi come "3m 40s". Usata dalle metriche delle pipeline. */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
}

/** Da titolo a slug: "BI Pipeline 2.0" -> "bi-pipeline-2-0". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // via i segni diacritici scomposti da NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Taglia sull'ultimo spazio utile e aggiunge i puntini. */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const cut = value.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

/** Iniziali per l'avatar: "Imad El Mir" -> "IE". */
export function initials(value: string, max = 2): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
