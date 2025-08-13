// server/src/controllers/unit.controller.js
import pool from '../config/db.js';

// Allowed statuses for a unit
const ALLOWED_STATUS = new Set(['OCCUPIED', 'FOR_RENT', 'VACANT']);

// tiny helper to normalize names
const clean = (s) => String(s ?? '').trim();

/**
 * Resolve a property by either:
 *  - numeric property_id
 *  - public_code like "010-000004"
 * Returns numeric id or null.
 */
async function resolvePropertyId({ property_id, property_code }) {
  // numeric id provided normally
  if (property_id && /^\d+$/.test(String(property_id).trim())) {
    return Number(property_id);
  }
  // someone passed the prefixed code in property_id by mistake
  if (property_id && String(property_id).includes('-')) {
    const code = clean(property_id);
    const [[row]] = await pool.query(
      'SELECT id FROM properties WHERE public_code = ? LIMIT 1',
      [code]
    );
    return row ? row.id : null;
  }
  // explicit property_code flow
  if (property_code) {
    const code = clean(property_code);
    const [[row]] = await pool.query(
      'SELECT id FROM properties WHERE public_code = ? LIMIT 1',
      [code]
    );
    return row ? row.id : null;
  }
  return null;
}

/**
 * Create a unit under a property.
 * Accepts either { property_id } or { property_code } and { unit_name }.
 * Returns the created unit with public_code.
 */
export const createUnit = async (req, res, next) => {
  try {
    const { unit_name, property_id: pid, property_code } = req.body;

    const name = clean(unit_name);
    if (!name) {
      return res.status(400).json({ message: 'unit_name is required' });
    }

    const property_id = await resolvePropertyId({ property_id: pid, property_code });
    if (!property_id) {
      return res.status(400).json({ message: 'Invalid property_id / property_code' });
    }

    try {
      const [r] = await pool.query(
        'INSERT INTO units(property_id, unit_name, status) VALUES (?,?, "FOR_RENT")',
        [property_id, name]
      );
      const [[row]] = await pool.query(
        'SELECT id, public_code, property_id, unit_name, status, current_tenant_id, created_at FROM units WHERE id=?',
        [r.insertId]
      );
      return res.json(row);
    } catch (err) {
      // duplicate name within the same property (unique index on (property_id, unit_name))
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          message: 'A unit with this name already exists for this property.'
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * List units (optionally filter by property).
 * Query params: property_id or property_code.
 */
export const listUnits = async (req, res, next) => {
  try {
    const { property_id: pid, property_code } = req.query;

    let sql =
      'SELECT u.id, u.public_code, u.property_id, u.unit_name, u.status, u.current_tenant_id, u.created_at ' +
      'FROM units u ';
    const params = [];

    if (pid || property_code) {
      const property_id = await resolvePropertyId({ property_id: pid, property_code });
      if (!property_id) {
        return res.status(400).json({ message: 'Invalid property_id / property_code' });
      }
      sql += 'WHERE u.property_id = ? ';
      params.push(property_id);
    }

    sql += 'ORDER BY u.created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single unit by its numeric id.
 */
export const getUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [[row]] = await pool.query(
      'SELECT id, public_code, property_id, unit_name, status, current_tenant_id, created_at FROM units WHERE id=?',
      [id]
    );
    if (!row) return res.status(404).json({ message: 'Unit not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

/**
 * Update unit name.
 * Respect uniqueness within a property and trim the name.
 */
export const updateUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const name = clean(req.body.unit_name);
    if (!name) {
      return res.status(400).json({ message: 'unit_name is required' });
    }

    // confirm unit exists & get property to apply unique scope
    const [[unit]] = await pool.query(
      'SELECT property_id FROM units WHERE id=?',
      [id]
    );
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    try {
      await pool.query(
        'UPDATE units SET unit_name=? WHERE id=?',
        [name, id]
      );
      const [[row]] = await pool.query(
        'SELECT id, public_code, property_id, unit_name, status, current_tenant_id, created_at FROM units WHERE id=?',
        [id]
      );
      return res.json(row);
    } catch (err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          message: 'A unit with this name already exists for this property.'
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Change unit status (OCCUPIED | FOR_RENT | VACANT).
 * If status is FOR_RENT/VACANT we clear current_tenant_id.
 */
export const setUnitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (typeof status !== 'string') {
      return res.status(400).json({ message: 'status is required' });
    }
    status = clean(status).toUpperCase();

    if (!ALLOWED_STATUS.has(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${[...ALLOWED_STATUS].join(', ')}`
      });
    }

    await pool.query('UPDATE units SET status=? WHERE id=?', [status, id]);

    if (status === 'FOR_RENT' || status === 'VACANT') {
      await pool.query('UPDATE units SET current_tenant_id=NULL WHERE id=?', [id]);
    }

    const [[row]] = await pool.query(
      'SELECT id, public_code, property_id, unit_name, status, current_tenant_id, created_at FROM units WHERE id=?',
      [id]
    );
    if (!row) return res.status(404).json({ message: 'Unit not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete unit.
 * NOTE: Will fail if there are foreign keys referencing this unit.
 */
export const deleteUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM units WHERE id=?', [id]);
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    next(err);
  }
};
