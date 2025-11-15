import express from 'express';
import cors from 'cors';

const app = express();

// Middleware - CORS Configuration
// In development, allow all origins for Expo Go testing
// In production, restrict to specific domains
const corsOptions = {
  origin: process.env.ALLOW_ALL_ORIGINS === 'true'
    ? true // Allow all origins (development only!)
    : [process.env.FRONTEND_URL!, process.env.MOBILE_URL!],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Import routes
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/events.routes';
import potholeRoutes from './routes/potholes.routes';
import uploadRoutes from './routes/upload.routes';
import statsRoutes from './routes/stats.routes';
import routeRoutes from './routes/routes.routes';
import chatRoutes from './routes/chat.routes';
import xpRoutes from './routes/xp.routes';
import achievementRoutes from './routes/achievement.routes';

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes (will require JWT tokens sent via frontend)
app.use('/api/events', eventRoutes);
app.use('/api/potholes', potholeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/achievements', achievementRoutes);

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
