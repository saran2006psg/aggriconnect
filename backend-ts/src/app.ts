import express from 'express';
import cors from 'cors';
import { config } from './config/config';
import apiRouter from './routes/index';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// ─── Health & Root ────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to AgriConnect API',
    version: config.version,
    docs: `${config.apiV1Prefix}/docs`,
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use(config.apiV1Prefix, apiRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorMiddleware);

export default app;
