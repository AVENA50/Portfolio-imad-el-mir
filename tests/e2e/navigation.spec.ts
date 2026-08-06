import { expect, test, type Page } from "@playwright/test";

/**
 * Navigazione, lingue e accessibilita di base (M10-T8).
 *
 * Sono i percorsi che un test unitario non puo coprire: che le pagine si
 * aprano davvero, che i link portino dove dicono, che il cambio lingua non
 * perda la pagina su cui eri. Cose che si rompono quando si tocca il
 * routing, e che senza un test si scoprono solo provandole a mano — cioe
 * quasi mai.
 */

/** Le rotte del menu, senza prefisso di lingua. */
const ROTTE = [
  "/",
  "/about",
  "/projects",
  "/skills",
  "/experience",
  "/contact",
];

test.describe("pagine", () => {
  for (const rotta of ROTTE) {
    test(`${rotta} risponde e ha un titolo di primo livello`, async ({
      page,
    }) => {
      const risposta = await page.goto(`/it${rotta === "/" ? "" : rotta}`);
      expect(risposta?.status()).toBe(200);

      // Esattamente un h1: e l'ossatura su cui uno screen reader naviga.
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).not.toBeEmpty();
    });
  }

  test("un indirizzo inesistente risponde 404", async ({ page }) => {
    const risposta = await page.goto("/it/pagina-che-non-esiste");
    expect(risposta?.status()).toBe(404);
  });

  test("la lingua e dichiarata nell'HTML", async ({ page }) => {
    await page.goto("/it");
    await expect(page.locator("html")).toHaveAttribute("lang", "it-IT");

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  });
});

/**
 * Il selettore della lingua si prende per `hreflang`, non per il testo.
 *
 * Nello switcher la sigla "EN" e `aria-hidden`: serve solo agli occhi, e il
 * nome accessibile del link e "English". Cercare "EN" fallisce, ed e giusto
 * cosi — quel testo non esiste per chi usa uno screen reader. `hreflang` e
 * anche piu stabile: non cambia se le etichette diventassero "Inglese".
 *
 * Il `:visible` non e un dettaglio. Gli switcher nel DOM sono **due** — uno
 * nell'intestazione (`hidden lg:block`) e uno nel menu a scomparsa
 * (`lg:hidden`) — e a ogni larghezza uno dei due e `display: none`. Senza
 * il filtro Playwright si ferma: si rifiuta di indovinare quale intendevo,
 * ed e un comportamento giusto.
 */
const linkLingua = (locale: "it" | "en") =>
  `a[hreflang="${locale === "it" ? "it-IT" : "en-US"}"]:visible`;

/**
 * Su schermo stretto la lingua si cambia **dal menu**, e il menu va aperto.
 *
 * Senza questo passaggio il test cliccherebbe un link dentro un pannello
 * chiuso: Playwright ci riuscirebbe, perche l'elemento e solo spostato
 * fuori schermo e non rimosso, ma il test passerebbe anche se il menu
 * fosse rotto. Un test che verifica qualcosa che nessun utente puo fare
 * non sta verificando niente.
 */
async function apriIlMenuSeServe(page: Page) {
  const bottone = page.getByRole("button", { name: /apri il menu/i });
  if (await bottone.isVisible()) await bottone.click();
}

test.describe("cambio lingua", () => {
  test("resta sulla stessa pagina", async ({ page }) => {
    // E il bug piu facile da introdurre: uno switcher che riporta alla home
    // invece di tradurre la pagina corrente.
    await page.goto("/it/projects");
    await apriIlMenuSeServe(page);
    await page.locator(linkLingua("en")).click();

    await expect(page).toHaveURL(/\/en\/projects$/);
  });

  test("conserva anche lo slug di un progetto", async ({ page }) => {
    await page.goto("/it/projects/arcadium");
    await apriIlMenuSeServe(page);
    await page.locator(linkLingua("en")).click();

    await expect(page).toHaveURL(/\/en\/projects\/arcadium$/);
  });

  test("il link della lingua e annunciato con il suo nome", async ({
    page,
  }) => {
    // La sigla e decorativa: il nome accessibile deve essere la lingua per
    // esteso, altrimenti uno screen reader legge due lettere senza senso.
    await page.goto("/it");
    await apriIlMenuSeServe(page);

    await expect(
      page.getByRole("link", { name: "English", exact: true }).first(),
    ).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("ogni pagina dichiara canonical e hreflang", async ({ page }) => {
    await page.goto("/it/projects");

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    // Due lingue piu x-default.
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(
      3,
    );
  });

  test("il JSON-LD e presente e valido", async ({ page }) => {
    await page.goto("/it");

    const blocchi = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    expect(blocchi.length).toBeGreaterThan(0);

    const tipi = blocchi.map((b) => JSON.parse(b)["@type"]);
    expect(tipi).toContain("Person");
    expect(tipi).toContain("WebSite");
  });

  test("la sitemap elenca le pagine in entrambe le lingue", async ({
    request,
  }) => {
    const risposta = await request.get("/sitemap.xml");
    expect(risposta.status()).toBe(200);

    const xml = await risposta.text();
    expect(xml).toContain("/it/projects");
    expect(xml).toContain("/en/projects");
  });

  test("robots.txt blocca l'indicizzazione finche il sito non e pubblico", async ({
    request,
  }) => {
    // In locale `NEXT_PUBLIC_SITE_URL` non e quella di produzione, quindi
    // deve uscire il divieto. Se un giorno questo test fallisse in CI
    // vorrebbe dire che il sito e diventato indicizzabile per sbaglio.
    const risposta = await request.get("/robots.txt");
    expect(await risposta.text()).toContain("Disallow: /");
  });
});

test.describe("tastiera", () => {
  test("il primo Tab porta al link di salto", async ({ page }) => {
    await page.goto("/it");
    await page.keyboard.press("Tab");

    const attivo = page.locator(":focus");
    await expect(attivo).toBeVisible();
    await expect(attivo).toHaveAttribute("href", /#main/);
  });
});
