import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Invoice from '../controllers/invoice.controller.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(authRequired);

// Read one invoice (verify status/public_code quickly)
router.get('/:id', Invoice.getInvoice);

// Admin creates invoice (optionally with attachment)
router.post(
  '/create',
  requireRole(ROLES.ADMIN),
  upload.single('attachment'),
  (req, _res, next) => { if (req.file) req.body.attachment_path = req.file.path; next(); },
  Invoice.createMonthlyInvoice
);

// Admin or Tenant can mark payment
router.post('/:id/pay', requireRole(ROLES.ADMIN, ROLES.TENANT), Invoice.markInvoicePaid);

export default router;
