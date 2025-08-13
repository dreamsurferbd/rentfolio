import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Agreement from '../controllers/agreement.controller.js';

const router = Router();

router.use(authRequired);
router.post('/send', requireRole(ROLES.ADMIN), Agreement.sendAgreement);
router.get('/:id', Agreement.getAgreement);
router.post('/:id/approve', requireRole(ROLES.TENANT), Agreement.approveAgreement);

export default router;