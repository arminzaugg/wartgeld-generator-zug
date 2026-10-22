import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PDFPreview } from "@/components/PDFPreview";
import { PdfActionButtons } from "@/components/PdfActionButtons";
import { formatChf } from "@/lib/invoiceTotal";
import type { GeneratedInvoice } from "@/types/invoice";

const Bar = ({ className }: { className: string }) => <div className={`rounded-[3px] bg-muted ${className}`} />;

/** Grey placeholder sheet shown while the PDF is drawn in the browser. */
const GeneratingSheet = () => (
  <div className="flex aspect-[1/1.414] w-full flex-col gap-5 rounded-sm bg-card px-[8.5%] py-[9%] opacity-90 shadow-card">
    <div className="flex justify-between">
      <div className="flex flex-col gap-1.5"><Bar className="h-2 w-28" /><Bar className="h-1.5 w-36" /></div>
      <Bar className="h-1.5 w-16" />
    </div>
    <div className="ml-[55%] flex flex-col gap-1.5"><Bar className="h-2 w-28" /><Bar className="h-1.5 w-14" /></div>
    <div className="h-3.5 w-40 rounded-[5px] bg-border" />
    <div className="flex flex-col gap-2.5"><Bar className="h-1.5 w-full" /><Bar className="h-1.5 w-4/5" /><Bar className="h-1.5 w-3/5" /></div>
    <div className="flex-1" />
    <p className="flex items-center justify-center gap-2.5 text-sm text-foreground-secondary">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent motion-reduce:animate-none" aria-hidden="true" />
      PDF wird auf Ihrem Gerät erstellt
    </p>
  </div>
);

const EmptyState = () => (
  <div className="flex max-w-[300px] flex-col items-center gap-4 text-center">
    <div aria-hidden="true" className="flex h-[136px] w-24 flex-col gap-2 rounded-sm border bg-card px-3.5 py-4 shadow-card">
      <Bar className="h-1.5 w-3/5" /><Bar className="ml-auto h-1.5 w-2/5" />
      <div className="mt-2 h-2 w-[70%] rounded-[3px] bg-border" /><Bar className="h-1 w-full" /><Bar className="h-1 w-4/5" />
    </div>
    <p className="font-serif text-[19px] font-medium leading-6">Noch keine Rechnung</p>
    <p className="text-sm leading-[21px] text-foreground-secondary">
      Bitte füllen Sie das Formular aus und klicken Sie auf «Rechnung generieren». Die Vorschau erscheint hier.
    </p>
  </div>
);

interface PreviewPanelProps {
  invoice: GeneratedInvoice | null;
  isGenerating: boolean;
}

export const PreviewPanel = ({ invoice, isGenerating }: PreviewPanelProps) => (
  <section aria-labelledby="preview-title" className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
    <div className="flex h-10 items-center justify-between">
      <h2 id="preview-title" className="text-[22px] leading-7">Vorschau</h2>
      <div role="status">
      {isGenerating ? (
        <Badge className="bg-muted text-foreground-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          Wird erstellt
        </Badge>
      ) : invoice ? (
        <Badge className="animate-in zoom-in-90 duration-200 motion-reduce:animate-none">
          <Check strokeWidth={2.25} aria-hidden="true" />
          PDF bereit
        </Badge>
      ) : null}
      </div>
    </div>
    <div className="flex min-h-[620px] items-center justify-center rounded-xl bg-muted p-6 lg:p-8">
      {isGenerating ? <GeneratingSheet /> : invoice ? <PDFPreview pdfUrl={invoice.pdfData} className="h-[620px]" /> : <EmptyState />}
    </div>
    {invoice && !isGenerating && (
      <>
        <p className="text-center text-sm text-foreground-secondary">
          {invoice.recipient ? `An ${invoice.recipient} · ` : ""}{formatChf(invoice.total)}
        </p>
        <PdfActionButtons pdfData={invoice.pdfData} fileName={invoice.fileName} />
        {invoice.fileName && (
          <p className="text-center text-[13px] tabular-nums text-muted-foreground">Wird gespeichert als {invoice.fileName}</p>
        )}
      </>
    )}
  </section>
);
