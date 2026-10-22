import { test, expect, type Page } from "@playwright/test";

// A 1×1 PNG, enough for the signature upload.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

const settingsLink = (page: Page) =>
  page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("link", { name: "Einstellungen", exact: true });

const setupDot = (page: Page) => page.locator("[data-setup-dot]");

test("a new user is led through the setup until the invoice page is ready", { tag: ["@FR-01.06", "@FR-01.07"] }, async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Noch 3 Angaben bis zur ersten Rechnung")).toBeVisible();
  await expect(setupDot(page)).toBeVisible();
  await expect(settingsLink(page)).toHaveAccessibleDescription("Einrichtung unvollständig");

  await page.getByRole("link", { name: "Zu den Einstellungen" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Einstellungen" })).toBeVisible();
  await expect(page.getByRole("region", { name: /Einrichtung: noch 3 Angaben/ })).toBeVisible();

  await page.getByLabel("Absender").fill("Anna Hebamme\nSeestrasse 1\n6300 Zug");
  await page.getByLabel("Ort der Ausstellung").fill("Zug");
  await page.getByRole("button", { name: "Speichern", exact: true }).first().click();
  await expect(page.getByRole("region", { name: /Einrichtung: noch 1 Angabe / })).toBeVisible();

  await page.getByLabel("Oder PNG-Datei hochladen").setInputFiles({ name: "unterschrift.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Alles eingerichtet.")).toBeVisible();
  await expect(page.getByRole("img", { name: "Gespeicherte Unterschrift" })).toBeVisible();
  await expect(setupDot(page)).toHaveCount(0);

  await page.getByRole("link", { name: "Zur Rechnung" }).click();
  await expect(page.getByRole("button", { name: "Rechnung generieren" })).toBeVisible();
  await expect(page.getByText(/bis zur ersten Rechnung/)).toHaveCount(0);
  await expect(settingsLink(page)).not.toHaveAttribute("aria-describedby");
});

test("the theme menu offers Hell, Dunkel and System, and System follows the operating system", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.getByRole("button", { name: "Darstellung" }).click();
  await expect(page.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("menuitemradio", { name: "Hell" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Darstellung" }).click();
  await expect(page.getByRole("menuitemradio", { name: "Hell" })).toHaveAttribute("aria-checked", "true");
  await page.getByRole("menuitemradio", { name: "System" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  // Switching the OS while the app is open is picked up without a reload.
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("the stored dark theme is applied before the app's scripts run", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("app-theme", "dark"));
  // Without the app's code only index.html's own inline script can set the theme.
  await page.route(url => /\.(m?js|tsx?)$/.test(url.pathname) || url.pathname.startsWith("/@"), route => route.abort());
  await page.goto("/");

  await expect(page.locator("#root")).toBeEmpty();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("keyboard focus in the theme menu is shown with a green outline", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Darstellung" }).focus();
  await page.keyboard.press("Enter");
  const focused = page.locator('[role="menuitemradio"]:focus');

  await expect(focused).toHaveCount(1);
  await expect(focused).toHaveCSS("box-shadow", /rgb\(31, 92, 78\) 0px 0px 0px 1\.5px inset/);
});

for (const path of ["/#/settings", "/#/info"]) {
  test(`${path} fits a 320px wide phone without sideways scrolling`, { tag: ["@FR-01.06", "@FR-01.08"] }, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}

test("the signature status row keeps its text readable on a 320px phone", { tag: ["@FR-01.07"] }, async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/#/settings");
  const row = page.getByTestId("signature-status");
  const check = async (text: string) => {
    const box = (await row.boundingBox())!;
    const textBox = (await row.getByText(text).boundingBox())!;
    // The card clips overflow, so the page width alone would not show a squeezed or cut-off text.
    expect(textBox.width).toBeGreaterThanOrEqual(150);
    expect(textBox.x + textBox.width).toBeLessThanOrEqual(box.x + box.width);
  };
  await check("Noch keine Unterschrift gespeichert.");

  await page.getByLabel("Oder PNG-Datei hochladen").setInputFiles({ name: "unterschrift.png", mimeType: "image/png", buffer: PNG });
  await check("Neu zeichnen und speichern, um sie zu ersetzen.");
});
