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
    institution: "Université Sidi Mohamed Ben Abdellah",
    startDate: "2021-09",
    location: "Fès",
    url: "https://www.usmba.ac.ma/",
  },
  {
    key: "highschool",
    institution: "Liceo Hamilton",
    startDate: "2020-09",
    endDate: "2021-06",
    location: "Fès",
  },
];

export interface ExperienceEntry {
  /** Chiave del testo nel dizionario (experience.work.<key>). */
  key: string;
  organization: string;
  startDate: string;
  endDate?: string;
  location: string;
  /** Cosa lascia in eredita al lavoro tecnico. Chiave nel dizionario. */
  transferable?: boolean;
}

export interface CertificateEntry {
  key: string;
  issuer: string;
  /** YYYY-MM del rilascio. */
  date: string;
  url?: string;
}

/**
 * Esperienze lavorative, dalla piu recente.
 *
 * Nessuna delle due e un lavoro da sviluppatore, e non c'e ragione di
 * nasconderlo. Su un primo portfolio la domanda che un selezionatore si
 * fa non e "ha gia fatto questo mestiere" — sa che non l'ha fatto — ma
 * "questa persona ha mai portato a termine qualcosa con costanza".
 *
 * Un pubblico costruito da zero e cinque anni nella stessa palestra
 * rispondono a quella domanda meglio di un tirocinio di tre settimane.
 * `transferable` marca le esperienze per cui vale la pena spiegare il
 * collegamento invece di lasciarlo intuire.
 */
export const EXPERIENCE: readonly ExperienceEntry[] = [
  {
    // DA CONFERMARE: nel CV questa voce e "Attuale" senza data di inizio.
    // Il valore qui sotto e una stima e va corretto con quella vera.
    key: "contentCreator",
    organization: "Freelance",
    startDate: "2022-01",
    location: "Fès",
    transferable: true,
  },
  {
    key: "personalTrainer",
    organization: "AdriGym",
    startDate: "2021-04",
    endDate: "2025-12",
    location: "Fès",
    transferable: true,
  },
];

/** Certificazioni e formazione breve. */
export const CERTIFICATES: readonly CertificateEntry[] = [
  {
    key: "nutrition",
    issuer: "American Society for Nutrition",
    date: "2023-04",
    url: "https://nutrition.org/",
  },
];

/** Lingue parlate, dalla madrelingua alla piu debole. */
export const LANGUAGES: readonly LanguageSkill[] = [
  { key: "arabic", level: "native" },
  { key: "english", level: "C1" },
  { key: "french", level: "C1" },
  { key: "italian", level: "B2" },
];

/**
 * Foto usata sul badge, in 3D e nella versione statica.
 *
 * `undefined` finche non c'e il file: il badge disegna le iniziali e non
 * si rompe. Quando la foto arriva, basta metterla in
 * `public/images/about/` e scrivere qui il percorso — una riga sola, e
 * cambiano entrambe le versioni insieme.
 *
 * Formato consigliato: ritratto quasi quadrato, lato lungo almeno 900px.
 * Il ritaglio e centrato, quindi la faccia deve stare al centro.
 */
export const PROFILE_PHOTO: string | undefined = undefined;

/** Dove vive e lavora, per il testo e per i dati strutturati di M10. */
export const LOCATION: Record<Locale, string> = {
  it: "Torino, Italia",
  en: "Turin, Italy",
};
