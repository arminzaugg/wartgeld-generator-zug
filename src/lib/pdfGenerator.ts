import { Template, generate } from '@pdfme/generator';
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
  const administration = administrationData[data.gemeinde];
  const settings = getSettings();
  const senderInfo = settings.senderInfo.split('\n');

  const template: Template = {
    basePdf: new Uint8Array([]), // Empty base PDF
    schemas: [
      {
        senderInfo: { type: 'text', position: { x: 20, y: 20 }, width: 100, height: 50 },
        recipientInfo: { type: 'text', position: { x: 120, y: 45 }, width: 100, height: 50 },
        title: { type: 'text', position: { x: 20, y: 90 }, width: 200, height: 10 },
        legalBasis1: { type: 'text', position: { x: 20, y: 105 }, width: 400, height: 10 },
        legalBasis2: { type: 'text', position: { x: 20, y: 110 }, width: 400, height: 10 },
        patientInfo: { type: 'text', position: { x: 20, y: 120 }, width: 200, height: 40 },
        service1: { type: 'text', position: { x: 20, y: 150 }, width: 150, height: 10 },
        service1Amount: { type: 'text', position: { x: 180, y: 150 }, width: 50, height: 10 },
        service1Radio: { type: 'radio', position: { x: 140, y: 150 }, width: 30, height: 10 },
        service2: { type: 'text', position: { x: 20, y: 160 }, width: 150, height: 10 },
        service2Amount: { type: 'text', position: { x: 180, y: 160 }, width: 50, height: 10 },
        service2Radio: { type: 'radio', position: { x: 140, y: 160 }, width: 30, height: 10 },
        total: { type: 'text', position: { x: 20, y: 180 }, width: 150, height: 10 },
        totalAmount: { type: 'text', position: { x: 180, y: 180 }, width: 50, height: 10 },
        footer1: { type: 'text', position: { x: 20, y: 200 }, width: 400, height: 10 },
        footer2: { type: 'text', position: { x: 20, y: 220 }, width: 400, height: 10 },
        footer3: { type: 'text', position: { x: 20, y: 230 }, width: 400, height: 10 },
        placeDate: { type: 'text', position: { x: 20, y: 250 }, width: 200, height: 10 },
        signature: { type: 'image', position: { x: 120, y: 245 }, width: 40, height: 20 },
        paymentTerms1: { type: 'text', position: { x: 20, y: 270 }, width: 400, height: 10 },
        paymentTerms2: { type: 'text', position: { x: 20, y: 275 }, width: 400, height: 10 },
      },
    ],
  };

  let total = 0;
  if (data.betreuungGeburt) total += 1000;
  if (data.betreuungWochenbett) total += 400;

  const inputs = [
    {
      senderInfo: senderInfo.join('\n'),
      recipientInfo: `${administration.title}\n${administration.name || ''}\n${administration.address}\n${administration.city}`,
      title: 'Rechnung: Hebammenwartgeld',
      legalBasis1: 'gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der',
      legalBasis2: 'Gesundheitsverordnung vom 30. Juni 2009',
      patientInfo: `Betreuung von\n${data.vorname} ${data.nachname}\n${data.address}, ${data.plz} ${data.ort}\n${new Date().toLocaleDateString('de-CH')}`,
      service1: 'Betreuung der Gebärenden zuhause',
      service1Amount: data.betreuungGeburt ? 'CHF 1000' : 'CHF 0',
      service1Radio: data.betreuungGeburt ? 'On' : 'Off',
      service2: 'Pflege der Wöchnerin zuhause',
      service2Amount: data.betreuungWochenbett ? 'CHF 400' : 'CHF 0',
      service2Radio: data.betreuungWochenbett ? 'On' : 'Off',
      total: 'Total Rechnungsbetrag',
      totalAmount: `CHF ${total}`,
      footer1: 'Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen',
      footer2: 'Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben',
      footer3: 'Mit freundlichen Grüssen',
      placeDate: `${settings.ortRechnungssteller}, ${new Date().toLocaleDateString('de-CH')}`,
      signature: settings.signature || '',
      paymentTerms1: 'Zahlbar innert 30 Tagen',
      paymentTerms2: 'Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt',
    },
  ];

  const pdf = await generate({ template, inputs });
  return `data:application/pdf;base64,${Buffer.from(pdf).toString('base64')}`;
};