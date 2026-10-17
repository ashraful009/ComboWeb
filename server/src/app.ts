import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

const app = express();

// Trust reverse proxy (LiteSpeed / Passenger / CloudLinux) so express-rate-limit and req.ip work
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (env.NODE_ENV === 'development') return true;
  if (origin === env.CLIENT_ORIGIN) return true;
  try {
    const url = new URL(origin);
    if (
      url.hostname === 'freshagro.farm' ||
      url.hostname.endsWith('.freshagro.farm') ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1'
    ) {
      return true;
    }
  } catch {
    // fallback
  }
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend build in production
const possibleClientPaths = [
  path.resolve(__dirname, '../../public'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(process.cwd(), 'public'),
];
const clientDist = possibleClientPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
