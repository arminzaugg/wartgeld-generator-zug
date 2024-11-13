import jsPDF from 'jspdf';
import { administrationData } from './administrationData';
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
  const administration = administrationData[data.gemeinde];
  const settings = getSettings();
  const senderInfo = settings.senderInfo.split('\n');
  
  // Set default font
  doc.setFont('helvetica');
  
  // Add sender information (top left)
  doc.setFontSize(11);
  senderInfo.forEach((line, index) => {
    doc.text(line, 20, 20 + (index * 5));
  });
  
  // Add recipient information (administration)
  doc.text(administration.title, 120, 45);
  if (administration.name) {
    doc.text(administration.name, 120, 52);
  }
  doc.text(administration.address, 120, administration.name ? 59 : 52);
  doc.text(administration.city, 120, administration.name ? 66 : 59);
  
  // Add invoice title with larger font and bold
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("Rechnung: Hebammenwartgeld", 20, 90);
  
  // Add legal basis in bold with reduced spacing
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der", 20, 105);
  doc.text("Gesundheitsverordnung vom 30. Juni 2009", 20, 110);
  
  // Reset font to normal and increase size for patient information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text("Betreuung von", 20, 120);
  doc.text(`${data.vorname} ${data.nachname}`, 20, 125);
  doc.text(`${data.address}, ${data.plz} ${data.ort}`, 20, 130);
  doc.text(new Date().toLocaleDateString('de-CH'), 20, 135);
  
  // Calculate total and add service table
  let total = 0;
  
  // Add checkboxes using form fields
  const checkBox1 = new Object();
  Object.assign(checkBox1, {
    fieldName: "BetreuungGeburt",
    Rect: [140, 147, 3, 3],
    value: data.betreuungGeburt ? "Yes" : "Off",
    readOnly: true,
    AS: "/Yes"
  });
  doc.addField(checkBox1);

  const checkBox2 = new Object();
  Object.assign(checkBox2, {
    fieldName: "BetreuungGeburtNo",
    Rect: [160, 147, 3, 3],
    value: !data.betreuungGeburt ? "Yes" : "Off",
    readOnly: true,
    AS: "/Yes"
  });
  doc.addField(checkBox2);

  const checkBox3 = new Object();
  Object.assign(checkBox3, {
    fieldName: "BetreuungWochenbett",
    Rect: [140, 157, 3, 3],
    value: data.betreuungWochenbett ? "Yes" : "Off",
    readOnly: true,
    AS: "/Yes"
  });
  doc.addField(checkBox3);

  const checkBox4 = new Object();
  Object.assign(checkBox4, {
    fieldName: "BetreuungWochenbettNo",
    Rect: [160, 157, 3, 3],
    value: !data.betreuungWochenbett ? "Yes" : "Off",
    readOnly: true,
    AS: "/Yes"
  });
  doc.addField(checkBox4);

  doc.setFontSize(11);
  doc.text("Betreuung der Gebärenden zuhause", 20, 150);
  doc.text(data.betreuungGeburt ? "CHF 1000" : "CHF 0", 180, 150);
  if (data.betreuungGeburt) total += 1000;
  
  doc.text("Pflege der Wöchnerin zuhause", 20, 160);
  doc.text(data.betreuungWochenbett ? "CHF 400" : "CHF 0", 180, 160);
  if (data.betreuungWochenbett) total += 400;
  
  doc.setFont('helvetica', 'bold');
  doc.text("Total Rechnungsbetrag", 20, 180);
  doc.text(`CHF ${total}`, 180, 180);
  
  // Add footer text
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen", 20, 200);
  
  doc.text("Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben", 20, 220);
  doc.text("Mit freundlichen Grüssen", 20, 230);
  
  // Add signature line and place/date
  const currentDate = new Date().toLocaleDateString('de-CH');
  doc.text("Ort / Datum", 20, 240);
  doc.text(`${settings.ortRechnungssteller}, ${currentDate}`, 20, 250);
  doc.text("Unterschrift Hebamme", 120, 240);

  // Add signature if available
  if (settings.signature) {
    doc.addImage(settings.signature, 'PNG', 120, 245, 40, 20);
  }
  
  // Add payment terms
  doc.setFontSize(8);
  doc.text("Zahlbar innert 30 Tagen", 20, 270);
  doc.text("Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt", 20, 275);
  
  return doc.output('datauristring');
};