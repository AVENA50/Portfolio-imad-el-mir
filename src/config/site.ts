/**
 * Configurazione del sito.
 *
 * Fonte unica per nome, dominio, contatti e testi ricorrenti.
 * Metadata, sitemap, robots, JSON-LD e Open Graph leggono tutti da qui:
 * cambiare dominio deve costare una riga, non una ricerca globale.
 */

export const SITE = {
  name: "Imad El Mir",
  shortName: "IEM",
  role: "Full Stack Developer",
  tagline: "Full Stack Developer & AI Enthusiast",

  description:
    "Portfolio e case study di Imad El Mir: applicazioni web full stack, sistemi intelligenti e pipeline dati.",

  /** Senza slash finale: gli URL assoluti si compongono concatenando. */
  url: "https://imadelmir.dev",

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
