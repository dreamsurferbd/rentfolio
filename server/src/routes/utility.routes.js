import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Utility from '../controllers/utility.controller.js';

const router = Router();

router.use(authRequired, requireRole(ROLES.ADMIN));
router.post('/', Utility.addUtility);
router.post('/assign', Utility.assignUtilityToUnit);

export default router;