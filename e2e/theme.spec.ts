import { test, expect, type Page } from "@playwright/test";

const generateButton = (page: Page) => page.getByRole("button", { name: "Rechnung generieren" });

const computed = (page: Page, selector: string, property: string) =>
  page.locator(selector).first().evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);

const chooseTheme = async (page: Page, label: "Light" | "Dark") => {
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: label }).click();
};

test("light theme uses the paper background and the fir-green main button", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.goto("/");
  await chooseTheme(page, "Light");
  await page.mouse.move(0, 0);

  expect(await computed(page, "body", "background-color")).toBe("rgb(246, 243, 236)");
  await expect(generateButton(page)).toHaveCSS("background-color", "rgb(31, 92, 78)");
  await expect(generateButton(page)).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("dark theme is remembered across a reload and uses the dark palette", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.goto("/");
  await chooseTheme(page, "Dark");
  await page.reload();
  await page.mouse.move(0, 0);

  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await computed(page, "body", "background-color")).toBe("rgb(18, 21, 19)");
  await expect(generateButton(page)).toHaveCSS("background-color", "rgb(134, 201, 179)");
  // Native controls such as the date picker icon follow the dark palette.
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("headings use Newsreader and body text Instrument Sans, both actually loaded", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.goto("/");

  expect(await computed(page, "body", "font-family")).toMatch(/^"?Instrument Sans"?/);
  expect(await computed(page, "h1", "font-family")).toMatch(/^"?Newsreader"?/);
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([document.fonts.load('500 16px "Newsreader"'), document.fonts.load('400 16px "Instrument Sans"')]);
    return [document.fonts.check('500 16px "Newsreader"'), document.fonts.check('400 16px "Instrument Sans"')];
  });
  expect(loaded).toEqual([true, true]);
});

test("form controls have the designed sizes", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.goto("/");

  const input = page.getByLabel("Vorname");
  await expect(input).toHaveCSS("height", "48px");
  await expect(input).toHaveCSS("border-radius", "10px");
  await expect(generateButton(page)).toHaveCSS("height", "48px");
  await expect(generateButton(page)).toHaveCSS("border-radius", "10px");
  await expect(page.getByTestId("invoice-form-card")).toHaveCSS("border-radius", "16px");
  const checkbox = page.getByRole("checkbox").first();
  await expect(checkbox).toHaveCSS("width", "22px");
  await expect(checkbox).toHaveCSS("height", "22px");
  await expect(page.getByLabel("Zuständige Gemeinde")).toHaveCSS("height", "48px");
});

test("keyboard focus on the municipality select shows the green border and halo", { tag: ["@FR-01.09"] }, async ({ page }) => {
  await page.route("**/api/address", route => route.fulfill({ json: { results: [
    { street: "Dorfstrasse", houseNumber: "", houseNumberAddition: "", postcode: "6319", town: "Allenwinden" },
  ] } }));
  await page.goto("/");
  await chooseTheme(page, "Light");
  await page.getByPlaceholder("Strasse und Hausnummer").fill("Dorfstrasse 3");
  await page.getByRole("option", { name: /Dorfstrasse/ }).click();

  // Reach the select by keyboard (Shift+Tab from the first service) so :focus-visible applies.
  await page.getByRole("checkbox").first().focus();
  await page.keyboard.press("Shift+Tab");
  const select = page.getByLabel("Zuständige Gemeinde");

  await expect(select).toBeFocused();
  await expect(select).toHaveCSS("border-color", "rgb(31, 92, 78)");
  await expect(select).toHaveCSS("box-shadow", /rgba\(31, 92, 78, 0\.22\) 0px 0px 0px 4px$/);
});

test("the start page contacts no host other than the app", { tag: ["@FR-01.08"] }, async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const external: string[] = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith(origin) && !url.startsWith("data:") && !url.startsWith("blob:")) external.push(url);
  });

  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");

  expect(external).toEqual([]);
});
