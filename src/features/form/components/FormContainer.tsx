import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { DateAndMunicipalityFields } from "./DateAndMunicipalityFields";
import { ServiceSelectionFields } from "./ServiceSelectionFields";
import { FormActions } from "./FormActions";
import { ErrorSummary } from "./ErrorSummary";
import { formValidationService } from "@/services/form/formValidationService";
import { useToast } from "@/components/ui/use-toast";
import { invoiceTotal } from "@/lib/invoiceTotal";
import type { FormValues } from "@/types/form";

interface FormContainerProps {
  values: FormValues;
  onChange: (field: string, value: string | boolean) => void;
  onAddressChange: (street: string, zipCode?: string, city?: string) => void;
  onClear: () => void;
  /** Generates the invoice; reports its own errors. Called only with valid values. */
  onSubmit: () => Promise<void> | void;
  /** The invoice is being generated (owned by the page, which also shows it in the preview). */
  isSubmitting?: boolean;
  /** ISO date when the invoice date is fixed in the settings. */
  fixedInvoiceDate?: string;
  /** Phone layout (bottom action bar); decided by the page so one value drives it all. */
  isPhone?: boolean;
  /** Phone only: reopens the finished invoice. */
  onShowPdf?: () => void;
}

const cardClassName = "flex flex-col gap-5 p-5 md:gap-6 md:p-8";
const sectionTitle = "text-xl leading-[26px] md:text-[22px] md:leading-7";

export const FormContainer = ({
  values,
  onChange,
  onAddressChange,
  onClear,
  onSubmit,
  isSubmitting = false,
  fixedInvoiceDate,
  isPhone = false,
  onShowPdf,
}: FormContainerProps) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  // The summary appears only after a submit attempt, never while typing.
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusSummary, setFocusSummary] = useState(false);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const { toast } = useToast();

  // A new address brings a new municipality proposal; old address errors no longer apply.
  // After a submit attempt the summary stays truthful: the new address is checked again.
  useEffect(() => {
    setErrors(({ plz, gemeindeBfs, ...rest }) => {
      if (!submitAttempted) return rest;
      const recheck = formValidationService.validateForm(values);
      return {
        ...rest,
        ...(recheck.plz && { plz: recheck.plz }),
        ...(recheck.gemeindeBfs && { gemeindeBfs: recheck.gemeindeBfs }),
      };
    });
    // Runs only when the address changes; submitAttempted and the other values are read as they are then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.plz, values.ort]);

  // Typing or picking an address answers "Adresse ist erforderlich".
  useEffect(() => {
    if (values.address) setErrors(({ address, ...rest }) => rest);
  }, [values.address]);

  useEffect(() => {
    if (!focusSummary) return;
    summaryRef.current?.focus();
    setFocusSummary(false);
  }, [focusSummary]);

  const handleInputChange = (field: string, value: string | boolean) => {
    const error = formValidationService.validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    onChange(field, value);
  };

  const handleClear = () => {
    setErrors({});
    setSubmitAttempted(false);
    onClear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = formValidationService.validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitAttempted(true);
      setFocusSummary(true);
      toast({
        title: "Ungültige Eingaben",
        description: "Bitte korrigieren Sie die markierten Felder.",
        variant: "destructive",
      });
      return;
    }

    setErrors({});
    setSubmitAttempted(false);
    await onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
      {submitAttempted && <ErrorSummary ref={summaryRef} errors={errors} />}

      <Card className={cardClassName} data-testid="invoice-form-card">
        <h2 className={sectionTitle}>Angaben</h2>
        <PersonalInfoFields values={values} errors={errors} onChange={handleInputChange} />
        <AddressFields values={values} errors={errors} onChange={onAddressChange} />
        <DateAndMunicipalityFields
          values={{
            geburtsdatum: values.geburtsdatum,
            plz: values.plz,
            ort: values.ort,
            gemeindeBfs: values.gemeindeBfs,
          }}
          errors={errors}
          onChange={handleInputChange}
        />
      </Card>

      <Card className={cardClassName}>
        <h2 className={sectionTitle}>Dienstleistungen</h2>
        <ServiceSelectionFields values={values} onChange={handleInputChange} showTotal={!isPhone} />
      </Card>

      <FormActions
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isPhone={isPhone}
        total={invoiceTotal(values)}
        fixedInvoiceDate={fixedInvoiceDate}
        onShowPdf={onShowPdf}
      />
    </form>
  );
};
