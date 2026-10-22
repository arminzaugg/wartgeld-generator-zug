import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadPdf, pdfFileName, printPdf } from '../pdfActions';
import { createMockPdfUrl } from './test-utils';

// @covers FR-01.04
describe('pdfActions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('names the saved file after the mother', () => {
    expect(pdfFileName({ vorname: 'Anna', nachname: 'Muster' })).toBe('Anna_Muster.pdf');
  });

  it('gives no file name while a name is missing', () => {
    expect(pdfFileName({ vorname: 'Anna', nachname: '' })).toBeNull();
    expect(pdfFileName({ vorname: '', nachname: 'Muster' })).toBeNull();
  });

  it('downloads the PDF under the given file name', () => {
    // jsdom has no object URLs.
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:pdf'), revokeObjectURL: vi.fn() });
    const clicked: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });

    downloadPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(clicked).toEqual(['Anna_Muster.pdf']);
  });
});

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';

// The browser is the boundary here: user agent, share menu, new tabs and object URLs.
const browser = ({ userAgent, maxTouchPoints = 0, share, canShare = !!share, tabOpens = true }: {
  userAgent: string; maxTouchPoints?: number; share?: (data: ShareData) => Promise<void>;
  canShare?: boolean; tabOpens?: boolean;
}) => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
  Object.defineProperty(navigator, 'share', { value: share, configurable: true });
  Object.defineProperty(navigator, 'canShare', { value: share ? () => canShare : undefined, configurable: true });
  Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:pdf'), revokeObjectURL: vi.fn() });
  // A blocked pop-up gives null, as Safari does for window.open outside a tap.
  return { open: vi.spyOn(window, 'open').mockReturnValue(tabOpens ? ({} as Window) : null) };
};

const resetBrowser = () => {
  vi.restoreAllMocks();
  for (const key of ['maxTouchPoints', 'share', 'canShare']) delete (navigator as unknown as Record<string, unknown>)[key];
  document.querySelectorAll('iframe').forEach(frame => frame.remove());
};

const frames = () => document.querySelectorAll('iframe').length;

// @covers FR-01.04
describe('printing on iPhone and iPad', () => {
  afterEach(resetBrowser);

  it('opens the share menu with the invoice as a PDF named after the mother, instead of printing a blank frame', () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    const { open } = browser({ userAgent: IPHONE, share });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(share).toHaveBeenCalledTimes(1);
    const [file] = share.mock.calls[0][0].files!;
    expect(file.name).toBe('Anna_Muster.pdf');
    expect(file.type).toBe('application/pdf');
    expect(frames(), 'no hidden print frame on iOS').toBe(0);
    expect(open).not.toHaveBeenCalled();
  });

  it('treats an iPad, which reports itself as a Mac with touch, like an iPhone', () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    browser({ userAgent: MAC, maxTouchPoints: 5, share });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(share).toHaveBeenCalledTimes(1);
  });

  it('uses a neutral file name while the mother\'s name is incomplete', () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    browser({ userAgent: IPHONE, share });

    printPdf(createMockPdfUrl(), null);

    expect(share.mock.calls[0][0].files![0].name).toBe('Rechnung.pdf');
  });

  it('does nothing more when the share menu is closed without choosing', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.reject(new DOMException('cancelled', 'AbortError')));
    const { open } = browser({ userAgent: IPHONE, share });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');
    await vi.waitFor(() => expect(share).toHaveBeenCalled());
    await Promise.resolve();

    expect(open).not.toHaveBeenCalled();
  });

  it('ignores a second tap while the share menu is still opening', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.reject(new DOMException('busy', 'InvalidStateError')));
    const { open } = browser({ userAgent: IPHONE, share });
    const onFailed = vi.fn();

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf', onFailed);
    await vi.waitFor(() => expect(share).toHaveBeenCalled());
    await Promise.resolve();

    expect(open, 'no extra tab behind the share menu').not.toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('opens the invoice in a new tab when the share menu fails', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.reject(new DOMException('denied', 'NotAllowedError')));
    const { open } = browser({ userAgent: IPHONE, share });
    const onFailed = vi.fn();

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf', onFailed);

    await vi.waitFor(() => expect(open).toHaveBeenCalledWith('blob:pdf', '_blank'));
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('reports the failure when Safari also blocks the new tab', async () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.reject(new DOMException('denied', 'NotAllowedError')));
    browser({ userAgent: IPHONE, share, tabOpens: false });
    const onFailed = vi.fn();

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf', onFailed);

    await vi.waitFor(() => expect(onFailed, 'the user is told instead of seeing nothing').toHaveBeenCalledTimes(1));
  });

  it('opens the invoice in a new tab when the share menu cannot take PDF files', () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    const { open } = browser({ userAgent: IPHONE, share, canShare: false });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(open).toHaveBeenCalledWith('blob:pdf', '_blank');
    expect(share).not.toHaveBeenCalled();
    expect(frames()).toBe(0);
  });

  it('opens the invoice in a new tab on iPhones that cannot share files', () => {
    const { open } = browser({ userAgent: IPHONE });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(open).toHaveBeenCalledWith('blob:pdf', '_blank');
    expect(frames()).toBe(0);
  });
});

// @covers FR-01.04
describe('printing on a computer', () => {
  afterEach(resetBrowser);

  it('still prints through a hidden frame and never opens the share menu', () => {
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    const { open } = browser({ userAgent: MAC, share });

    printPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(frames()).toBe(1);
    expect(share).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });
});
