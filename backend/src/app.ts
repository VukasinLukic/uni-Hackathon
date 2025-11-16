import express from 'express';
import cors from 'cors';

const app = express();

// MANUAL CORS MIDDLEWARE - ALWAYS ALLOW ALL ORIGINS IN DEVELOPMENT
app.use((req, res, next) => {
  console.log(`🔵 CORS Middleware - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);

  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  console.log(`✅ CORS Headers set - Allow-Origin: ${origin}`);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log(`🟢 OPTIONS preflight - sending 204`);
    res.sendStatus(204);
    return;
  }
  next();
});

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
import explorationRoutes from './routes/exploration.routes';
import driveRoutes from './routes/drive.routes';
import aiMissionRoutes from './routes/aiMission.routes';
import geminiChatRoutes from './routes/geminiChat.routes';
import userRoutes from './routes/user.routes';

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
app.use('/api/exploration', explorationRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/ai-mission', aiMissionRoutes);
app.use('/api/gemini-chat', geminiChatRoutes);
app.use('/api/users', userRoutes); // Auth0-protected user profile routes

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
