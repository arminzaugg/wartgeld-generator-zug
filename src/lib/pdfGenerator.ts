import jsPDF from 'jspdf';
import { administrationData } from './administrationData';

interface FormData {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  gemeinde: string;
}

export const generatePDF = (data: FormData): string => {
  const doc = new jsPDF();
  const administration = administrationData[data.gemeinde];
  
  // Add sender information (top left) - more compact spacing
  doc.setFontSize(11);
  doc.text("Aline Lusser", 20, 20);
  doc.text("Im Rank 109", 20, 25);
  doc.text("6300 Zug", 20, 30);
  
  // Add contact information
  doc.setTextColor(0, 0, 255); // Blue color for email
  doc.text("info@hebalu.ch", 20, 35);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text("079 326 61 67", 20, 40);
  
  // Add IBAN information
  doc.text("IBAN CH97 0078 7785 4071 5467 3", 20, 45);
  doc.text("QR IBAN CH22 3078 7785 4071 5467 3", 20, 50);
  
  // Add recipient information (administration) - moved lower for envelope window
  doc.text(administration.title, 120, 45);
  if (administration.name) {
    doc.text(administration.name, 120, 52);
  }
  doc.text(administration.address, 120, administration.name ? 59 : 52);
  doc.text(administration.city, 120, administration.name ? 66 : 59);
  
  // Add invoice title with larger font and bold
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Rechnung: Hebammenwartgeld", 20, 90);
  
  // Add legal basis in bold with reduced spacing
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der", 20, 105);
  doc.text("Gesundheitsverordnung vom 30. Juni 2009", 20, 110); // Changed from 112 to 110 to reduce spacing
  
  // Reset font to normal for the rest of the document
  doc.setFont("helvetica", "normal");
  doc.text("Betreuung von", 20, 130);
  doc.text(`${data.vorname} ${data.nachname}`, 20, 140);
  doc.text(`${data.address}, ${data.plz} ${data.ort}`, 20, 147);
  doc.text(new Date().toLocaleDateString('de-CH'), 20, 154);
  
  // Add service table
  doc.text("Betreuung der Gebärenden zuhause", 20, 180);
  doc.text("□ ja", 140, 180);
  doc.text("□ nein", 160, 180);
  doc.text("CHF", 180, 180);
  
  doc.text("Pflege der Wöchnerin zuhause", 20, 190);
  doc.text("□ ja", 140, 190);
  doc.text("□ nein", 160, 190);
  doc.text("CHF", 180, 190);
  
  // Add total
  doc.text("Total Rechnungsbetrag", 20, 210);
  doc.text("CHF =========", 180, 210);
  
  // Add footer text
  doc.setFontSize(9);
  doc.text("Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen", 20, 230);
  
  doc.text("Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben", 20, 250);
  doc.text("Mit freundlichen Grüssen", 20, 260);
  
  // Add signature line
  doc.text("Ort / Datum", 20, 280);
  doc.text("Unterschrift Hebamme", 120, 280);
  doc.line(20, 290, 80, 290); // Line for place/date
  doc.line(120, 290, 180, 290); // Line for signature
  
  // Add payment terms
  doc.setFontSize(8);
  doc.text("Zahlbar innert 30 Tagen", 20, 300);
  doc.text("Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt", 20, 305);
  
  // Generate PDF as base64 string
  return doc.output('datauristring');
};