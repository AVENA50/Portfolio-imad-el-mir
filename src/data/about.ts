import type { Locale } from "@/config/i18n";

/**
 * Dati biografici strutturati.
 *
 * Qui stanno i **fatti** — istituti, date, livelli linguistici — non i
 * testi: la prosa vive nei dizionari, dove il tipo garantisce che italiano
 * e inglese non divergano. La divisione ha una ragione pratica: una data
 * non si traduce, una frase si.
 *
 * Cosa **non** entra in questo file, per scelta: indirizzo di casa, numero
 * di telefono e data di nascita. Sono nel CV, che si scarica; su una pagina
 * pubblica e indicizzata sarebbero materiale per chi raccoglie dati altrui.
 * L'email c'e gia in config/site.ts perche serve a essere contattati.
 */

export interface EducationEntry {
  /** Chiave del testo nel dizionario (about.education.<key>). */
  key: string;
  institution: string;
  /** YYYY-MM. Assente = in corso. */
  startDate: string;
  endDate?: string;
  location: string;
  url?: string;
}

export interface LanguageSkill {
  key: "arabic" | "italian" | "french" | "english";
  /** Livello secondo il Quadro comune europeo, o "native". */
  level: "native" | "C2" | "C1" | "B2" | "B1";
}

/**
 * Formazione, dalla piu recente.
 * Le etichette dei corsi sono nei dizionari: "Business Intelligence
 * Software Developer" resta uguale, ma la descrizione no.
 */
export const EDUCATION: readonly EducationEntry[] = [
  {
    key: "its",
    institution: "ITS Academy ICT Piemonte",
    startDate: "2025-12",
    location: "Torino",
    url: "https://www.its-ictpiemonte.it/corsi/business-intelligence-software-developer/",
  },
  {
    key: "physics",
    institution: "Universite Sidi Mohammed Ben Abdellah",
    startDate: "2021-09",
    location: "Fes",
    url: "https://www.usmba.ac.ma/",
  },
  {
    key: "nutrition",
    institution: "American Society for Nutrition",
    startDate: "2022-11",
    endDate: "2023-04",
    location: "Online",
    url: "https://nutrition.org/",
  },
  {
    key: "highschool",
    institution: "Liceo Hamilton",
    startDate: "2020-09",
    endDate: "2021-06",
    location: "Fes",
  },
];

/** Lingue parlate, dalla madrelingua alla piu debole. */
export const LANGUAGES: readonly LanguageSkill[] = [
  { key: "arabic", level: "native" },
  { key: "english", level: "C1" },
  { key: "french", level: "C1" },
  { key: "italian", level: "B2" },
];

/** Dove vive e lavora, per il testo e per i dati strutturati di M10. */
export const LOCATION: Record<Locale, string> = {
  it: "Torino, Italia",
  en: "Turin, Italy",
};
