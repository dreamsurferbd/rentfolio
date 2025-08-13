import pool from '../config/db.js';
import { sendEmail } from '../services/email.js';

export const createNotice = async (req, res, next) => {
  try {
    const { property_id, title, body, target = 'ALL', tenant_ids = [] } = req.body;
    const [r] = await pool.query('INSERT INTO notices(property_id, title, body, target) VALUES (?,?,?,?)', [property_id, title, body, target]);

    if (target === 'SELECTED' && Array.isArray(tenant_ids)) {
      for (const tid of tenant_ids) {
        await pool.query('INSERT INTO notice_recipients(notice_id, tenant_id) VALUES (?,?)', [r.insertId, tid]);
      }
    }

    const [[n]] = await pool.query('SELECT id, public_code, property_id, title, body, target, created_at FROM notices WHERE id=?', [r.insertId]);

    try {
      const [tenants] = await pool.query(
        target === 'ALL'
          ? 'SELECT email FROM users WHERE role="TENANT"'
          : 'SELECT email FROM users WHERE id IN (?)',
        target === 'ALL' ? [] : [tenant_ids]
      );
      const emails = tenants.map(t => t.email);
      if (emails.length) {
        await sendEmail({ to: emails, subject: `Notice: ${title}`, html: `<p>${body}</p>` });
      }
    } catch {}

    res.json({ ...n, message: 'Notice posted and emailed' });
  } catch (err) { next(err); }
};

export const listNotices = async (req, res, next) => {
  try {
    const { property_id } = req.query;
    const [rows] = await pool.query('SELECT id, public_code, property_id, title, body, target, created_at FROM notices WHERE property_id=? ORDER BY created_at DESC', [property_id]);
    res.json(rows);
  } catch (err) { next(err); }
};
