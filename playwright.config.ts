import { defineConfig, devices } from "@playwright/test";

/**
 * Configurazione dei test end-to-end (M10-T8).
 *
 * **Cosa fanno questi test che quelli unitari non fanno.** I 122 test
 * esistenti verificano funzioni: filtri, schemi, dati strutturati. Non
 * verificano che una pagina si apra, che un link porti dove dice, o che il
 * cambio lingua non perda la pagina corrente. Sono proprio le cose che si
 * rompono quando si tocca il routing — e che nessuno nota finche non le
 * prova a mano.
 *
 * **Contro la build di produzione, non contro `next dev`.** In sviluppo il
 * middleware, la generazione statica e il codice ottimizzato si comportano
 * diversamente. Un test verde su `dev` e rosso in produzione e peggio di
 * nessun test: da fiducia dove non dovrebbe.
 */
export default defineConfig({
  testDir: "./tests/e2e",

  /**
   * `fullyParallel` sfrutta piu processi. Sicuro qui perche i test non
   * condividono stato: il sito e statico e nessuno scrive niente.
   */
  fullyParallel: true,

  /**
   * Quarantacinque secondi invece dei trenta predefiniti.
   *
   * Non serve a mascherare lentezze del sito: serve al fatto che i test
   * girano in parallelo contro un solo server. Alla prima ondata le pagine
   * non sono ancora in cache e una decina di richieste simultanee alla
   * griglia dei progetti — otto copertine ciascuna — possono superare i
   * trenta secondi. Il sito a regime risponde in meno di un secondo.
   */
  timeout: 45_000,

  /**
   * In CI vieta i test `.only` dimenticati: senza questa riga un `.only`
   * sfuggito farebbe passare la pipeline eseguendo un test solo, con il
   * verde a dare l'impressione che siano passati tutti.
   */
  forbidOnly: Boolean(process.env.CI),

  /**
   * Un solo tentativo in piu su CI. Non e un modo per nascondere i test
   * traballanti — quelli vanno riscritti — ma copre i casi in cui la
   * macchina condivisa e momentaneamente satura.
   */
  retries: process.env.CI ? 1 : 0,

  /**
   * Quattro processi, non "quanti ne ha la macchina".
   *
   * Il valore predefinito e meta dei core: su un portatile a dieci core
   * significa dieci browser che chiedono pagine allo stesso server Next,
   * ed e cosi che nasce un timeout su una navigazione che a regime dura un
   * secondo. Il collo di bottiglia qui e il server, non la CPU.
   */
  workers: process.env.CI ? 2 : 4,

  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: "http://localhost:3000",
    /** Traccia solo il primo tentativo fallito: pesa e serve solo in caso d'errore. */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      /**
       * Un browser mobile vero, non una finestra stretta: cambia il tipo di
       * puntatore, e da quello dipendono il drawer, il badge 3D che non
       * viene caricato e gli stati hover che su touch non esistono.
       */
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],

  /**
   * Avvia il sito da solo prima dei test e lo spegne alla fine.
   * `reuseExistingServer` in locale: se hai gia un `npm run start` aperto,
   * Playwright lo usa invece di litigare per la porta.
   */
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/it",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
