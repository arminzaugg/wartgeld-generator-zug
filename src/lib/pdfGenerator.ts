import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
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
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = doc.pipe(blobStream());
    const administration = administrationData[data.gemeinde];
    const settings = getSettings();
    const senderInfo = settings.senderInfo.split('\n');

    // Add sender information (top left)
    senderInfo.forEach((line, index) => {
      doc.fontSize(11).text(line, 50, 50 + (index * 15));
    });

    // Add recipient information (administration)
    doc.fontSize(11)
      .text(administration.title, 300, 120)
      .text(administration.name || '', 300, administration.name ? 135 : 120)
      .text(administration.address, 300, administration.name ? 150 : 135)
      .text(administration.city, 300, administration.name ? 165 : 150);

    // Add invoice title
    doc.fontSize(16)
      .text("Rechnung: Hebammenwartgeld", 50, 220);

    // Add legal basis
    doc.fontSize(10)
      .text("gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der", 50, 250)
      .text("Gesundheitsverordnung vom 30. Juni 2009", 50, 265);

    // Add patient information
    doc.fontSize(12)
      .text("Betreuung von", 50, 300)
      .text(`${data.vorname} ${data.nachname}`, 50, 315)
      .text(`${data.address}, ${data.plz} ${data.ort}`, 50, 330)
      .text(new Date().toLocaleDateString('de-CH'), 50, 345);

    // Calculate total and add service table
    let total = 0;
    const yPos1 = 380;
    const yPos2 = 400;

    // Service 1
    doc.fontSize(11)
      .text("Betreuung der Gebärenden zuhause", 50, yPos1)
      .text(data.betreuungGeburt ? "✅" : "⬜", 350, yPos1)
      .text(data.betreuungGeburt ? "⬜" : "✅", 380, yPos1)
      .text(data.betreuungGeburt ? "CHF 1000" : "CHF 0", 410, yPos1);
    if (data.betreuungGeburt) total += 1000;

    // Service 2
    doc.text("Pflege der Wöchnerin zuhause", 50, yPos2)
      .text(data.betreuungWochenbett ? "✅" : "⬜", 350, yPos2)
      .text(data.betreuungWochenbett ? "⬜" : "✅", 380, yPos2)
      .text(data.betreuungWochenbett ? "CHF 400" : "CHF 0", 410, yPos2);
    if (data.betreuungWochenbett) total += 400;

    // Total
    doc.fontSize(11)
      .text("Total Rechnungsbetrag", 50, 440)
      .text(`CHF ${total}`, 410, 440);

    // Footer
    doc.fontSize(9)
      .text("Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen", 50, 500)
      .text("Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben", 50, 530)
      .text("Mit freundlichen Grüssen", 50, 545);

    // Add signature line and place/date
    const currentDate = new Date().toLocaleDateString('de-CH');
    doc.text("Ort / Datum", 50, 580)
      .text(`${settings.ortRechnungssteller}, ${currentDate}`, 50, 595)
      .text("Unterschrift Hebamme", 300, 580);

    // Add signature if available
    if (settings.signature) {
      doc.image(settings.signature, 300, 595, { width: 100 });
    }

    // Payment terms
    doc.fontSize(8)
      .text("Zahlbar innert 30 Tagen", 50, 650)
      .text("Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt", 50, 665);

    // Finalize PDF
    doc.end();

    stream.on('finish', () => {
      const blob = stream.toBlob('application/pdf');
      const url = URL.createObjectURL(blob);
      resolve(url);
    });

    stream.on('error', reject);
  });
};