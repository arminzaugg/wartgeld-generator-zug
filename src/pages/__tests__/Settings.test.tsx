import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { renderWithProviders } from '@/lib/__tests__/test-utils';
import { getSettings, updateSettings } from '@/lib/presetStorage';
import { serializeSettings } from '@/lib/settingsFile';

// The drawing canvas needs a real browser canvas; the page around it is what is tested here.
vi.mock('react-signature-canvas', () => ({ default: () => null }));

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

const readBlob = (blob: Blob) =>
  new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });

const settingsFile = (content: string, name = 'wartgeld-einstellungen.json') =>
  new File([content], name, { type: 'application/json' });

// @covers FR-01.06
describe('Settings export and import', () => {
  let exported: Blob[];

  beforeEach(() => {
    localStorage.clear();
    exported = [];
    // jsdom has no object URLs; the download is observed through the Blob handed over.
    URL.createObjectURL = vi.fn((blob: Blob) => {
      exported.push(blob);
      return 'blob:settings';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads the saved settings as a file', async () => {
    updateSettings({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Zug', signature: PNG });
    renderWithProviders(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Einstellungen sichern' }));

    expect(exported).toHaveLength(1);
    const file = JSON.parse(await readBlob(exported[0]));
    expect(file.settings, 'only saved fields, no defaults').toEqual({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Zug', signature: PNG });
  });

  it('keeps the download link valid until the browser has started the download', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Einstellungen sichern' }));
    expect(URL.revokeObjectURL, 'not revoked during the click (Safari downloads afterwards)').not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:settings');
    vi.useRealTimers();
  });

  it('leaves out and names a stored signature that a settings file would refuse', async () => {
    updateSettings({ senderInfo: 'Anna Muster', signature: 'data:image/jpeg;base64,/9j/4AAQ' });
    renderWithProviders(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Einstellungen sichern' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Nicht gesichert, weil ungültig: Unterschrift');
    const file = JSON.parse(await readBlob(exported[0]));
    expect(file.settings, 'the rest of the settings still move').toMatchObject({ senderInfo: 'Anna Muster' });
    expect(file.settings).not.toHaveProperty('signature');
  });

  it('warns that the file holds bank details and signature', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Bankverbindung und Unterschrift/)).toBeInTheDocument();
  });

  it('asks before replacing and then shows the imported values', async () => {
    updateSettings({ senderInfo: 'Old sender' });
    renderWithProviders(<Settings />);

    const content = serializeSettings({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Baar', signature: PNG });
    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'), settingsFile(content));

    expect(await screen.findByText(/werden ersetzt/)).toBeInTheDocument();
    expect(getSettings().senderInfo, 'nothing changes before confirming').toBe('Old sender');

    await userEvent.click(screen.getByRole('button', { name: 'Übernehmen' }));

    await waitFor(() => expect(screen.getByLabelText('Absender')).toHaveValue('Anna Muster'));
    expect(screen.getByLabelText('Ort der Ausstellung')).toHaveValue('Baar');
    expect(getSettings()).toMatchObject({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Baar', signature: PNG });
  });

  it('names the settings that the import clears', async () => {
    updateSettings({ senderInfo: 'Old sender', signature: PNG });
    renderWithProviders(<Settings />);

    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'),
      settingsFile(serializeSettings({ senderInfo: 'Anna Muster' })));

    expect(await screen.findByText(/werden ersetzt: Absender/)).toBeInTheDocument();
    expect(screen.getByText(/zurückgesetzt: Ort der Ausstellung, Rechnungsdatum, Unterschrift/)).toBeInTheDocument();
  });

  it('loads the same file again after an import', async () => {
    renderWithProviders(<Settings />);
    const file = settingsFile(serializeSettings({ senderInfo: 'Anna Muster' }));
    const input = screen.getByLabelText<HTMLInputElement>('Einstellungsdatei auswählen');

    await userEvent.upload(input, file);
    await userEvent.click(await screen.findByRole('button', { name: 'Übernehmen' }));
    expect(input.value, 'the picker is cleared so the same file triggers again').toBe('');

    await userEvent.upload(input, file);
    expect(await screen.findByRole('button', { name: 'Übernehmen' })).toBeInTheDocument();
  });

  it('shows only the result of the most recently chosen file', async () => {
    renderWithProviders(<Settings />);
    const input = screen.getByLabelText('Einstellungsdatei auswählen');
    let finishSlowRead: () => void = () => undefined;
    const realReadAsText = FileReader.prototype.readAsText;
    vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function (this: FileReader, blob: Blob) {
      if ((blob as File).name === 'slow.json') {
        finishSlowRead = () => realReadAsText.call(this, blob);
        return;
      }
      realReadAsText.call(this, blob);
    });

    await userEvent.upload(input, settingsFile(serializeSettings({ senderInfo: 'Slow' }), 'slow.json'));
    await userEvent.upload(input, settingsFile('not json', 'fast.json'));
    expect(await screen.findByText('Die Datei ist keine gültige Einstellungsdatei.')).toBeInTheDocument();

    finishSlowRead();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(screen.queryByRole('button', { name: 'Übernehmen' }), 'the older file does not come back').not.toBeInTheDocument();
  });

  it('keeps the current settings when the import is cancelled', async () => {
    updateSettings({ senderInfo: 'Old sender' });
    renderWithProviders(<Settings />);

    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'),
      settingsFile(serializeSettings({ senderInfo: 'Anna Muster' })));
    await userEvent.click(await screen.findByRole('button', { name: 'Abbrechen' }));

    expect(screen.queryByText(/werden ersetzt/)).not.toBeInTheDocument();
    expect(getSettings().senderInfo).toBe('Old sender');
  });

  it('rejects an invalid file with a message and changes nothing', async () => {
    updateSettings({ senderInfo: 'Old sender' });
    renderWithProviders(<Settings />);

    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'), settingsFile('not json'));

    expect(await screen.findByText('Die Datei ist keine gültige Einstellungsdatei.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Übernehmen' })).not.toBeInTheDocument();
    expect(getSettings().senderInfo).toBe('Old sender');
  });

  it('rejects a file over 1 MB without reading it', async () => {
    renderWithProviders(<Settings />);
    const big = settingsFile('x');
    Object.defineProperty(big, 'size', { value: 1_000_001 });
    const readAsText = vi.spyOn(FileReader.prototype, 'readAsText');

    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'), big);

    expect(await screen.findByText('Die Datei ist zu gross.')).toBeInTheDocument();
    expect(readAsText).not.toHaveBeenCalled();
  });

  it('reports when the browser cannot store the imported settings', async () => {
    updateSettings({ senderInfo: 'Old sender' });
    renderWithProviders(<Settings />);
    await userEvent.upload(screen.getByLabelText('Einstellungsdatei auswählen'),
      settingsFile(serializeSettings({ senderInfo: 'Anna Muster' })));
    await screen.findByRole('button', { name: 'Übernehmen' });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Übernehmen' }));

    expect(await screen.findByText(/konnten nicht gespeichert werden/)).toBeInTheDocument();
    vi.mocked(Storage.prototype.setItem).mockRestore();
    expect(getSettings().senderInfo).toBe('Old sender');
  });
});

// @covers FR-01.06
describe('Settings page layout and setup status', () => {
  beforeEach(() => localStorage.clear());

  it('has the shared top bar, a way back to the invoice and one main heading', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByRole('link', { name: 'Einstellungen' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Zur Rechnung' })).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('heading', { level: 1 }).map(h => h.textContent)).toEqual(['Einstellungen']);
  });

  it('shows the four sections in order', () => {
    renderWithProviders(<Settings />);
    expect(screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent))
      .toEqual(['Rechnungsstellerin', 'Ort & Datum', 'Unterschrift', 'Sichern & Laden']);
  });

  it('starts with empty fields and example placeholders when nothing is saved', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByLabelText('Absender')).toHaveValue('');
    expect(screen.getByLabelText('Absender')).toHaveAttribute('placeholder', expect.stringContaining('Vorname Name, Hebamme'));
    expect(screen.getByLabelText('Ort der Ausstellung')).toHaveValue('');
    expect(getSettings().ortRechnungssteller, 'the PDF keeps its fallback').toBe('Kanton Zug');
  });

  it('lists what is still missing and which items are done', () => {
    updateSettings({ senderInfo: 'Anna Muster' });
    renderWithProviders(<Settings />);
    const status = screen.getByRole('region', { name: /Einrichtung: noch 2 Angaben bis zur ersten Rechnung/ });
    expect(within(status).getByText('Rechnungsstellerin').closest('li')).toHaveAttribute('data-done', 'true');
    expect(within(status).getByText('Ort der Ausstellung').closest('li')).toHaveAttribute('data-done', 'false');
  });

  it('says everything is set once sender, place and signature are saved', () => {
    updateSettings({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Zug', signature: PNG });
    renderWithProviders(<Settings />);
    expect(screen.getByText(/Alles eingerichtet\./)).toBeInTheDocument();
    expect(screen.queryByText(/bis zur ersten Rechnung/)).toBeNull();
  });

  it('updates the status right after saving, without reloading the page', async () => {
    renderWithProviders(<Settings />);
    await userEvent.type(screen.getByLabelText('Ort der Ausstellung'), 'Zug');
    await userEvent.click(within(screen.getByRole('region', { name: 'Ort & Datum' })).getByRole('button', { name: 'Speichern' }));
    expect(screen.getByRole('region', { name: /noch 2 Angaben/ })).toBeInTheDocument();
  });

  it('updates the status after uploading a signature image', async () => {
    updateSettings({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Zug' });
    renderWithProviders(<Settings />);
    const png = new File([Uint8Array.from(atob(PNG.split(',')[1]), c => c.charCodeAt(0))], 'u.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText('Oder PNG-Datei hochladen'), png);
    expect(await screen.findByText(/Alles eingerichtet\./)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Gespeicherte Unterschrift' })).toBeInTheDocument();
  });

  it('does not claim a signature is saved when the browser refuses to store it', async () => {
    renderWithProviders(<Settings />);
    const png = new File([Uint8Array.from(atob(PNG.split(',')[1]), c => c.charCodeAt(0))], 'u.png', { type: 'image/png' });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    await userEvent.upload(screen.getByLabelText('Oder PNG-Datei hochladen'), png);
    expect(await screen.findAllByText('Unterschrift nicht gespeichert')).not.toHaveLength(0);
    setItem.mockRestore();
    expect(screen.queryByRole('img', { name: 'Gespeicherte Unterschrift' })).not.toBeInTheDocument();
    expect(screen.getByText('Noch keine Unterschrift gespeichert.')).toBeInTheDocument();
  });

  it('says when no signature is saved yet', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByText('Noch keine Unterschrift gespeichert.')).toBeInTheDocument();
  });

  it('saves sender, place and date together from either Speichern button, as before', async () => {
    renderWithProviders(<Settings />);
    await userEvent.type(screen.getByLabelText('Absender'), 'Anna Muster');
    await userEvent.type(screen.getByLabelText('Ort der Ausstellung'), 'Baar');
    await userEvent.click(within(screen.getByRole('region', { name: 'Rechnungsstellerin' })).getByRole('button', { name: 'Speichern' }));
    expect(getSettings()).toMatchObject({ senderInfo: 'Anna Muster', ortRechnungssteller: 'Baar' });
    expect(await screen.findAllByText('Gespeichert')).not.toHaveLength(0);
  });

  it('keeps the date hint tied to the date field', () => {
    renderWithProviders(<Settings />);
    expect(screen.getByLabelText(/Rechnungsdatum/)).toHaveAccessibleDescription('Leer lassen, um jeweils das aktuelle Datum zu verwenden.');
  });
});
