import pool from '../config/db.js';
import { sendEmail } from '../services/email.js';
import { generateAgreementPDF } from '../services/pdf.js';

export const sendAgreement = async (req, res, next) => {
  try {
    const { property_id, unit_id, tenant_id, body, lease_start, lease_end, renewal_option } = req.body;
    const [r] = await pool.query(
      'INSERT INTO agreements(property_id,unit_id,admin_id,tenant_id,body,lease_start,lease_end,renewal_option,status) VALUES (?,?,?,?,?,?,?,?, "SENT")',
      [property_id, unit_id, req.user.id, tenant_id, body, lease_start, lease_end, renewal_option ? 1 : 0]
    );

    const [[ag]] = await pool.query('SELECT id, public_code, property_id, unit_id, tenant_id, status FROM agreements WHERE id=?', [r.insertId]);

    try {
      await sendEmail({
        to: req.body.tenant_email,
        subject: 'Lease Agreement Pending Approval',
        html: `<p>Please log in to review and approve Agreement #${ag.public_code || ag.id}.</p>`
      });
    } catch {}

    res.json({ id: ag.id, public_code: ag.public_code, message: 'Agreement sent' });
  } catch (err) { next(err); }
};

export const getAgreement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[ag]] = await pool.query('SELECT * FROM agreements WHERE id=?', [id]);
    if (!ag) return res.status(404).json({ message: 'Not found' });
    res.json(ag);
  } catch (err) { next(err); }
};

export const approveAgreement = async (req, res, next) => {
  try {
    const { id } = req.params; // agreement id
    await pool.query(
      'UPDATE agreements SET status="APPROVED", approved_at=NOW(), is_immutable=1 WHERE id=? AND tenant_id=?',
      [id, req.user.id]
    );

    const [[ag]] = await pool.query('SELECT * FROM agreements WHERE id=?', [id]);
    const { filepath } = generateAgreementPDF(ag);

    res.json({ message: 'Agreement approved', id: ag.id, public_code: ag.public_code, pdf: filepath });
  } catch (err) { next(err); }
};
