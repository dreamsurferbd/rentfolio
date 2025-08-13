import pool from '../config/db.js';

export const createProperty = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const [r] = await pool.query(
      'INSERT INTO properties(admin_id, name, address) VALUES (?,?,?)',
      [req.user.id, name, address]
    );
    const [[row]] = await pool.query(
      'SELECT id, public_code, name, address, admin_id, created_at FROM properties WHERE id=?',
      [r.insertId]
    );
    res.json(row); // includes public_code like 010-000001
  } catch (err) { next(err); }
};

export const listProperties = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, public_code, name, address, admin_id, created_at FROM properties WHERE admin_id=?',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};
