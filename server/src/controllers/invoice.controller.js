import pool from '../config/db.js';
import { generateInvoicePDF } from '../services/pdf.js';
import { sendEmail } from '../services/email.js';

export const createMonthlyInvoice = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { property_id, unit_id, tenant_id, invoice_month, items = [], previous_dues = 0, security_adjustment = 0, attachment_path } = req.body;

    const subtotal = items.reduce((s, it) => s + Number(it.amount || 0), 0) + Number(previous_dues || 0);
    const total_due = subtotal - Number(security_adjustment || 0);

    const [r] = await conn.query(
      'INSERT INTO invoices(property_id, unit_id, tenant_id, invoice_month, subtotal, security_adjustment, total_due, status, attachment_path) VALUES (?,?,?,?,?,?,?,?,?)',
      [property_id, unit_id, tenant_id, invoice_month, subtotal, security_adjustment, total_due, 'SENT', attachment_path || null]
    );

    for (const it of items) {
      await conn.query('INSERT INTO invoice_items(invoice_id, label, amount) VALUES (?,?,?)', [r.insertId, it.label, it.amount]);
    }
    if (previous_dues && Number(previous_dues) > 0) {
      await conn.query('INSERT INTO invoice_items(invoice_id, label, amount) VALUES (?,?,?)', [r.insertId, 'Previous Dues', previous_dues]);
    }

    await conn.commit();

    const [[invoice]] = await pool.query('SELECT * FROM invoices WHERE id=?', [r.insertId]);
    const [itemsRows] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id=?', [r.insertId]);
    const { filepath } = generateInvoicePDF(invoice, itemsRows);

    try {
      await sendEmail({
        to: req.body.tenant_email,
        subject: `Invoice for ${invoice_month}`,
        html: `<p>Your invoice (${invoice.public_code || invoice.id}) total due is <b>${invoice.total_due.toFixed(2)}</b>. Attached is the PDF.</p>`,
        attachments: [
          {
            content: Buffer.from(require('fs').readFileSync(filepath)).toString('base64'),
            filename: `invoice_${r.insertId}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }
        ]
      });
    } catch {}

    res.json({ id: invoice.id, public_code: invoice.public_code, total_due: invoice.total_due });
  } catch (err) {
    try { await pool.query('ROLLBACK'); } catch {}
    next(err);
  } finally {
    conn.release();
  }
};

export const markInvoicePaid = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params; // invoice id
    const { amount, method = 'manual', note } = req.body;

    const [[invoice]] = await conn.query('SELECT * FROM invoices WHERE id=? FOR UPDATE', [id]);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await conn.query('INSERT INTO payments(invoice_id, tenant_id, amount, method, note) VALUES (?,?,?,?,?)', [id, invoice.tenant_id, amount, method, note || null]);

    const [[sumRow]] = await conn.query('SELECT SUM(amount) as paid FROM payments WHERE invoice_id=?', [id]);
    const paid = Number(sumRow.paid || 0);
    const status = paid >= Number(invoice.total_due) ? 'PAID' : 'PARTIAL';
    await conn.query('UPDATE invoices SET status=?, paid_at = CASE WHEN ? >= total_due THEN NOW() ELSE paid_at END WHERE id=?', [status, paid, id]);

    await conn.commit();
    res.json({ message: 'Payment recorded', status, invoice_id: invoice.id, invoice_code: invoice.public_code, paid });
  } catch (err) {
    try { await pool.query('ROLLBACK'); } catch {}
    next(err);
  } finally {
    conn.release();
  }
};

// Handy: fetch one invoice (to verify code/status in Postman)
export const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[inv]] = await pool.query('SELECT * FROM invoices WHERE id=?', [id]);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (err) { next(err); }
};
