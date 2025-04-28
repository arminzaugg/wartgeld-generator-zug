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
    doc.text(line, 25, 25 + (index * 5));
  });
  
  // Add recipient information (administration)
  doc.text(administration.title, 120, 65);
  // Dynamically calculate y-positions to avoid empty lines
  let recipientY = 70;
  if (administration.name) {
    doc.text(administration.name, 120, recipientY);
    recipientY += 5;
  }
  doc.text(administration.address, 120, recipientY);
  recipientY += 5;
  doc.text(`${administration.city}`, 120, recipientY);
  
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
  const formattedDate = new Date(data.geburtsdatum).toLocaleDateString('de-CH');
  doc.text(`${formattedDate}`, 25, 164);
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
  const currentDate = new Date().toLocaleDateString('de-CH');
  doc.text(`${settings.ortRechnungssteller}, ${currentDate}`, 25, 262);
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