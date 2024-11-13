import { jsPDF } from 'jspdf';

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
  
  // Set font
  doc.setFont("helvetica");
  
  // Add sender info
  doc.setFontSize(10);
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const senderInfo = settings.senderInfo || '';
  const senderLines = senderInfo.split('\n');
  senderLines.forEach((line: string, index: number) => {
    doc.text(line, 20, 20 + (index * 5));
  });

  // Add recipient info (from administration data)
  const administrationData = {
    Zug: { title: 'Gemeinde Zug', name: '', address: 'Gubelstrasse 22', city: '6300 Zug' },
    Cham: { title: 'Gemeinde Cham', name: '', address: 'Mandelhof', city: '6330 Cham' },
    Huenenberg: { title: 'Gemeinde Hünenberg', name: '', address: 'Chamerstrasse 11', city: '6331 Hünenberg' },
    Risch: { title: 'Gemeinde Risch', name: '', address: 'Zentrum 1', city: '6343 Rotkreuz' },
    Steinhausen: { title: 'Gemeinde Steinhausen', name: '', address: 'Bahnhofstrasse 3', city: '6312 Steinhausen' },
    Baar: { title: 'Gemeinde Baar', name: '', address: 'Rathausstrasse 6', city: '6340 Baar' },
    Neuheim: { title: 'Gemeinde Neuheim', name: '', address: 'Dorfplatz 5', city: '6345 Neuheim' },
    Menzingen: { title: 'Gemeinde Menzingen', name: '', address: 'Rathaus', city: '6313 Menzingen' },
    Unteraegeri: { title: 'Gemeinde Unterägeri', name: '', address: 'Seestrasse 2', city: '6314 Unterägeri' },
    Oberaegeri: { title: 'Gemeinde Oberägeri', name: '', address: 'Hauptstrasse 78', city: '6315 Oberägeri' },
    Walchwil: { title: 'Gemeinde Walchwil', name: '', address: 'Bahnhofstrasse 5', city: '6318 Walchwil' }
  };
  
  const administration = administrationData[data.gemeinde as keyof typeof administrationData];
  doc.text([
    administration.title,
    administration.name,
    administration.address,
    administration.city
  ], 120, 45);

  // Add title
  doc.setFontSize(14);
  doc.text('Rechnung: Hebammenwartgeld', 20, 90);

  // Add legal basis
  doc.setFontSize(10);
  doc.text('gestützt auf § 53 des Gesundheitsgesetzes vom 30. Oktober 2008, und § 53 der', 20, 105);
  doc.text('Gesundheitsverordnung vom 30. Juni 2009', 20, 110);

  // Add patient info
  doc.text([
    'Betreuung von',
    `${data.vorname} ${data.nachname}`,
    `${data.address}, ${data.plz} ${data.ort}`,
    new Date().toLocaleDateString('de-CH')
  ], 20, 120);

  // Add services
  let total = 0;
  const services = [];

  if (data.betreuungGeburt) {
    services.push(['[X]', 'Betreuung der Gebärenden zuhause', 'CHF 1000']);
    total += 1000;
  } else {
    services.push(['[ ]', 'Betreuung der Gebärenden zuhause', 'CHF 0']);
  }

  if (data.betreuungWochenbett) {
    services.push(['[X]', 'Pflege der Wöchnerin zuhause', 'CHF 400']);
    total += 400;
  } else {
    services.push(['[ ]', 'Pflege der Wöchnerin zuhause', 'CHF 0']);
  }

  services.forEach((service, index) => {
    doc.text(service[0], 20, 150 + (index * 10));
    doc.text(service[1], 30, 150 + (index * 10));
    doc.text(service[2], 180, 150 + (index * 10));
  });

  // Add total
  doc.text(`Total Rechnungsbetrag: CHF ${total}`, 20, 180);

  // Add footer
  doc.text([
    'Zutreffendes ankreuzen, Formular vollständig und in Blockschrift ausfüllen',
    'Die Unterzeichnende bescheinigt die Richtigkeit obiger Angaben',
    'Mit freundlichen Grüssen'
  ], 20, 200);

  // Add place and date
  const ortRechnungssteller = settings.ortRechnungssteller || '';
  doc.text(`${ortRechnungssteller}, ${new Date().toLocaleDateString('de-CH')}`, 20, 250);

  // Add signature if available
  if (settings.signature) {
    const img = new Image();
    img.src = settings.signature;
    doc.addImage(img, 'PNG', 120, 245, 40, 20);
  }

  // Add payment terms
  doc.text([
    'Zahlbar innert 30 Tagen',
    'Die Rechnungsstellung erfolgt bis spätestens 2 Monate nach der Geburt'
  ], 20, 270);

  return doc.output('datauristring');
};