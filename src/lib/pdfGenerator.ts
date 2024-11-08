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
  
  // Add sender information
  doc.setFontSize(12);
  doc.text(`${data.vorname} ${data.nachname}`, 20, 20);
  doc.text(data.address, 20, 30);
  doc.text(`${data.plz} ${data.ort}`, 20, 40);
  
  // Add recipient information (administration)
  doc.text(administration.title, 20, 70);
  if (administration.name) {
    doc.text(administration.name, 20, 80);
  }
  doc.text(administration.address, 20, administration.name ? 90 : 80);
  doc.text(administration.city, 20, administration.name ? 100 : 90);
  
  // Add date
  const currentDate = new Date().toLocaleDateString('de-CH');
  doc.text(currentDate, 150, 40);
  
  // Generate PDF as base64 string
  return doc.output('datauristring');
};