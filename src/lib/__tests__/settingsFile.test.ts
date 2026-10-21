import { describe, it, expect } from 'vitest';
import { MAX_SETTINGS_FILE_BYTES, parseSettingsFile, serializeSettings } from '../settingsFile';

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const fileWith = (settings: unknown, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ format: 'wartgeld-einstellungen', version: 1, settings, ...extra });

// @covers FR-01.06
describe('settings file', () => {
  it('reads back exactly what was exported', () => {
    const settings = {
      senderInfo: 'Anna Muster\nIBAN CH00 0000',
      ortRechnungssteller: 'Zug',
      rechnungsDatum: '2026-10-21',
      signature: PNG,
    };
    expect(parseSettingsFile(serializeSettings(settings))).toEqual({ ok: true, settings });
  });

  it('exports only the fields that are stored', () => {
    const text = serializeSettings({ senderInfo: 'Anna' });
    expect(JSON.parse(text)).toEqual({ format: 'wartgeld-einstellungen', version: 1, settings: { senderInfo: 'Anna' } });
  });

  it('accepts an empty invoice date (means "today")', () => {
    expect(parseSettingsFile(fileWith({ rechnungsDatum: '' }))).toEqual({ ok: true, settings: { rechnungsDatum: '' } });
  });

  it.each([
    ['text that is not JSON', 'hello'],
    ['a JSON array', '[]'],
    ['another file format', JSON.stringify({ format: 'other', version: 1, settings: {} })],
    ['a newer version', JSON.stringify({ format: 'wartgeld-einstellungen', version: 2, settings: {} })],
    ['an extra top-level field', fileWith({}, { note: 'x' })],
    ['settings that are not an object', fileWith('Anna')],
    ['an unknown settings field', fileWith({ senderInfo: 'Anna', iban: 'CH00' })],
    ['a non-text sender block', fileWith({ senderInfo: 42 })],
    ['a sender block over 2000 characters', fileWith({ senderInfo: 'x'.repeat(2001) })],
    ['a place over 100 characters', fileWith({ ortRechnungssteller: 'x'.repeat(101) })],
    ['a malformed invoice date', fileWith({ rechnungsDatum: '21.10.2026' })],
    ['an impossible invoice date', fileWith({ rechnungsDatum: '2026-02-30' })],
    ['a signature that is not an image', fileWith({ signature: 'javascript:alert(1)' })],
    ['a JPEG signature', fileWith({ signature: 'data:image/jpeg;base64,/9j/4AAQ' })],
    ['a PNG label on non-PNG data', fileWith({ signature: 'data:image/png;base64,R0lGODlh' })],
    ['a signature with characters outside base64', fileWith({ signature: `${PNG}"><script>` })],
    ['a PNG signature cut off after the header', fileWith({ signature: 'data:image/png;base64,iVBORw0KGgo=' })],
    ['a PNG signature missing its end', fileWith({ signature: PNG.slice(0, -16) })],
  ])('rejects %s', (_, text) => {
    const result = parseSettingsFile(text);
    expect(result.ok, 'the file must be refused').toBe(false);
    if (!result.ok) expect(result.error).toMatch(/\S/);
  });

  it('rejects a file larger than the limit before parsing it', () => {
    const text = fileWith({ senderInfo: 'x'.repeat(MAX_SETTINGS_FILE_BYTES) });
    expect(parseSettingsFile(text)).toEqual({ ok: false, error: expect.stringMatching(/zu gross/) });
  });

  it('refuses a __proto__ payload without touching Object.prototype', () => {
    const result = parseSettingsFile('{"format":"wartgeld-einstellungen","version":1,"settings":{"__proto__":{"polluted":true}}}');
    expect(result.ok).toBe(false);
    expect(({} as Record<string, unknown>).polluted, 'Object.prototype stays clean').toBeUndefined();
  });

  it('returns a plain object holding only the known fields', () => {
    const result = parseSettingsFile(fileWith({ senderInfo: 'Anna' }));
    expect(result.ok && Object.getPrototypeOf(result.settings)).toBe(Object.prototype);
    expect(result.ok && Object.keys(result.settings)).toEqual(['senderInfo']);
  });
});
