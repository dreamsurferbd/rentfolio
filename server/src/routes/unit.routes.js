// server/src/routes/unit.routes.js
import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Unit from '../controllers/unit.controller.js';

const router = Router();

// Admin-only in this example; adjust if tenants should read
router.use(authRequired, requireRole(ROLES.ADMIN));

router.post('/', Unit.createUnit);
router.get('/', Unit.listUnits);          // <- new
router.get('/:id', Unit.getUnit);         // <- new
router.patch('/:id', Unit.updateUnit);    // <- new (rename)
router.patch('/:id/status', Unit.setUnitStatus);
router.delete('/:id', Unit.deleteUnit);   // <- new

export default router;
