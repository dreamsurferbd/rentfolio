import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Property from '../controllers/property.controller.js';

const router = Router();

router.use(authRequired, requireRole(ROLES.ADMIN));
router.post('/', Property.createProperty);
router.get('/', Property.listProperties);

export default router;