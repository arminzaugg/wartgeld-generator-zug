import jsPDF from 'jspdf';
import { getAdministrationData } from './administrationData';
import { getSettings } from './presetStorage';

interface FormData {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  gemeinde: string;
  betreuungGeburt: boolean;
  betreuungWochenbett: boolean;
}

export const generatePDF = async (data: FormData): Promise<string> => {
  const doc = new jsPDF();
  const administration = await getAdministrationData(data.plz);
  const settings = getSettings();
  const senderInfo = settings.senderInfo.split('\n');
  
  // Add sender information (top left)
  doc.setFontSize(11);
  senderInfo.forEach((line, index) => {
    doc.text(line, 20, 20 + (index * 5));
  });
  
  // Add recipient information (administration)
  doc.text(administration.title, 120, 45);
  if (administration.name) {
    doc.text(administration.name, 120, 50);
  }
  doc.text(administration.address, 120, administration.name ? 55 : 50);
  doc.text(`${administration.city}`, 120, administration.name ? 60 : 55);
  
  // Add invoice title with larger font and bold
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Rechnung: Hebammenwartgeld", 20, 90);
  
  // Add legal basis in bold with reduced spacing
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der", 20, 100);
  doc.text("Gesundheitsverordnung vom 30. Juni 2009.", 20, 105);
  
  // Reset font to normal and increase size for patient information
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Betreuung von", 20, 120);
  doc.text(`${data.vorname} ${data.nachname}`, 20, 130);
  doc.text(`____________________________________________________________________`, 20, 131);
  // Format address without duplication
  doc.text(`${data.address}`, 20, 140);
  doc.text(`____________________________________________________________________`, 20, 141);
  doc.text(new Date().toLocaleDateString('de-CH'), 20, 150);
  doc.text(`____________________________________________________________________`, 20, 151);
  
  // Calculate total
  let total = 0;
  
  // Add service table with text-based checkbox symbols
  doc.setFontSize(12);
  doc.text("Betreuung der Gebärenden zuhause", 20, 165);
  doc.text(data.betreuungGeburt ? "[X] Ja" : "[  ] Ja", 120, 165);
  doc.text(data.betreuungGeburt ? "[  ] Nein" : "[X] Nein", 140, 165);
  doc.text(data.betreuungGeburt ? "Fr.  400" : "Fr.  0", 160, 165);
  if (data.betreuungGeburt) total += 400;
  
  doc.text("Pflege der Wöchnerin zuhause", 20, 175);
  doc.text(data.betreuungWochenbett ? "[X] Ja" : "[  ] Ja", 120, 175);
  doc.text(data.betreuungWochenbett ? "[  ] Nein" : "[X] Nein", 140, 175);
  doc.text(data.betreuungWochenbett ? "Fr.  400" : "Fr.  0", 160, 175);
  if (data.betreuungWochenbett) total += 400;
  
  doc.setFont("helvetica", "bold");
  doc.text("Total Rechnungsbetrag", 20, 185);
  doc.text(`Fr.  ${total}`, 160, 185);
  doc.text(`========`, 160, 188);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen", 20, 195);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben", 20, 220);
  doc.setFont("helvetica", "normal")
  doc.text("Freundliche Grüsse", 20, 230);
  
  doc.text("Ort / Datum", 20, 240);
  doc.text("Unterschrift Hebamme", 120, 240);
  
  
  // Add signature line and place/date
  const currentDate = new Date().toLocaleDateString('de-CH');
  doc.text(`${settings.ortRechnungssteller}, ${currentDate}`, 20, 265);
  doc.text("____________________________________________________________________", 20, 266);
  
  // Add signature if available
  if (settings.signature) {
    doc.addImage(settings.signature, 'PNG', 130, 245, 40, 20);
  }
  
  // Add payment terms
  doc.setFontSize(12);
  doc.text("Zahlbar innert 30 Tagen", 20, 280);
  doc.text("Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt", 20, 285);
  
  // Generate PDF as base64 string
  return doc.output('datauristring');
};