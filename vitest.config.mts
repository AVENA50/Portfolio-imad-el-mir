import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

/**
 * Configurazione dei test unitari.
 *
 * Estensione .mts e non .ts: il file usa sintassi ESM (import.meta.url) e
 * senza .mts Vite lo carica come CommonJS, cosa che oggi produce un avviso
 * e in una versione futura sara un errore.
 *
 * L'alias @/* va ripetuto qui: Vitest non legge i `paths` di tsconfig.json,
 * quindi senza questa riga gli import dei test non risolvono.
 *
 * I test dello schema zod (M4-T8) e del content layer (M5-T3) girano in
 * ambiente Node: leggono file e validano dati, non toccano il DOM.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "src/**/*.test.ts"],
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
