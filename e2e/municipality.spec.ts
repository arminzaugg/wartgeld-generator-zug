import { test, expect, type Page } from "@playwright/test";

// Swiss Post suggestions as the address-lookup function returns them; stubbed
// so the test needs neither Supabase nor Swiss Post.
const suggestion = (street: string, zip: string, town: string) => ({
  Canton: "ZG", CountryCode: "CH", HouseKey: "", HouseNo: "", HouseNoAddition: "",
  ONRP: "1", STRID: "1", StreetName: street, TownName: town, ZipAddition: "00", ZipCode: zip,
});

const stubAddressLookup = (page: Page, results: ReturnType<typeof suggestion>[]) =>
  page.route("**/functions/v1/address-lookup", route =>
    route.fulfill({ json: { QueryAutoComplete4Result: { AutoCompleteResult: results } } }));

const pickAddress = async (page: Page, typed: string, option: RegExp) => {
  await page.getByPlaceholder(/Adresse eingeben/).fill(typed);
  await page.getByRole("option", { name: option }).click();
};

const municipality = (page: Page) => page.getByLabel("Zuständige Gemeinde");

test("proposes Baar for an Allenwinden address", { tag: ["@FR-01.01"] }, async ({ page }) => {
  await stubAddressLookup(page, [suggestion("Dorfstrasse", "6319", "Allenwinden")]);
  await page.goto("/");

  await pickAddress(page, "Dorfstrasse 3", /Dorfstrasse/);

  await expect(municipality(page)).toHaveValue("1701");
  await expect(page.getByText(/gehört zu mehreren Gemeinden/)).toHaveCount(0);
});

// @covers FR-01.01 FR-01.03 FR-01.05
test("a Neuägeri invoice goes to the municipality the midwife chose, without leaving the app", { tag: ["@FR-01.01", "@FR-01.03", "@FR-01.05"] }, async ({ page }) => {
  await stubAddressLookup(page, [suggestion("Hauptstrasse", "6314", "Neuägeri")]);
  await page.goto("/");
  const origin = new URL(page.url()).origin;

  await page.getByLabel("Vorname").fill("Anna");
  await page.getByLabel("Nachname").fill("Muster");
  await pickAddress(page, "Hauptstrasse 7", /Hauptstrasse/);
  await expect(municipality(page)).toHaveValue("");
  await expect(page.getByText(/gehört zu mehreren Gemeinden/)).toBeVisible();

  await municipality(page).selectOption({ label: "Menzingen" });
  await page.getByLabel("Datum der Geburt").fill("2026-10-01");
  await page.getByLabel(/Betreuung der Gebärenden/).check();

  // From here on the invoice is produced; nothing may leave the app's origin.
  const external: string[] = [];
  page.on("request", request => {
    const url = request.url();
    if (!url.startsWith(origin) && !url.startsWith("data:") && !url.startsWith("blob:")) external.push(url);
  });
  await page.getByRole("button", { name: "Rechnung Generieren" }).click();

  const preview = page.locator("iframe");
  await expect(preview).toHaveAttribute("src", /^data:application\/pdf/, { timeout: 15_000 });
  const pdfSrc = (await preview.getAttribute("src")) ?? "";
  const pdf = Buffer.from(pdfSrc.split(",")[1], "base64").toString("latin1");
  expect(pdf).toContain("(6313 Menzingen)");
  expect(pdf).toContain("(Soziales und Gesundheit)");
  expect(external).toEqual([]);

  // A corrected municipality makes the generated invoice outdated: no print/save of the old one.
  await municipality(page).selectOption({ label: "Unterägeri" });
  await expect(preview).toHaveCount(0);
  await expect(page.getByText("Bitte füllen Sie das Formular aus")).toBeVisible();

  await page.getByRole("button", { name: "Formular Zurücksetzen" }).click();
  await expect(municipality(page)).toHaveValue("");
  await expect(municipality(page)).toBeDisabled();
});
