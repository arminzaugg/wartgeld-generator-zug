import jsPDF from 'jspdf';

interface FormData {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  additionalNotes?: string;
}

export const generatePDF = (data: FormData): string => {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.text(data.companyName, 20, 20);
  
  // Add address block
  doc.setFontSize(12);
  doc.text(data.address, 20, 40);
  doc.text(`${data.city}, ${data.state} ${data.zipCode}`, 20, 50);
  
  // Add additional notes if present
  if (data.additionalNotes) {
    doc.text('Additional Notes:', 20, 70);
    doc.setFontSize(10);
    doc.text(data.additionalNotes, 20, 80);
  }
  
  // Generate PDF as base64 string
  return doc.output('datauristring');
};