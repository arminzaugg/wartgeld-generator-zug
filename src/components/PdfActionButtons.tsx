import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadPdf, printPdf } from "@/lib/pdfActions";
import { cn } from "@/lib/utils";

interface PdfActionButtonsProps {
  pdfData: string;
  fileName: string | null;
  /** Phone sheet: taller buttons, save as the main action. */
  large?: boolean;
}

export const PdfActionButtons = ({ pdfData, fileName, large = false }: PdfActionButtonsProps) => (
  <div className="grid grid-cols-2 gap-3">
    <Button type="button" variant="outline" className={cn(large && "h-[52px] rounded-lg text-base")} onClick={() => printPdf(pdfData)}>
      <Printer className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
      Drucken
    </Button>
    <Button
      type="button"
      variant={large ? "default" : "outline"}
      className={cn(large && "h-[52px] rounded-lg text-base")}
      disabled={!fileName}
      onClick={() => fileName && downloadPdf(pdfData, fileName)}
    >
      <Download className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden="true" />
      Speichern
    </Button>
  </div>
);
