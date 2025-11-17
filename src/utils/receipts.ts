import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface ReceiptData {
  schoolInfo: {
    name: string;
    address: string;
    contact: string;
    logo?: string;
  };
  payment: {
    receiptNo: string;
    invoiceNo: string;
    date: string;
    amount: number;
    amountWords: string;
    method: string;
    paidBy: string;
    reference?: string;
  };
  student: {
    id: string;
    name: string;
    class: string;
  };
  item: {
    name: string;
    amount: number;
    balance: number;
  };
}

export function generatePOSReceipt(data: ReceiptData): string {
  // Generate narrow receipt HTML for thermal printer
  return `
    <style>
      @page { size: 80mm 297mm; margin: 0; }
      @media print {
        body { margin: 2mm; font-family: 'Courier New', monospace; font-size: 10pt; }
        .header { text-align: center; margin-bottom: 3mm; }
        .logo { max-width: 60mm; height: auto; }
        .divider { border-top: 1px dashed #000; margin: 2mm 0; }
        .amount { font-size: 12pt; font-weight: bold; }
      }
    </style>
    <div class="header">
      <h1>${data.schoolInfo.name}</h1>
      <p>${data.schoolInfo.address}<br/>${data.schoolInfo.contact}</p>
    </div>
    <div class="divider"></div>
    <p>Receipt No: ${data.payment.receiptNo}<br/>
       Date: ${data.payment.date}</p>
    <div class="divider"></div>
    <p>Student: ${data.student.name}<br/>
       ID: ${data.student.id}<br/>
       Class: ${data.student.class}</p>
    <div class="divider"></div>
    <p>Payment for: ${data.item.name}<br/>
       Amount: ${data.payment.amount.toFixed(2)}<br/>
       Method: ${data.payment.method}<br/>
       Balance: ${data.item.balance.toFixed(2)}</p>
    <div class="divider"></div>
    <p>Paid by: ${data.payment.paidBy}</p>
    <div class="divider"></div>
    <p style="text-align:center">Thank you for your payment</p>
  `;
}

export function generateInvoicePDF(data: ReceiptData): jsPDF {
  const doc = new jsPDF();
  
  // Add letterhead
  doc.setFontSize(18);
  doc.text(data.schoolInfo.name, 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(12);
  doc.text(`INVOICE NO: ${data.payment.invoiceNo}`, 20, 40);
  doc.text(`DATE: ${data.payment.date}`, 20, 50);
  
  // Add student details
  doc.text('BILL TO:', 20, 70);
  doc.setFontSize(11);
  doc.text([
    `Name: ${data.student.name}`,
    `Student ID: ${data.student.id}`,
    `Class: ${data.student.class}`
  ], 25, 80);
  
  // Add payment details table
  (doc as { autoTable: (options: Record<string, unknown>) => void }).autoTable({
    startY: 110,
    head: [['Description', 'Amount']],
    body: [
      [data.item.name, data.payment.amount.toFixed(2)],
      ['Balance', data.item.balance.toFixed(2)]
    ],
    styles: { fontSize: 11 },
    headStyles: { fillColor: [41, 128, 185] }
  });
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Authorized Signature: _________________', 20, 220);
  doc.text('School Stamp', 150, 220);
  
  return doc;
}
