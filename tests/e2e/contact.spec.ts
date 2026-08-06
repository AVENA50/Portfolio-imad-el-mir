import { expect, test } from "@playwright/test";

/**
 * Il form di contatto, dal punto di vista di chi lo usa (M10-T8).
 *
 * **Cosa non fanno questi test: non mandano email.** Un test che spedisce
 * davvero consumerebbe la quota di Resend a ogni esecuzione della CI e
 * riempirebbe la casella di messaggi finti. Qui la chiamata di rete viene
 * intercettata: si verifica che il browser mandi i dati giusti e reagisca
 * bene alla risposta, che e la parte di cui questo codice e responsabile.
 * Che Resend consegni davvero e compito di Resend.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/it/contact");
});

/**
 * I messaggi attesi a form vuoto, uno per campo.
 *
 * Si verificano per testo e non contando gli elementi con `role="alert"`.
 * Contare e fragile in due modi: si rompe il giorno in cui si aggiunge un
 * campo, e quando fallisce dice "attesi 4, trovati 5" senza far capire
 * quale sia il quinto. Cosi invece l'errore nomina il messaggio mancante.
 */
const ERRORI_A_VUOTO = [
  /il nome deve contenere almeno due caratteri/i,
  /indirizzo email è necessario/i,
  /l'oggetto deve contenere almeno tre caratteri/i,
  /il messaggio è troppo breve/i,
];

test("a form vuoto non mostra errori prima del primo invio", async ({
  page,
}) => {
  // Un errore che compare prima ancora di scrivere e rumore: la validazione
  // deve partire al primo invio, non all'apertura della pagina.
  for (const messaggio of ERRORI_A_VUOTO) {
    await expect(page.getByText(messaggio)).toHaveCount(0);
  }
});

test("segnala i campi mancanti invece di mandare la richiesta", async ({
  page,
}) => {
  let chiamate = 0;
  await page.route("**/api/contact", (route) => {
    chiamate++;
    return route.abort();
  });

  await page.getByRole("button", { name: /invia messaggio/i }).click();

  for (const messaggio of ERRORI_A_VUOTO) {
    await expect(page.getByText(messaggio)).toBeVisible();
  }

  // E soprattutto: niente e partito verso il server.
  expect(chiamate).toBe(0);
});

test("l'errore sparisce mentre si corregge", async ({ page }) => {
  await page.getByRole("button", { name: /invia messaggio/i }).click();
  await expect(page.getByText(ERRORI_A_VUOTO[0]!)).toBeVisible();

  await page.getByLabel(/nome/i).fill("Imad El Mir");

  // Il campo corretto smette di lamentarsi subito, senza aspettare un altro
  // tentativo di invio. Gli altri restano: si corregge uno alla volta.
  await expect(page.getByText(ERRORI_A_VUOTO[0]!)).toHaveCount(0);
  await expect(page.getByText(ERRORI_A_VUOTO[1]!)).toBeVisible();
});

test("manda i dati giusti e mostra la conferma", async ({ page }) => {
  let corpo: Record<string, unknown> | null = null;

  await page.route("**/api/contact", async (route) => {
    corpo = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.getByLabel(/nome/i).fill("Mario Rossi");
  await page.getByLabel(/email/i).fill("mario@example.com");
  await page.getByLabel(/oggetto/i).fill("Proposta di collaborazione");
  await page
    .getByLabel(/messaggio/i)
    .fill("Buongiorno, vorrei parlarle di una posizione aperta nel mio team.");

  await page.getByRole("button", { name: /invia messaggio/i }).click();

  await expect(page.getByText(/messaggio inviato/i)).toBeVisible();

  expect(corpo).toMatchObject({
    name: "Mario Rossi",
    email: "mario@example.com",
  });
});

test("spiega cosa fare quando il server risponde male", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ error: "rateLimited" }),
    }),
  );

  await page.getByLabel(/nome/i).fill("Mario Rossi");
  await page.getByLabel(/email/i).fill("mario@example.com");
  await page.getByLabel(/oggetto/i).fill("Proposta di collaborazione");
  await page
    .getByLabel(/messaggio/i)
    .fill("Buongiorno, vorrei parlarle di una posizione aperta nel mio team.");

  await page.getByRole("button", { name: /invia messaggio/i }).click();

  // Il messaggio deve dire cosa fare — "riprova fra qualche minuto" — non
  // limitarsi a dichiarare che qualcosa e andato storto.
  await expect(page.getByText(/riprovare fra qualche minuto/i)).toBeVisible();
  // E il form deve restare compilato: far riscrivere tutto sarebbe crudele.
  await expect(page.getByLabel(/nome/i)).toHaveValue("Mario Rossi");
});

test("la trappola antispam non e raggiungibile da tastiera", async ({
  page,
}) => {
  const trappola = page.locator('input[name="website"]');

  await expect(trappola).toHaveAttribute("tabindex", "-1");
  await expect(trappola).not.toBeInViewport();
});
