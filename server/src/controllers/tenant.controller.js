import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../services/email.js';
import { sendSMS } from '../services/sms.js';

export const publicTenantRequest = async (req, res, next) => {
  try {
    const { property_id, unit_id, name, email, phone } = req.body;
    const [r] = await pool.query(
      'INSERT INTO tenant_requests(property_id, unit_id, name, email, phone) VALUES (?,?,?,?,?)',
      [property_id, unit_id || null, name, email, phone]
    );
    const [[row]] = await pool.query(
      'SELECT id, property_id, unit_id, status, created_at FROM tenant_requests WHERE id=?',
      [r.insertId]
    );
    res.json({ message: 'Request submitted', request: row });
  } catch (err) { next(err); }
};

export const listTenantRequests = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT tr.*, p.name as property_name, u.unit_name, u.public_code as unit_code ' +
      'FROM tenant_requests tr ' +
      'JOIN properties p ON p.id=tr.property_id ' +
      'LEFT JOIN units u ON u.id=tr.unit_id ' +
      'WHERE p.admin_id=? AND tr.status="PENDING"',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

export const approveTenantRequest = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params; // tenant_request id
    const { unit_id } = req.body; // ensure destination unit

    const [rows] = await conn.query('SELECT * FROM tenant_requests WHERE id=? FOR UPDATE', [id]);
    const tr = rows[0];
    if (!tr || tr.status !== 'PENDING') throw new Error('Invalid request');

    // Create tenant user with temp password
    const tempPass = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(tempPass, 10);
    const [u] = await conn.query(
      'INSERT INTO users(name,email,phone,password_hash,role) VALUES (?,?,?,?, "TENANT")',
      [tr.name, tr.email, tr.phone, hash]
    );

    // Assign unit
    const unitId = unit_id || tr.unit_id;
    if (!unitId) throw new Error('Unit required');
    await conn.query('UPDATE units SET current_tenant_id=?, status="OCCUPIED" WHERE id=?', [u.insertId, unitId]);

    // Mark request approved
    await conn.query('UPDATE tenant_requests SET status="APPROVED" WHERE id=?', [id]);

    // Fetch codes to return
    const [[tenantRow]] = await conn.query('SELECT id, public_code, email, name, role FROM users WHERE id=?', [u.insertId]);
    const [[unitRow]] = await conn.query('SELECT id, public_code, unit_name, property_id FROM units WHERE id=?', [unitId]);

    await conn.commit();

    // Notify via Email + SMS (optional in dev)
    const loginInfo = `Your account is ready. Email: ${tr.email} | Temp Password: ${tempPass}`;
    try {
      await sendEmail({ to: tr.email, subject: 'Tenant Access Approved', html: `<p>${loginInfo}</p>` });
      if (tr.phone) await sendSMS(tr.phone, loginInfo);
    } catch {}

    res.json({
      message: 'Tenant approved and notified',
      tenant: tenantRow,
      unit: unitRow
    });
  } catch (err) {
    try { await conn.query('ROLLBACK'); } catch {}
    next(err);
  } finally {
    conn.release();
  }
};

export const markLeaseEnded = async (req, res, next) => {
  try {
    const { unit_id } = req.body;
    await pool.query('UPDATE units SET current_tenant_id=NULL, status="FOR_RENT" WHERE id=?', [unit_id]);
    const [[row]] = await pool.query('SELECT id, public_code, property_id, unit_name, status FROM units WHERE id=?', [unit_id]);
    res.json({ message: 'Lease ended and unit set to FOR_RENT', unit: row });
  } catch (err) { next(err); }
};
