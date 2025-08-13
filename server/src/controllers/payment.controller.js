import pool from '../config/db.js';

export const createPayment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { invoice_id, amount, method = 'manual', note } = req.body;
    if (!invoice_id || !amount) return res.status(400).json({ message: 'invoice_id and amount are required' });

    const [[invoice]] = await conn.query('SELECT * FROM invoices WHERE id=? FOR UPDATE', [invoice_id]);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const tenantId = req.user?.role === 'TENANT' ? req.user.id : (req.body.tenant_id || invoice.tenant_id);

    const [r] = await conn.query(
      'INSERT INTO payments(invoice_id, tenant_id, amount, method, note) VALUES (?,?,?,?,?)',
      [invoice_id, tenantId, amount, method, note || null]
    );

    const [[pay]] = await conn.query('SELECT * FROM payments WHERE id=?', [r.insertId]);

    const [[sumRow]] = await conn.query('SELECT SUM(amount) as paid FROM payments WHERE invoice_id=?', [invoice_id]);
    const paid = Number(sumRow.paid || 0);
    const status = paid >= Number(invoice.total_due) ? 'PAID' : 'PARTIAL';

    await conn.query(
      'UPDATE invoices SET status=?, paid_at = CASE WHEN ? >= total_due THEN NOW() ELSE paid_at END WHERE id=?',
      [status, paid, invoice_id]
    );

    await conn.commit();
    res.json({ message: 'Payment recorded', payment_id: pay.id, payment_code: pay.public_code, invoice_id: invoice.id, invoice_code: invoice.public_code, status, paid });
  } catch (err) {
    try { await conn.query('ROLLBACK'); } catch {}
    next(err);
  } finally {
    conn.release();
  }
};

export const listPaymentsByInvoice = async (req, res, next) => {
  try {
    const { invoice_id } = req.params;
    const [rows] = await pool.query('SELECT id, public_code, invoice_id, tenant_id, amount, method, note, created_at FROM payments WHERE invoice_id=? ORDER BY created_at DESC', [invoice_id]);
    res.json(rows);
  } catch (err) { next(err); }
};

export const listMyPayments = async (req, res, next) => {
  try {
    const tenantId = req.user?.role === 'TENANT' ? req.user.id : (req.query.tenant_id || req.user.id);
    const [rows] = await pool.query('SELECT id, public_code, invoice_id, tenant_id, amount, method, note, created_at FROM payments WHERE tenant_id=? ORDER BY created_at DESC', [tenantId]);
    res.json(rows);
  } catch (err) { next(err); }
};
