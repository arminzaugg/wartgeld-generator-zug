import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('preview and saved invoice use the measured C5 address layout', { tag: ['@FR-01.03', '@FR-01.04'] }, async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/api/address', route => route.fulfill({
    json: { results: [{ street: 'Bahnhofstrasse', houseNumber: '1', houseNumberAddition: '', postcode: '6300', town: 'Zug' }] },
  }));
  await page.addInitScript(() => localStorage.setItem('form-settings', JSON.stringify({
    senderInfo: 'Hebamme Muster\nMusterstrasse 1\n6300 Zug',
    ortRechnungssteller: 'Zug', rechnungsDatum: '2026-11-06',
  })));
  await page.goto('/');
  await page.getByLabel('Vorname').fill('Anna');
  await page.getByLabel('Nachname').fill('Muster');
  await page.getByPlaceholder('Strasse und Hausnummer').fill('Bahnhofstrasse 1');
  await page.getByRole('option', { name: /Bahnhofstrasse/ }).click();
  await page.getByLabel('Geburtsdatum').fill('2026-10-01');
  await page.getByText('Betreuung der Gebärenden zuhause').click();
  await page.getByRole('button', { name: 'Rechnung generieren' }).click();
  await expect(page.getByText('PDF bereit')).toBeVisible({ timeout: 15_000 });
  const source = await page.locator('iframe').getAttribute('src');
  expect(source, 'PDF preview loaded').toMatch(/^data:application\/pdf/);
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Speichern' }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('Anna_Muster.pdf');
  const pdfPath = testInfo.outputPath('invoice.pdf');
  await download.saveAs(pdfPath);
  const bytes = await readFile(pdfPath);
  expect(bytes.toString('base64'), 'preview and save are identical').toBe(source!.split(',')[1]);
  const pdf = bytes.toString('latin1');
  const lines = [...pdf.matchAll(/([\d.]+) ([\d.]+) Td\s*\((.*?)\) Tj/g)]
    .map(([, x, y, text]) => ({ x: Number(x) * 25.4 / 72, y: 297 - Number(y) * 25.4 / 72, text }))
    .filter(line => line.x > 110 && line.y < 90);
  expect(lines.map(line => line.text)).toEqual([
    'Stadtverwaltung Zug', 'Fachstelle Alter und Gesundheit Stadt Zug', 'Gubelstrasse 22 Postfach', '6301 Zug',
  ]);
  for (const [i, line] of lines.entries()) {
    expect(line.x, 'recipient horizontal position').toBeCloseTo(125, 1);
    expect(line.y, 'recipient baseline').toBeCloseTo(61 + i * 5, 1);
  }
  await page.screenshot({ path: testInfo.outputPath('invoice-preview.png'), fullPage: true });
  expect(errors, 'no browser runtime errors').toEqual([]);
});
