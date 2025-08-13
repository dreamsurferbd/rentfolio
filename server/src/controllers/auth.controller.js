import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';
import { signToken } from '../middlewares/auth.js';
import { sendEmail } from '../services/email.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, role = 'TENANT' } = req.body;
    const [exist] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (exist.length) return res.status(400).json({ message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      'INSERT INTO users(name,email,phone,password_hash,role) VALUES (?,?,?,?,?)',
      [name, email, phone, hash, role]
    );
    const user = { id: r.insertId, name, email, role };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email=? AND is_active=1', [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    const user = rows[0];
    if (!user) return res.json({ message: 'If the email exists, a reset link will be sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
    await pool.query('INSERT INTO password_resets(user_id, token, expires_at) VALUES(?,?,?)', [user.id, token, expires]);

    const link = `${process.env.BASE_URL}/api/auth/reset/${token}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click to reset: <a href="${link}">${link}</a></p>`
    });
    res.json({ message: 'Reset link sent if email exists.' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const [rows] = await pool.query('SELECT * FROM password_resets WHERE token=? AND expires_at > NOW()', [token]);
    const rec = rows[0];
    if (!rec) return res.status(400).json({ message: 'Invalid or expired token' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [hash, rec.user_id]);
    await pool.query('DELETE FROM password_resets WHERE id=?', [rec.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
};

