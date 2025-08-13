import { Router } from 'express';
import { authRequired, requireRole } from '../middlewares/auth.js';
import { ROLES } from '../utils/roles.js';
import * as Tenant from '../controllers/tenant.controller.js';

const router = Router();

// Public endpoint for tenant request
router.post('/request', Tenant.publicTenantRequest);

// Authenticated admin endpoints
router.use(authRequired);
router.get('/requests', requireRole(ROLES.ADMIN), Tenant.listTenantRequests);
router.post('/requests/:id/approve', requireRole(ROLES.ADMIN), Tenant.approveTenantRequest);
router.post('/lease/end', requireRole(ROLES.ADMIN), Tenant.markLeaseEnded);

export default router;