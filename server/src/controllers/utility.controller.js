import pool from '../config/db.js';

export const addUtility = async (req, res, next) => {
  try {
    const { property_id, name, type } = req.body; // PREPAID | POSTPAID
    const [r] = await pool.query('INSERT INTO utilities(property_id,name,type) VALUES (?,?,?)', [property_id, name, type]);
    const [[row]] = await pool.query('SELECT id, public_code, property_id, name, type, created_at FROM utilities WHERE id=?', [r.insertId]);
    res.json(row);
  } catch (err) { next(err); }
};

export const assignUtilityToUnit = async (req, res, next) => {
  try {
    const { unit_id, utility_id } = req.body;
    await pool.query('INSERT INTO unit_utilities(unit_id, utility_id) VALUES (?,?)', [unit_id, utility_id]);
    const [[unit]] = await pool.query('SELECT id, public_code, unit_name, property_id FROM units WHERE id=?', [unit_id]);
    const [[util]] = await pool.query('SELECT id, public_code, name FROM utilities WHERE id=?', [utility_id]);
    res.json({ message: 'Utility assigned to unit', unit, utility: util });
  } catch (err) { next(err); }
};
