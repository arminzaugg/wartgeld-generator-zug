import type { MunicipalityRecipient } from '@/data/types';
import { getSettings } from './presetStorage';
import { formatSwissDate, todayIso } from './date';
import type { FormValues } from '@/types/form';

export const generatePDF = async (data: FormValues, recipient: MunicipalityRecipient): Promise<string> => {
  // Loaded on demand so jsPDF (and html2canvas) stay out of the initial bundle.
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const settings = getSettings();
  // Keep even long contact lines left of the window at every sheet position.
  doc.setFontSize(11);
  const senderInfo: string[] = doc.splitTextToSize(settings.senderInfo, 70);

  // Keep wrapped sender baselines within 25–90 mm, above the fixed title.
  // Normal senders retain 11 pt / 5 mm pitch; unusually tall blocks shrink.
  const senderPitch = Math.min(5, 65 / Math.max(1, senderInfo.length - 1));
  doc.setFontSize(11 * senderPitch / 5);
  senderInfo.forEach((line, index) => {
    doc.text(line, 25, 25 + (index * senderPitch));
  });
  
  // C5 229 × 162 mm, window x=120/y=52, 100 × 45 mm (flap up).
  // A4 folded at 148.5 mm, upper printed half facing out, fold down; print 100%.
  // Allowing 19 mm horizontal / 13.5 mm vertical play and 5 mm clearance leaves
  // paper bounds x=125–196, y=57–78.5. 10.5 pt fits even Zug's longest line.
  doc.setFontSize(10.5);
  const recipientLines = [recipient.title, recipient.department, recipient.address, recipient.city]
    .filter(Boolean);
  recipientLines.forEach((line, index) => {
    doc.text(line, 125, 61 + (index * 5));
  });
  
  // Add invoice title with larger font and bold
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Rechnung: Hebammenwartgeld", 25, 104);
  
  // Add legal basis in bold with reduced spacing
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der", 25, 119);
  doc.text("Gesundheitsverordnung vom 30. Juni 2009.", 25, 124);
  
  // Reset font to normal and increase size for patient information
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Betreuung von", 25, 134);
  doc.text(`${data.vorname} ${data.nachname}`, 25, 144);
  doc.text(`____________________________________________________________________`, 25, 145);
  // Format address without duplication
  doc.text(`${data.address}`, 25, 154);
  doc.text(`____________________________________________________________________`, 25, 155);
  doc.text(formatSwissDate(data.geburtsdatum), 25, 164);
  doc.text(`____________________________________________________________________`, 25, 165);
  
  // Calculate total
  let total = 0;
  
  // Add service table with text-based checkbox symbols
  doc.setFontSize(12);
  doc.text("Betreuung der Gebärenden zuhause", 25, 184);
  doc.text(data.betreuungGeburt ? "[X]  ja" : "[  ]  ja", 112, 184);
  doc.text(data.betreuungGeburt ? "[  ]  nein" : "[X]  nein", 137, 184);
  doc.text(data.betreuungGeburt ? "Fr.  400.-" : "Fr.________", 163, 184);
  if (data.betreuungGeburt) total += 400;
  
  doc.text("Pflege der Wöchnerin zuhause", 25, 194);
  doc.text(data.betreuungWochenbett ? "[X]  ja" : "[  ]  ja", 112, 194);
  doc.text(data.betreuungWochenbett ? "[  ]  nein" : "[X]  nein", 137, 194);
  doc.text(data.betreuungWochenbett ? "Fr.  400.-" : "Fr.________", 163, 194);
  if (data.betreuungWochenbett) total += 400;
  
  doc.setFont("helvetica", "bold");
  doc.text("Total Rechnungsbetrag", 25, 204);
  doc.setFont("helvetica", "normal");
  doc.text(`Fr.  ${total}.-`, 163, 204);
  doc.text(`========`, 163, 207);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen", 25, 213);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben", 25, 227);
  doc.setFont("helvetica", "normal")
  doc.text("Mit freundlichen Grüssen", 25, 237);
  
  doc.text("Ort / Datum", 25, 247);
  doc.text("Unterschrift Hebamme", 127, 247);
  
  
  // Add signature line and place/date
  const invoiceDate = formatSwissDate(settings.rechnungsDatum || todayIso());
  doc.text(`${settings.ortRechnungssteller}, ${invoiceDate}`, 25, 262);
  doc.text("____________________________________________________________________", 25, 263);
  
  // Add signature if available
  if (settings.signature) {
    doc.addImage(settings.signature, 'PNG', 130, 243, 40, 20);
  }
  
  // Add payment terms
  doc.setFontSize(12);
  doc.text("Zahlbar innert 30 Tagen", 25, 272);
  doc.text("Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt", 25, 277);
  
  // Generate PDF as base64 string
  return doc.output('datauristring');
};