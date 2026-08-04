import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/app/fonts";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

/**
 * Metadata di base. Il builder riutilizzabile che genera anche Open Graph
 * e Twitter card per ogni pagina arriva in M10-T1: qui resta il minimo
 * indispensabile perche ogni pagina abbia un titolo sensato da subito.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://imadelmir.dev"),
  title: {
    default: "Imad El Mir - Full Stack Developer",
    template: "%s | Imad El Mir",
  },
  description:
    "Portfolio e case study di Imad El Mir: applicazioni web full stack, sistemi intelligenti e pipeline dati.",
  authors: [{ name: "Imad El Mir" }],
  creator: "Imad El Mir",
};

export const viewport: Viewport = {
  themeColor: "#05060d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning e richiesto da next-themes: lo script inline
    // modifica la classe di <html> prima dell'idratazione.
    <html lang="it" className={fontVariables} suppressHydrationWarning>
      <body className="bg-bg text-ink antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
