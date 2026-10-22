import { Check } from "lucide-react";
import { Sheet, SheetCloseButton, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { PDFPreview } from "@/components/PDFPreview";
import { PdfActionButtons } from "@/components/PdfActionButtons";
import { isPhoneViewport } from "@/hooks/useIsPhone";
import { formatChf } from "@/lib/invoiceTotal";
import type { GeneratedInvoice } from "@/types/invoice";

interface PdfSheetProps {
  invoice: GeneratedInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Phones only: the finished invoice slides up from the bottom with print and save. */
export const PdfSheet = ({ invoice, open, onOpenChange }: PdfSheetProps) => (
  <Sheet open={open && !!invoice} onOpenChange={onOpenChange}>
    <SheetContent
      className="top-[72px]"
      // Focus the close button rather than the PDF frame.
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLElement).querySelector<HTMLElement>("[data-sheet-close]")?.focus();
      }}
      // The sheet has no trigger, so Radix would drop focus on <body>; return it to "Rechnung anzeigen".
      // Closed by growing past phone width: leave focus alone rather than jump to the form.
      onCloseAutoFocus={(e) => {
        e.preventDefault();
        if (!isPhoneViewport()) return;
        (document.getElementById("show-pdf-button") ?? document.querySelector<HTMLElement>("form button[type=submit]"))?.focus();
      }}
    >
      {invoice && (
        <>
          <div className="flex items-center justify-between py-3 pl-5 pr-3">
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="flex items-center gap-2">
                Rechnung bereit
                <span aria-hidden="true" className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-[13px] w-[13px]" strokeWidth={3} />
                </span>
              </SheetTitle>
              <SheetDescription>
                {invoice.recipient ? `An ${invoice.recipient} · ` : ""}{formatChf(invoice.total)}
              </SheetDescription>
            </div>
            <SheetCloseButton data-sheet-close="" />
          </div>
          {/* Buttons come before the PDF in reading order and stay visible; phones often cannot render PDF frames. */}
          <div className="order-last px-4 pb-2 pt-4">
            <PdfActionButtons pdfData={invoice.pdfData} fileName={invoice.fileName} large />
            {invoice.fileName && <p className="pb-4 pt-3 text-center text-[13px] text-muted-foreground">{invoice.fileName}</p>}
          </div>
          <div className="mx-4 min-h-0 flex-1 overflow-hidden rounded-xl bg-muted px-6 py-5">
            <PDFPreview pdfUrl={invoice.pdfData} className="h-full min-h-[240px]" />
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);
