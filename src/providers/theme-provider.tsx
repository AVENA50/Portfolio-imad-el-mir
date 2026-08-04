"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

/**
 * Provider del tema.
 *
 * next-themes inietta uno script inline prima del paint: il tema viene
 * applicato all'elemento <html> prima che React idrati, quindi non c'e
 * il lampo bianco al primo caricamento.
 *
 * Oggi il sito e solo dark, come i mockup. Il toggle e i token del tema
 * chiaro arrivano in M3-T8: quando ci saranno bastera passare
 * enableSystem e aggiungere le classi .light in tokens.css.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
