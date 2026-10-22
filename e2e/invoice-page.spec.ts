import { test, expect, type Page } from "@playwright/test";

// Suggestions as the /api/address service returns them; stubbed so the test never calls Swiss Post.
const stubAddressLookup = (page: Page) =>
  page.route("**/api/address", route => route.fulfill({
    json: { results: [{ street: "Dorfstrasse", houseNumber: "3", houseNumberAddition: "", postcode: "6319", town: "Allenwinden" }] },
  }));

const fillValidForm = async (page: Page) => {
  await page.getByLabel("Vorname").fill("Anna");
  await page.getByLabel("Nachname").fill("Muster");
  await page.getByPlaceholder("Strasse und Hausnummer").fill("Dorfstrasse 3");
  await page.getByRole("option", { name: /Dorfstrasse/ }).click();
  await page.getByLabel("Geburtsdatum").fill("2026-10-01");
  await page.getByText("Betreuung der Gebärenden zuhause").click();
};

const generateButton = (page: Page) => page.getByRole("button", { name: "Rechnung generieren" });

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("form and preview sit side by side, the preview stays in view", { tag: ["@FR-01.04"] }, async ({ page }) => {
    await page.goto("/");
    const form = await page.getByTestId("invoice-form-card").boundingBox();
    const preview = page.getByRole("region", { name: "Vorschau" });
    const before = await preview.boundingBox();
    expect(before!.x, "preview right of the form").toBeGreaterThan(form!.x + form!.width);
    expect(Math.round(before!.width)).toBe(480);

    await page.mouse.wheel(0, 600);
    await expect.poll(async () => (await preview.boundingBox())!.y, { message: "sticky preview" }).toBeGreaterThanOrEqual(0);
  });

  test("shows the finished invoice with print and save, saved under the mother's name", { tag: ["@FR-01.04"] }, async ({ page }) => {
    await stubAddressLookup(page);
    await page.goto("/");
    await expect(page.getByText("Noch keine Rechnung")).toBeVisible();
    await fillValidForm(page);
    await expect(page.getByText("Einwohnergemeinde Baar")).toBeVisible();

    await generateButton(page).click();

    await expect(page.getByText("PDF bereit")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("iframe")).toHaveAttribute("src", /^data:application\/pdf/);
    await expect(page.getByText("Wird gespeichert als Anna_Muster.pdf")).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Speichern" }).click();
    expect((await download).suggestedFilename()).toBe("Anna_Muster.pdf");
  });

  test("each service row toggles once, wherever it is clicked, and the total follows", { tag: ["@FR-01.01"] }, async ({ page }) => {
    await page.goto("/");
    const geburt = page.getByRole("checkbox", { name: /Betreuung der Gebärenden/ });
    const wochenbett = page.getByRole("checkbox", { name: /Pflege der Wöchnerin/ });
    const total = page.getByTestId("invoice-total");
    await expect(total).toHaveText("CHF 0.00");

    await page.getByText("Betreuung der Gebärenden zuhause").click();
    await expect(geburt).toHaveAttribute("aria-checked", "true");
    await expect(total).toHaveText("CHF 400.00");

    await page.locator("label", { hasText: "Pflege der Wöchnerin" }).getByText("CHF 400.00").click();
    await expect(wochenbett).toHaveAttribute("aria-checked", "true");
    await expect(total).toHaveText("CHF 800.00");

    await geburt.click();
    await expect(geburt).toHaveAttribute("aria-checked", "false");
    await expect(total).toHaveText("CHF 400.00");
  });

  test("the problem summary jumps to a field without leaving the page", { tag: ["@FR-01.01"] }, async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Vorname").fill("Anna");
    const url = page.url();

    await generateButton(page).click();
    await expect(page.getByRole("heading", { name: /Bitte prüfen Sie \d Angaben/ })).toBeFocused();
    await page.getByRole("button", { name: /^Nachname:/ }).click();

    await expect(page.getByLabel("Nachname")).toBeFocused();
    expect(page.url()).toBe(url);
    await expect(page.getByLabel("Vorname")).toHaveValue("Anna");
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("the action bar stays at the bottom without covering the form", { tag: ["@FR-01.04"] }, async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("iframe")).toHaveCount(0);
    const button = generateButton(page);
    const bar = await button.boundingBox();
    expect(Math.round(bar!.height)).toBe(52);
    expect(bar!.y + bar!.height, "bar at the bottom").toBeGreaterThan(844 - 60);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const reset = await page.getByRole("button", { name: "Zurücksetzen" }).boundingBox();
    const barTop = (await button.boundingBox())!.y - 14;
    expect(reset!.y + reset!.height, "last content above the bar").toBeLessThan(barTop);
  });

  test("the finished invoice opens in a panel that closes and reopens, keeping the form", { tag: ["@FR-01.04"] }, async ({ page }) => {
    await stubAddressLookup(page);
    await page.goto("/");
    await fillValidForm(page);

    await generateButton(page).click();

    const sheet = page.getByRole("dialog", { name: "Rechnung bereit" });
    await expect(sheet).toBeVisible({ timeout: 15_000 });
    await expect(sheet.getByText("An Einwohnergemeinde Baar · CHF 400.00")).toBeVisible();
    await expect(sheet.locator("iframe")).toHaveAttribute("src", /^data:application\/pdf/);
    await expect(sheet.getByRole("button", { name: "Speichern" })).toBeInViewport();
    await expect(page.locator("iframe"), "only the panel loads the PDF").toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(page.getByLabel("Vorname")).toHaveValue("Anna");

    await page.getByRole("button", { name: "Rechnung anzeigen" }).click();
    await expect(sheet).toBeVisible();
  });

  test("messages appear at the top of the screen", { tag: ["@FR-01.01"] }, async ({ page }) => {
    await page.goto("/");
    await generateButton(page).click();
    const toast = page.getByText("Ungültige Eingaben", { exact: true });
    await expect(toast).toBeVisible();
    expect((await toast.boundingBox())!.y).toBeLessThan(200);
  });
});

for (const width of [320, 390]) {
  test.describe(`phone ${width}px with a finished invoice`, () => {
    test.use({ viewport: { width, height: 740 }, hasTouch: true });

    test(`the bottom bar fits the ${width}px screen and covers no content`, { tag: ["@FR-01.04"] }, async ({ page }) => {
      await stubAddressLookup(page);
      await page.goto("/");
      await fillValidForm(page);
      await generateButton(page).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();

      expect(await page.evaluate(() => document.documentElement.scrollWidth), "no sideways scrolling").toBeLessThanOrEqual(width);
      for (const name of ["Rechnung anzeigen", "Rechnung generieren"]) {
        const box = (await page.getByRole("button", { name }).boundingBox())!;
        expect(box.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(width);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const reset = (await page.getByRole("button", { name: "Zurücksetzen" }).boundingBox())!;
      const barTop = (await page.getByRole("button", { name: "Rechnung anzeigen" }).boundingBox())!.y - 14;
      expect(reset.y + reset.height, "last content above the bar").toBeLessThan(barTop);
    });
  });
}

test.describe("iPhone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });

  test("«Drucken» hands the invoice to the share menu instead of printing a blank page", { tag: ["@FR-01.04"] }, async ({ page }) => {
    // The share menu is the iPhone's own; the stub records what the app hands to it.
    await page.addInitScript(() => {
      const shared: { name: string; type: string; size: number }[] = [];
      Object.assign(window, { shared });
      Object.defineProperty(navigator, "canShare", { value: () => true });
      Object.defineProperty(navigator, "share", {
        value: async ({ files }: ShareData) => { files?.forEach(f => shared.push({ name: f.name, type: f.type, size: f.size })); },
      });
    });
    await stubAddressLookup(page);
    await page.goto("/");
    await fillValidForm(page);
    await generateButton(page).click();

    const sheet = page.getByRole("dialog", { name: "Rechnung bereit" });
    await expect(sheet).toBeVisible({ timeout: 15_000 });
    await sheet.getByRole("button", { name: "Drucken" }).click();

    const shared = await page.evaluate(() => (window as unknown as { shared: { name: string; type: string; size: number }[] }).shared);
    expect(shared).toHaveLength(1);
    expect(shared[0]).toMatchObject({ name: "Anna_Muster.pdf", type: "application/pdf" });
    expect(shared[0].size, "the real invoice, not an empty file").toBeGreaterThan(1000);
    await expect(page.locator("body > iframe"), "no hidden print frame").toHaveCount(0);
  });
});
