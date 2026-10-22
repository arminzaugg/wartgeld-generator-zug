import type { FormValues } from '@/types/form';

/** Fee per reimbursable service; the PDF prints the same amount ("Fr.  400.-"). */
export const SERVICE_FEE = 400;

export const invoiceTotal = (values: Pick<FormValues, 'betreuungGeburt' | 'betreuungWochenbett'>): number =>
  (values.betreuungGeburt ? SERVICE_FEE : 0) + (values.betreuungWochenbett ? SERVICE_FEE : 0);

export const formatChf = (amount: number): string => `CHF ${amount.toFixed(2)}`;
