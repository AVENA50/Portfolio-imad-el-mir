import { expect, test } from "@playwright/test";

/**
 * Filtri dei progetti e case study (M10-T8).
 *
 * I filtri sono l'unica parte del sito che scrive nell'URL. Vale la pena
 * un test perche il comportamento giusto e controintuitivo da mantenere:
 * lo stato deve sopravvivere a un ricaricamento e al tasto "indietro",
 * altrimenti condividere un link filtrato non funziona.
 */

test.describe("filtri", () => {
  test("filtrare per categoria scrive nell'URL", async ({ page }) => {
    await page.goto("/it/projects");

    await page.getByRole("button", { name: /full stack/i }).click();
    await expect(page).toHaveURL(/category=full-stack/);
  });

  test("il filtro sopravvive al ricaricamento", async ({ page }) => {
    // E la ragione per cui lo stato sta nell'URL e non in useState: un link
    // filtrato deve poter essere condiviso e riaperto.
    await page.goto("/it/projects?category=ai-ml");
    await page.reload();

    await expect(
      page.getByRole("button", { name: /ai & ml/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("il filtro predefinito non sporca l'URL", async ({ page }) => {
    await page.goto("/it/projects?category=full-stack");
    await page.getByRole("button", { name: /^tutti/i }).click();

    // Tornando a "tutti" il parametro sparisce invece di restare scritto:
    // un URL pulito e quello che si copia e si incolla.
    await expect(page).not.toHaveURL(/category=/);
  });

  test("il conteggio dei risultati viene annunciato", async ({ page }) => {
    await page.goto("/it/projects");
    // Regione live: chi non vede la griglia cambiare deve sapere che il
    // filtro ha avuto effetto.
    await expect(page.locator('[aria-live="polite"]')).toContainText(
      /progett/i,
    );
  });
});

test.describe("case study", () => {
  test("dalla griglia si arriva al progetto", async ({ page }) => {
    await page.goto("/it/projects");
    await page
      .getByRole("link", { name: /arcadium/i })
      .first()
      .click();

    await expect(page).toHaveURL(/\/it\/projects\/arcadium$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Arcadium",
    );
  });

  test("dichiara i dati strutturati del progetto", async ({ page }) => {
    await page.goto("/it/projects/arcadium");

    const tipi = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((b) => JSON.parse(b)["@type"]);

    expect(tipi).toContain("CreativeWork");
    expect(tipi).toContain("BreadcrumbList");
  });

  test("l'anteprima social e dichiarata e raggiungibile", async ({
    page,
    request,
  }) => {
    await page.goto("/it/projects/arcadium");

    const url = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");

    expect(url).toBeTruthy();

    // Un `og:image` che punta a un 404 e peggio di nessun og:image: la
    // piattaforma mostra comunque il rettangolo vuoto, ma tu credi di no.
    const risposta = await request.get(url!);
    expect(risposta.status()).toBe(200);
    expect(risposta.headers()["content-type"]).toContain("image/");
  });
});
