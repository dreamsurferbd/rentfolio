import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export function generateInvoicePDF(invoice, items, outDir = process.env.UPLOAD_DIR || 'uploads') {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `invoice_${invoice.id}.pdf`;
  const filepath = path.join(outDir, filename);
  doc.pipe(fs.createWriteStream(filepath));

  doc.fontSize(18).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
  doc.text(`Month: ${invoice.invoice_month}`);
  doc.text(`Tenant: ${invoice.tenant_name || invoice.tenant_id}`);
  doc.moveDown();

  doc.fontSize(14).text('Items');
  items.forEach((it) => {
    doc.fontSize(12).text(`${it.label}: ${Number(it.amount).toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Security Adjustment: ${Number(invoice.security_adjustment).toFixed(2)}`);
  doc.fontSize(14).text(`Total Due: ${Number(invoice.total_due).toFixed(2)}`);

  doc.end();
  return { filename, filepath };
}

export function generateAgreementPDF(agreement, outDir = process.env.UPLOAD_DIR || 'uploads') {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `agreement_${agreement.id}.pdf`;
  const filepath = path.join(outDir, filename);
  doc.pipe(fs.createWriteStream(filepath));

  doc.fontSize(18).text('Lease Agreement', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Agreement ID: ${agreement.id}`);
  doc.text(`Property ID: ${agreement.property_id} | Unit ID: ${agreement.unit_id}`);
  doc.text(`Tenant ID: ${agreement.tenant_id}`);
  doc.text(`Lease: ${agreement.lease_start} to ${agreement.lease_end}`);
  doc.moveDown();
  doc.fontSize(12).text(agreement.body);

  doc.end();
  return { filename, filepath };
}
