/**
 * Configurazione del sito.
 *
 * Fonte unica per nome, dominio, contatti e testi ricorrenti.
 * Metadata, sitemap, robots, JSON-LD e Open Graph leggono tutti da qui:
 * cambiare dominio deve costare una riga, non una ricerca globale.
 */

/**
 * L'indirizzo pubblico del sito, dedotto dall'ambiente (M10-T1).
 *
 * **Perche non e una costante.** Prima qui c'era scritto
 * `https://imadelmir.dev`, un dominio che non esiste. Sarebbe stato un
 * errore silenzioso e costoso: sitemap, link canonici e anteprime social
 * avrebbero puntato tutti a un sito irraggiungibile, e nessun controllo lo
 * avrebbe segnalato — il codice compila benissimo con un URL sbagliato.
 *
 * L'ordine di ricerca va dal piu specifico al piu generico:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — quello che scrivi tu. Vince sempre, ed e
 *    quello che userai il giorno in cui comprerai un dominio.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — l'indirizzo stabile di produzione,
 *    che Vercel inietta da solo. Non cambia fra un deploy e l'altro.
 * 3. `VERCEL_URL` — l'indirizzo del singolo deployment, diverso ogni volta.
 *    E l'ultima spiaggia, perche un link canonico che cambia a ogni push e
 *    peggio di niente, ma su un'anteprima e meglio di localhost.
 * 4. `http://localhost:3000` — in sviluppo.
 *
 * Le due variabili di Vercel arrivano **senza schema**, cioe scritte come
 * `progetto.vercel.app` e non `https://progetto.vercel.app`. Aggiungerlo e
 * necessario: `new URL("progetto.vercel.app")` lancia un'eccezione, e
 * `metadataBase` nel layout fa esattamente quella chiamata.
 */
function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/**
 * Dice se questo e il sito pubblico e definitivo.
 *
 * Serve a `robots.ts`: finche il portfolio vive su un indirizzo di
 * anteprima non deve finire su Google. Un sito indicizzato mentre e ancora
 * in costruzione lascia in giro risultati vecchi per mesi, e toglierli
 * dopo e molto piu lento che non metterceli.
 */
export function isPublicSite(): boolean {
  return (
    process.env.VERCEL_ENV === "production" &&
    Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  );
}

export const SITE = {
  name: "Imad El Mir",
  shortName: "IEM",
  /**
   * Il ruolo dichiarato a chi non legge la pagina: `jobTitle` nei dati
   * strutturati e riga in fondo alle anteprime social. Deve coincidere con
   * quello dell'hero — se Google legge una qualifica e il visitatore ne
   * trova un'altra, la meno credibile delle due vince.
   */
  role: "Business Intelligence Software Developer",
  tagline: "Business Intelligence, Full Stack e Intelligenza Artificiale",

  description:
    "Portfolio e case study di Imad El Mir, Business Intelligence Software Developer: applicazioni che trasformano dati complessi in decisioni.",

  /** Senza slash finale: gli URL assoluti si compongono concatenando. */
  url: siteUrl(),

  locale: "it-IT",
  ogLocale: "it_IT",

  location: "Italy",
  languages: ["Italiano", "English", "العربية"],

  email: "imadelmir900@gmail.com",
  resumePath: "/resume/imad-el-mir-cv.pdf",

  /** Handle usati per comporre gli URL dei profili in data/social.ts (M3-T6). */
  handles: {
    github: "AVENA50",
    linkedin: "imad-el-mir",
  },

  keywords: [
    "Imad El Mir",
    "Full Stack Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Python",
    "Machine Learning",
    "Portfolio",
  ],
} as const;

export type Site = typeof SITE;

/** Compone un URL assoluto a partire da un percorso interno. */
export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
