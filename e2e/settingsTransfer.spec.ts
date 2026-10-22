import { test, expect } from "@playwright/test";

// Moving to a new web address: settings saved on one browser profile are loaded in a fresh one.
test("settings saved to a file are used for invoices after loading them elsewhere", { tag: ["@FR-01.06"] }, async ({ browser }) => {
  const oldSite = await browser.newPage();
  await oldSite.goto("/#/settings");
  await oldSite.getByLabel("Absender").fill("Anna Hebamme\nSeestrasse 1\n6300 Zug");
  await oldSite.getByRole("button", { name: "Speichern", exact: true }).first().click();

  const downloading = oldSite.waitForEvent("download");
  await oldSite.getByRole("button", { name: "Einstellungen sichern" }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("wartgeld-einstellungen.json");
  const file = await download.path();

  const newContext = await browser.newContext();
  const newSite = await newContext.newPage();
  await newSite.route("**/api/address", route => route.fulfill({
    json: { results: [{ street: "Dorfstrasse", houseNumber: "", houseNumberAddition: "", postcode: "6319", town: "Allenwinden" }] },
  }));
  await newSite.goto("/#/settings");
  await expect(newSite.getByLabel("Absender")).not.toHaveValue(/Anna Hebamme/);

  await newSite.getByLabel("Einstellungsdatei auswählen").setInputFiles(file);
  await newSite.getByRole("button", { name: "Übernehmen" }).click();
  await expect(newSite.getByLabel("Absender")).toHaveValue(/Anna Hebamme/);

  await newSite.goto("/#/");
  await newSite.getByLabel("Vorname").fill("Lea");
  await newSite.getByLabel("Nachname").fill("Muster");
  await newSite.getByPlaceholder("Strasse und Hausnummer").fill("Dorfstrasse 3");
  await newSite.getByRole("option", { name: /Dorfstrasse/ }).click();
  await newSite.getByLabel("Geburtsdatum").fill("2026-10-01");
  await newSite.getByLabel(/Betreuung der Gebärenden/).check();
  await newSite.getByRole("button", { name: "Rechnung generieren" }).click();

  const preview = newSite.locator("iframe");
  await expect(preview).toHaveAttribute("src", /^data:application\/pdf/, { timeout: 15_000 });
  const pdf = Buffer.from(((await preview.getAttribute("src")) ?? "").split(",")[1], "base64").toString("latin1");
  expect(pdf).toContain("(Anna Hebamme)");
  await newContext.close();
  await oldSite.context().close();
});
