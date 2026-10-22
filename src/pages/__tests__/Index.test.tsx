import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import Index from '../Index';
import { renderWithProviders, createMockPdfUrl } from '@/lib/__tests__/test-utils';
import { pdfGenerationService } from '@/services/pdf/pdfGenerationService';

vi.mock('@/services/pdf/pdfGenerationService', () => ({
  pdfGenerationService: { generatePDF: vi.fn() },
}));

const dorfstrasse = { street: 'Dorfstrasse', houseNumber: '3', houseNumberAddition: '', postcode: '6319', town: 'Allenwinden' };

// Media-query boundary: a fake whose width can change while the page is open.
let phoneNow = false;
let mediaListeners: (() => void)[] = [];
const setPhone = (phone: boolean) => {
  phoneNow = phone;
  mediaListeners = [];
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    get matches() { return phoneNow; }, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn(),
    addEventListener: vi.fn((_: string, listener: () => void) => { mediaListeners.push(listener); }),
    removeEventListener: vi.fn(),
  }));
};
const resizeTo = (phone: boolean) => act(() => { phoneNow = phone; mediaListeners.forEach(listener => listener()); });

const fillValidForm = async () => {
  fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Anna' } });
  fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Muster' } });
  fireEvent.change(screen.getByRole('combobox', { name: 'Adresse' }), { target: { value: 'Dorfstrasse 3' } });
  fireEvent.mouseDown(await screen.findByRole('option', { name: /Dorfstrasse/ }));
  fireEvent.change(screen.getByLabelText('Geburtsdatum'), { target: { value: '2026-10-01' } });
  fireEvent.click(screen.getByRole('checkbox', { name: /Betreuung der Gebärenden/ }));
};

const generate = () => fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

describe('Index', () => {
  beforeEach(() => {
    localStorage.clear();
    setPhone(false);
    vi.mocked(pdfGenerationService.generatePDF).mockResolvedValue(createMockPdfUrl());
    // System boundary: the same-origin address lookup service.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ results: [dorfstrasse] })));
  });
  afterEach(() => vi.restoreAllMocks());

  // @covers FR-01.01
  it('titles the page "Neue Rechnung" as its only main heading', () => {
    renderWithProviders(<Index />);
    expect(screen.getAllByRole('heading', { level: 1 }).map(h => h.textContent)).toEqual(['Neue Rechnung']);
  });

  // @covers FR-01.01
  it('links to information and settings from the top bar', () => {
    renderWithProviders(<Index />);
    expect(screen.getByRole('link', { name: 'Information' })).toHaveAttribute('href', '/info');
    expect(screen.getByRole('link', { name: 'Einstellungen' })).toHaveAttribute('href', '/settings');
  });

  // @covers FR-01.06
  it('reminds a new midwife to complete her settings, between the intro and the privacy note', () => {
    renderWithProviders(<Index />);
    const notice = screen.getByText('Noch 3 Angaben bis zur ersten Rechnung');
    const privacy = screen.getByText('Patientendaten bleiben in diesem Browser.');
    expect(notice.compareDocumentPosition(privacy) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Rechnung generieren' }), 'never blocks generating').toBeEnabled();
  });

  // @covers FR-01.08
  it('says patient data stays in the browser and only the address goes to the Post via the own service', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText('Patientendaten bleiben in diesem Browser.')).toBeInTheDocument();
    expect(screen.getByText(/eingegebene Adresse.*eigenen Adressdienst.*Schweizerische Post/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mehr erfahren' })).toHaveAttribute('href', '/info');
  });

  // @covers FR-01.04
  it('shows an empty preview before an invoice is generated', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText('Noch keine Rechnung')).toBeInTheDocument();
  });

  // @covers FR-01.01
  it('shows a notice with a link to change a fixed invoice date', () => {
    localStorage.setItem('form-settings', JSON.stringify({ rechnungsDatum: '2025-03-01' }));
    renderWithProviders(<Index />);
    expect(screen.getByText(/Rechnungsdatum fest eingestellt auf 01\.03\.2025/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ändern' })).toHaveAttribute('href', '/settings');
  });

  // @covers FR-01.01
  it('shows no notice when the invoice date is today', () => {
    renderWithProviders(<Index />);
    expect(screen.queryByText(/Rechnungsdatum fest eingestellt/)).not.toBeInTheDocument();
  });

  // @covers FR-01.01
  it('shows where the invoice goes once the address is picked', async () => {
    renderWithProviders(<Index />);
    await fillValidForm();
    expect(screen.getByText('Einwohnergemeinde Baar')).toBeInTheDocument();
  });

  // @covers FR-01.04
  it('shows the busy state while the invoice is made, then the finished PDF with print and save', async () => {
    let finish: (pdf: string) => void = () => {};
    vi.mocked(pdfGenerationService.generatePDF).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    renderWithProviders(<Index />);
    await fillValidForm();

    generate();

    expect(await screen.findByRole('button', { name: /Rechnung wird erstellt/ })).toBeDisabled();
    expect(screen.getByText('PDF wird auf Ihrem Gerät erstellt')).toBeInTheDocument();

    finish(createMockPdfUrl());

    expect(await screen.findByText('PDF bereit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Drucken' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeInTheDocument();
    expect(screen.getByText('Wird gespeichert als Anna_Muster.pdf')).toBeInTheDocument();
    expect(screen.getByText('An Einwohnergemeinde Baar · CHF 400.00')).toBeInTheDocument();
  });

  // @covers FR-01.04
  it('keeps describing the generated invoice when the form is edited afterwards', async () => {
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    await screen.findByText('PDF bereit');

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'Lea' } });

    expect(screen.getByText('Wird gespeichert als Anna_Muster.pdf')).toBeInTheDocument();
  });

  // @covers FR-01.04
  it('on a phone, opens the finished invoice in a panel that can be closed and reopened', async () => {
    setPhone(true);
    renderWithProviders(<Index />);
    await fillValidForm();
    expect(document.querySelector('iframe'), 'no embedded preview on phones').toBeNull();

    generate();

    const sheet = await screen.findByRole('dialog', { name: 'Rechnung bereit' });
    expect(within(sheet).getByText('An Einwohnergemeinde Baar · CHF 400.00')).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Drucken' })).toBeInTheDocument();
    expect(within(sheet).getByRole('button', { name: 'Speichern' })).toBeInTheDocument();
    expect(document.querySelectorAll('iframe')).toHaveLength(1);

    fireEvent.keyDown(sheet, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByLabelText('Vorname')).toHaveValue('Anna');

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung anzeigen' }));
    expect(await screen.findByRole('dialog', { name: 'Rechnung bereit' })).toBeInTheDocument();
  });

  // @covers FR-01.04
  it('on a phone, focuses the close button when the panel opens and returns focus to "Rechnung anzeigen" when it closes', async () => {
    setPhone(true);
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    const sheet = await screen.findByRole('dialog', { name: 'Rechnung bereit' });
    await waitFor(() => expect(within(sheet).getByRole('button', { name: 'Schliessen' })).toHaveFocus());

    fireEvent.keyDown(sheet, { key: 'Escape' });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Rechnung anzeigen' })).toHaveFocus());
  });

  // @covers FR-01.04
  it('closes the panel and shows the preview when the screen grows past phone width', async () => {
    setPhone(true);
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    await screen.findByRole('dialog', { name: 'Rechnung bereit' });

    resizeTo(false);

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('PDF bereit')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechnung generieren' }), 'focus does not jump into the form').not.toHaveFocus();
  });

  // @covers FR-01.04
  it('a reset while the invoice is being made clears the form and drops that invoice', async () => {
    let finish: (pdf: string) => void = () => {};
    vi.mocked(pdfGenerationService.generatePDF).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    await screen.findByRole('button', { name: /Rechnung wird erstellt/ });

    fireEvent.click(screen.getByRole('button', { name: 'Zurücksetzen' }));
    await act(async () => finish(createMockPdfUrl()));

    expect(screen.getByRole('button', { name: 'Rechnung generieren' })).toBeEnabled();
    expect(screen.getByLabelText('Vorname')).toHaveValue('');
    expect(screen.queryByText('PDF bereit')).toBeNull();
  });

  // @covers FR-01.04
  it('drops an invoice still being made when the address changes meanwhile', async () => {
    let finish: (pdf: string) => void = () => {};
    vi.mocked(pdfGenerationService.generatePDF).mockReturnValue(new Promise(resolve => { finish = resolve; }));
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    await screen.findByRole('button', { name: /Rechnung wird erstellt/ });

    fireEvent.change(screen.getByRole('combobox', { name: 'Adresse' }), { target: { value: 'Seestrasse 1' } });
    await act(async () => finish(createMockPdfUrl()));

    expect(screen.queryByText('PDF bereit')).toBeNull();
    expect(screen.getByText('Noch keine Rechnung')).toBeInTheDocument();
  });

  // @covers FR-01.04
  it('on a desktop, shows the invoice in the page instead of a panel', async () => {
    renderWithProviders(<Index />);
    await fillValidForm();
    generate();
    await screen.findByText('PDF bereit');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
