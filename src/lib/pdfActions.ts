import { dataUriToBlob } from '@/lib/pdf';
import type { FormValues } from '@/types/form';

/** File name of the saved invoice; null until both names are known. */
export const pdfFileName = (values: Pick<FormValues, 'vorname' | 'nachname'>): string | null =>
  values.vorname && values.nachname ? `${values.vorname}_${values.nachname}.pdf` : null;

export const printPdf = (pdfData: string) => {
  const blob = dataUriToBlob(pdfData);
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
