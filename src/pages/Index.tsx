import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { PrivacyNote } from "@/components/PrivacyNote";
import { PreviewPanel } from "@/components/PreviewPanel";
import { PdfSheet } from "@/components/PdfSheet";
import { FormContainer } from "@/features/form/components/FormContainer";
import { recipientLabel } from "@/lib/recipient";
import { useToast } from "@/components/ui/use-toast";
import { pdfGenerationService } from "@/services/pdf/pdfGenerationService";
import { emptyFormValues, type FormValues } from "@/types/form";
import type { GeneratedInvoice } from "@/types/invoice";
import { UnknownMunicipalityError } from "@/lib/municipality";
import { applyAddressChange } from "@/features/form/addressChange";
import { getSettings } from "@/lib/presetStorage";
import { invoiceTotal } from "@/lib/invoiceTotal";
import { pdfFileName } from "@/lib/pdfActions";
import { isPhoneViewport, useIsPhone } from "@/hooks/useIsPhone";

const Index = () => {
  const [formData, setFormData] = useState<FormValues>(emptyFormValues);
  // The generated PDF (as data URI) together with what it says; used for preview, print and save.
  const [invoice, setInvoice] = useState<GeneratedInvoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetRequested, setSheetRequested] = useState(false);
  // Results of a generation started before the latest reset are dropped.
  const generation = useRef(0);
  const { toast } = useToast();
  const isPhone = useIsPhone();
  const fixedInvoiceDate = getSettings().rechnungsDatum;

  // The sheet is a phone affordance; on a wider screen the preview panel shows the invoice instead.
  useEffect(() => {
    if (!isPhone) setSheetRequested(false);
  }, [isPhone]);

  // Outdates the shown invoice and any generation still running for the old entries.
  const clearInvoice = useCallback(() => {
    generation.current += 1;
    setIsGenerating(false);
    setInvoice(null);
    setSheetRequested(false);
  }, []);

  const handleFieldChange = (field: string, value: string | boolean) => {
    // The invoice names the municipality; a new choice makes the generated one outdated.
    if (field === "gemeindeBfs") clearInvoice();
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Stable identity: StreetLookup lists it as an effect dependency.
  const handleAddressChange = useCallback((street: string, zipCode?: string, city?: string) => {
    setFormData(prev => applyAddressChange(prev, street, zipCode, city));
    clearInvoice();
  }, [clearInvoice]);

  const handleClearForm = () => {
    setFormData(emptyFormValues);
    clearInvoice();
    toast({
      title: "Formular zurückgesetzt",
      description: "Alle Eingaben wurden gelöscht",
    });
  };

  const handleGeneratePDF = async () => {
    const run = ++generation.current;
    setIsGenerating(true);
    try {
      const pdfData = await pdfGenerationService.generatePDF(formData);
      if (run !== generation.current) return;
      setInvoice({
        pdfData,
        fileName: pdfFileName(formData),
        recipient: recipientLabel(Number(formData.gemeindeBfs)),
        total: invoiceTotal(formData),
      });
      // Checked now, not when generation started: the device may have rotated meanwhile.
      setSheetRequested(isPhoneViewport());
    } catch (error) {
      if (run !== generation.current) return;
      console.error("Error generating PDF:", error);
      toast({
        title: "Fehler",
        description: error instanceof UnknownMunicipalityError
          ? "Für die gewählte Gemeinde ist keine Rechnungsadresse hinterlegt. Bitte wählen Sie die Gemeinde erneut."
          : "PDF konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      if (run === generation.current) setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader current="rechnung" />
      <main className={`mx-auto grid max-w-[1280px] gap-10 px-5 ${invoice ? "pb-[calc(200px+env(safe-area-inset-bottom))]" : "pb-[calc(140px+env(safe-area-inset-bottom))]"} pt-6 md:px-10 md:pb-20 md:pt-12 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-14 lg:px-20`}>
        <div className="flex min-w-0 flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-[30px] leading-[34px] tracking-[-0.01em] md:text-[40px] md:leading-[44px] md:tracking-[-0.015em]">Neue Rechnung</h1>
            <p className="hidden text-base text-foreground-secondary md:block">
              Angaben zur Wöchnerin erfassen, Leistungen wählen, fertig. Die Rechnung geht an die Wohngemeinde.
            </p>
          </div>
          <PrivacyNote compact={isPhone} />
          <FormContainer
            values={formData}
            onChange={handleFieldChange}
            onAddressChange={handleAddressChange}
            onClear={handleClearForm}
            onSubmit={handleGeneratePDF}
            isSubmitting={isGenerating}
            isPhone={isPhone}
            fixedInvoiceDate={fixedInvoiceDate || undefined}
            onShowPdf={isPhone && invoice && !sheetRequested ? () => setSheetRequested(true) : undefined}
          />
        </div>

        {/* Not mounted on phones, so no hidden PDF frame loads there. */}
        {!isPhone && <PreviewPanel invoice={invoice} isGenerating={isGenerating} />}
      </main>

      <PdfSheet invoice={invoice} open={sheetRequested && isPhone} onOpenChange={setSheetRequested} />
    </div>
  );
};

export default Index;
