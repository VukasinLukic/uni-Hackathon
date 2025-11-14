import express from 'express';
import cors from 'cors';
// import { checkJwt } from './config/auth0';

const app = express();

// Middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL!, process.env.MOBILE_URL!],
    credentials: true,
  })
);
app.use(express.json());

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ============================================
// MOCK AUTH MIDDLEWARE (Development Only)
// ============================================
// TODO: Remove this and uncomment checkJwt when Auth0 is configured
// This middleware simulates an authenticated user for testing
app.use('/api', (req, res, next) => {
  // Mock authenticated user
  (req as any).auth = {
    sub: 'mock-user-id-12345', // User ID
    email: 'test@roadsense.com',
  };
  (req as any).user = {
    auth0Id: 'mock-user-id-12345',
    email: 'test@roadsense.com',
    name: 'Test User',
    role: 'driver', // Can be: 'driver', 'official', 'admin'
  };
  next();
});

// ============================================
// TO ENABLE REAL AUTH:
// 1. Setup Auth0: https://auth0.com
// 2. Add credentials to .env (AUTH0_DOMAIN, AUTH0_AUDIENCE)
// 3. Uncomment line 3: import { checkJwt } from './config/auth0';
// 4. Replace lines 23-36 with: app.use('/api', checkJwt);
// ============================================

// Import routes
import eventRoutes from './routes/events.routes';
import potholeRoutes from './routes/potholes.routes';
import uploadRoutes from './routes/upload.routes';
import statsRoutes from './routes/stats.routes';
import routeRoutes from './routes/routes.routes';
import chatRoutes from './routes/chat.routes';

app.use('/api/events', eventRoutes);
app.use('/api/potholes', potholeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
    });
  }
);

export default app;
