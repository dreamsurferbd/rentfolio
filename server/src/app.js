import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.js';

// Routers
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import unitRoutes from './routes/unit.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import agreementRoutes from './routes/agreement.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import noticeRoutes from './routes/notice.routes.js';
import utilityRoutes from './routes/utility.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads')));

// Health check (handy for testing)
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/utilities', utilityRoutes);
app.use('/api/payments', paymentRoutes);

app.use(errorHandler);
export default app;
