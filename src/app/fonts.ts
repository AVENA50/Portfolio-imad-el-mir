/**
 * Font del sito.
 *
 * Isolati dal layout perche next/font va invocato in ambito di modulo:
 * ogni chiamata viene risolta a build time e il file risultante e
 * self-hosted da Next, senza richieste a Google in produzione.
 *
 * Le tre variabili CSS prodotte qui sono quelle che src/styles/tokens.css
 * si aspetta in --font-sans, --font-display e --font-mono.
 */

import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

/** Testo corrente: paragrafi, label, interfaccia. */
export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body-family",
  display: "swap",
  // Nessun `weight`: sono font variabili, un solo file copre tutti i pesi
});

/** Titoli: hero, sezioni, nomi dei progetti. */
export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display-family",
  display: "swap",
});

/** Codice: snippet nei case study, stack tecnologico. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
  display: "swap",
});

/** Da applicare una volta sola sull'elemento <html>. */
export const fontVariables = [
  fontBody.variable,
  fontDisplay.variable,
  fontMono.variable,
].join(" ");
