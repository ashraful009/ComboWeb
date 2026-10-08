import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

export default app;
