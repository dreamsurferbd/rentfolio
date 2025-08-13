import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import * as Payment from '../controllers/payment.controller.js';

const router = Router();

router.use(authRequired);

// Create a payment for an invoice (tenant can pay own, admin can pay for any)
router.post('/', Payment.createPayment);

// List payments for an invoice
router.get('/invoice/:invoice_id', Payment.listPaymentsByInvoice);

// List my payments (or specify ?tenant_id=... when admin)
router.get('/mine', Payment.listMyPayments);

export default router;