import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Notice from '../controllers/notice.controller.js';

const router = Router();

router.use(authRequired);
router.post('/', requireRole(ROLES.ADMIN), Notice.createNotice);
router.get('/', Notice.listNotices);

export default router;