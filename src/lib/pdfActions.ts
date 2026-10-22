import { dataUriToBlob } from '@/lib/pdf';
import type { FormValues } from '@/types/form';

/** File name of the saved invoice; null until both names are known. */
export const pdfFileName = (values: Pick<FormValues, 'vorname' | 'nachname'>): string | null =>
  values.vorname && values.nachname ? `${values.vorname}_${values.nachname}.pdf` : null;

// iPhone and iPad Safari never draw a PDF inside a hidden frame, so printing that frame gives a
// blank page. iPadOS reports itself as a Mac; the touch points tell it apart.
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

// The new tab needs the object URL while it loads, so it is released later, not right away.
// Returns false when the browser blocked the tab.
const openInNewTab = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const tab = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return tab !== null;
};

/**
 * On iOS the system share menu (which offers «Drucken») gets the invoice; without file sharing,
 * the invoice opens in a new tab with Safari's own PDF view. Both must start within the tap.
 * A tab opened after a failed share is no longer part of the tap and may be blocked: then
 * `onFailed` lets the page tell the user.
 */
const printOnIOS = (blob: Blob, fileName: string, onFailed?: () => void) => {
  const file = new File([blob], fileName, { type: 'application/pdf' });
  if (!navigator.canShare?.({ files: [file] })) {
    if (!openInNewTab(blob)) onFailed?.();
    return;
  }
  navigator.share({ files: [file] }).catch((error: unknown) => {
    // Closing the share menu without choosing, or a second tap while it opens, is not an error.
    if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'InvalidStateError')) return;
    if (!openInNewTab(blob)) onFailed?.();
  });
};

export const printPdf = (pdfData: string, fileName: string | null, onFailed?: () => void) => {
  const blob = dataUriToBlob(pdfData);
  if (isIOS()) {
    printOnIOS(blob, fileName ?? 'Rechnung.pdf', onFailed);
    return;
  }
  const url = URL.createObjectURL(blob);

  // Create an iframe for printing
  const printFrame = document.createElement('iframe');
  printFrame.style.display = 'none';
  document.body.appendChild(printFrame);

  const cleanup = () => {
    document.body.removeChild(printFrame);
    URL.revokeObjectURL(url);
  };

  printFrame.onload = () => {
    const iframeWindow = printFrame.contentWindow;
    if (!iframeWindow) return;

    iframeWindow.addEventListener('afterprint', () => {
      // Print dialog has been closed after printing
      cleanup();
    });

    iframeWindow.addEventListener('printcancel', () => {
      // Print dialog has been cancelled
      cleanup();
    });

    // Trigger print
    iframeWindow.print();
  };

  printFrame.src = url;
};

export const downloadPdf = (pdfData: string, fileName: string) => {
  const blob = dataUriToBlob(pdfData);
  const url = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
};
