import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/app/fonts";
import { SITE } from "@/config/site";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

/**
 * Metadata di base, generati da config/site.ts.
 * Il builder riutilizzabile con Open Graph e Twitter card per ogni pagina
 * arriva in M10-T1: qui resta il minimo perche ogni pagina abbia da subito
 * un titolo sensato.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - ${SITE.role}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
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
