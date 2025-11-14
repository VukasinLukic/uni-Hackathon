# 🌐 NEMANJA - Backend Implementation Plan

**Role**: Backend Developer - API & Data Processing
**Tech Stack**: Node.js + Express + MongoDB + Socket.IO + Auth0 + Gemini API
**Timeline**: 7 days (phased approach for hackathon)

---

## 🎯 OVERVIEW

Nemanjina zaduženja:
- REST API endpoints za mobile i web
- MongoDB database setup i models
- Clustering algoritam za rupe
- Severity scoring logic
- Gemini API integracija za AI validaciju slika
- Route optimization algoritam
- Real-time komunikacija (Socket.IO)
- Auth0 JWT verification

---

## 📅 PHASE 1: Setup & Core Infrastructure (Day 1-2)

### ✅ Day 1 Morning: Project Initialization

**Tasks:**
1. Initialize Node.js + TypeScript project
   ```bash
   cd backend
   npm init -y
   npm install express mongoose dotenv cors
   npm install socket.io
   npm install express-jwt jwks-rsa  # Auth0
   npm install @google/generative-ai  # Gemini
   npm install cloudinary
   npm install -D typescript @types/node @types/express ts-node nodemon
   ```

2. Setup TypeScript
   ```bash
   npx tsc --init
   ```

   Modify `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules"]
   }
   ```

3. Create folder structure
   ```bash
   mkdir -p src/{routes,controllers,services,models,middleware,utils,config,websocket}
   ```

4. Create `.env.example`
   ```env
   PORT=5000
   NODE_ENV=development

   # MongoDB
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roadsense

   # Auth0
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_AUDIENCE=https://api.roadsense.com

   # Gemini API
   GEMINI_API_KEY=your-gemini-api-key

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   MOBILE_URL=http://localhost:8081
   ```

**Deliverable**: ✅ Project structure sa TypeScript

---

### ✅ Day 1 Afternoon: MongoDB Connection & Models

**Tasks:**
1. Create `src/config/database.ts`
   ```typescript
   import mongoose from 'mongoose';

   export const connectDB = async () => {
     try {
       const conn = await mongoose.connect(process.env.MONGODB_URI!);
       console.log(`MongoDB Connected: ${conn.connection.host}`);
     } catch (error) {
       console.error('MongoDB connection error:', error);
       process.exit(1);
     }
   };
   ```

2. Create `src/models/Event.model.ts`
   ```typescript
   import mongoose, { Schema, Document } from 'mongoose';

   export interface IEvent extends Document {
     userId: string;
     location: {
       type: 'Point';
       coordinates: [number, number]; // [lng, lat]
     };
     timestamp: Date;
     accelerationData: {
       magnitude: number;
       x: number;
       y: number;
       z: number;
     };
     gyroscopeData: {
       alpha: number;
       beta: number;
       gamma: number;
     };
     speed: number; // km/h
     deviceOrientation: {
       pitch: number;
       roll: number;
       yaw: number;
     };
     clusterId?: mongoose.Types.ObjectId;
   }

   const EventSchema = new Schema<IEvent>({
     userId: { type: String, required: true },
     location: {
       type: {
         type: String,
         enum: ['Point'],
         required: true,
       },
       coordinates: {
         type: [Number], // [lng, lat]
         required: true,
       },
     },
     timestamp: { type: Date, default: Date.now },
     accelerationData: {
       magnitude: { type: Number, required: true },
       x: Number,
       y: Number,
       z: Number,
     },
     gyroscopeData: {
       alpha: Number,
       beta: Number,
       gamma: Number,
     },
     speed: { type: Number, required: true },
     deviceOrientation: {
       pitch: Number,
       roll: Number,
       yaw: Number,
     },
     clusterId: { type: Schema.Types.ObjectId, ref: 'Pothole' },
   }, { timestamps: true });

   // Geospatial index for location queries
   EventSchema.index({ location: '2dsphere' });

   export const Event = mongoose.model<IEvent>('Event', EventSchema);
   ```

3. Create `src/models/Pothole.model.ts`
   ```typescript
   import mongoose, { Schema, Document } from 'mongoose';

   export interface IPothole extends Document {
     location: {
       type: 'Point';
       coordinates: [number, number];
       address?: string;
     };
     severity: number; // 0-100
     status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
     reports: number; // count of unique users
     uniqueUsers: string[]; // array of userIds
     impactData: {
       avgMagnitude: number;
       maxMagnitude: number;
       count: number;
     };
     photo?: string; // Cloudinary URL
     aiValidated: boolean;
     aiConfidence?: number;
     notes?: string;
     firstReported: Date;
     lastReported: Date;
     resolvedAt?: Date;
   }

   const PotholeSchema = new Schema<IPothole>({
     location: {
       type: {
         type: String,
         enum: ['Point'],
         required: true,
       },
       coordinates: {
         type: [Number],
         required: true,
       },
       address: String,
     },
     severity: { type: Number, default: 0, min: 0, max: 100 },
     status: {
       type: String,
       enum: ['new', 'planned', 'in_progress', 'resolved', 'rejected'],
       default: 'new',
     },
     reports: { type: Number, default: 1 },
     uniqueUsers: [{ type: String }],
     impactData: {
       avgMagnitude: { type: Number, required: true },
       maxMagnitude: { type: Number, required: true },
       count: { type: Number, default: 1 },
     },
     photo: String,
     aiValidated: { type: Boolean, default: false },
     aiConfidence: Number,
     notes: String,
     firstReported: { type: Date, default: Date.now },
     lastReported: { type: Date, default: Date.now },
     resolvedAt: Date,
   }, { timestamps: true });

   PotholeSchema.index({ location: '2dsphere' });
   PotholeSchema.index({ severity: -1 });
   PotholeSchema.index({ status: 1 });

   export const Pothole = mongoose.model<IPothole>('Pothole', PotholeSchema);
   ```

4. Create `src/models/User.model.ts`
   ```typescript
   import mongoose, { Schema, Document } from 'mongoose';

   export interface IUser extends Document {
     auth0Id: string;
     email: string;
     name?: string;
     role: 'driver' | 'official' | 'admin';
     stats: {
       totalReports: number;
       confirmedPotholes: number;
       points: number;
     };
   }

   const UserSchema = new Schema<IUser>({
     auth0Id: { type: String, required: true, unique: true },
     email: { type: String, required: true },
     name: String,
     role: {
       type: String,
       enum: ['driver', 'official', 'admin'],
       default: 'driver',
     },
     stats: {
       totalReports: { type: Number, default: 0 },
       confirmedPotholes: { type: Number, default: 0 },
       points: { type: Number, default: 0 },
     },
   }, { timestamps: true });

   export const User = mongoose.model<IUser>('User', UserSchema);
   ```

**Deliverable**: ✅ MongoDB models spremni

---

### ✅ Day 2 Morning: Express Server & Auth Middleware

**Tasks:**
1. Create `src/config/auth0.ts`
   ```typescript
   import { expressjwt } from 'express-jwt';
   import jwksRsa from 'jwks-rsa';

   export const checkJwt = expressjwt({
     secret: jwksRsa.expressJwtSecret({
       cache: true,
       rateLimit: true,
       jwksRequestsPerMinute: 5,
       jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
     }),
     audience: process.env.AUTH0_AUDIENCE,
     issuer: `https://${process.env.AUTH0_DOMAIN}/`,
     algorithms: ['RS256'],
   });
   ```

2. Create `src/middleware/auth.middleware.ts`
   ```typescript
   import { Request, Response, NextFunction } from 'express';
   import { User } from '../models/User.model';

   export const requireRole = (roles: string[]) => {
     return async (req: Request, res: Response, next: NextFunction) => {
       try {
         const auth0Id = (req as any).auth?.sub;

         if (!auth0Id) {
           return res.status(401).json({ error: 'Unauthorized' });
         }

         const user = await User.findOne({ auth0Id });

         if (!user || !roles.includes(user.role)) {
           return res.status(403).json({ error: 'Forbidden' });
         }

         (req as any).user = user;
         next();
       } catch (error) {
         res.status(500).json({ error: 'Auth error' });
       }
     };
   };
   ```

3. Create `src/app.ts`
   ```typescript
   import express from 'express';
   import cors from 'cors';
   import { checkJwt } from './config/auth0';

   const app = express();

   // Middleware
   app.use(cors({
     origin: [process.env.FRONTEND_URL!, process.env.MOBILE_URL!],
     credentials: true,
   }));
   app.use(express.json());

   // Health check (no auth)
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date() });
   });

   // Protected routes
   app.use('/api', checkJwt);

   // Import routes (we'll create these next)
   import eventRoutes from './routes/events.routes';
   import potholeRoutes from './routes/potholes.routes';

   app.use('/api/events', eventRoutes);
   app.use('/api/potholes', potholeRoutes);

   // Error handling
   app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
     console.error(err.stack);
     res.status(err.status || 500).json({
       error: err.message || 'Internal server error',
     });
   });

   export default app;
   ```

4. Create `src/server.ts`
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();

   import app from './app';
   import { connectDB } from './config/database';
   import { createServer } from 'http';
   import { initializeSocket } from './websocket/socketHandler';

   const PORT = process.env.PORT || 5000;

   const startServer = async () => {
     try {
       // Connect to MongoDB
       await connectDB();

       // Create HTTP server
       const httpServer = createServer(app);

       // Initialize Socket.IO
       initializeSocket(httpServer);

       // Start server
       httpServer.listen(PORT, () => {
         console.log(`🚀 Server running on port ${PORT}`);
       });
     } catch (error) {
       console.error('Failed to start server:', error);
       process.exit(1);
     }
   };

   startServer();
   ```

**Deliverable**: ✅ Express server sa Auth0 middleware

---

## 📅 PHASE 2: Core API Endpoints (Day 2-3)

### ✅ Day 2 Afternoon: Events Endpoint

**Tasks:**
1. Create `src/services/clusteringService.ts`
   ```typescript
   import { Pothole, IPothole } from '../models/Pothole.model';
   import { IEvent } from '../models/Event.model';

   const CLUSTERING_RADIUS = 20; // meters

   export class ClusteringService {
     async findNearbyCluster(
       coordinates: [number, number],
       maxDistance: number = CLUSTERING_RADIUS
     ): Promise<IPothole | null> {
       const cluster = await Pothole.findOne({
         location: {
           $near: {
             $geometry: {
               type: 'Point',
               coordinates,
             },
             $maxDistance: maxDistance,
           },
         },
         status: { $ne: 'resolved' },
       });

       return cluster;
     }

     async createNewCluster(event: IEvent): Promise<IPothole> {
       const newCluster = new Pothole({
         location: {
           type: 'Point',
           coordinates: event.location.coordinates,
         },
         severity: 0, // will be calculated
         uniqueUsers: [event.userId],
         reports: 1,
         impactData: {
           avgMagnitude: event.accelerationData.magnitude,
           maxMagnitude: event.accelerationData.magnitude,
           count: 1,
         },
         firstReported: event.timestamp,
         lastReported: event.timestamp,
       });

       await newCluster.save();
       return newCluster;
     }

     async addEventToCluster(cluster: IPothole, event: IEvent): Promise<IPothole> {
       // Update unique users
       if (!cluster.uniqueUsers.includes(event.userId)) {
         cluster.uniqueUsers.push(event.userId);
         cluster.reports = cluster.uniqueUsers.length;
       }

       // Update impact data
       const newCount = cluster.impactData.count + 1;
       cluster.impactData.avgMagnitude =
         (cluster.impactData.avgMagnitude * cluster.impactData.count +
           event.accelerationData.magnitude) /
         newCount;

       cluster.impactData.maxMagnitude = Math.max(
         cluster.impactData.maxMagnitude,
         event.accelerationData.magnitude
       );

       cluster.impactData.count = newCount;
       cluster.lastReported = event.timestamp;

       await cluster.save();
       return cluster;
     }
   }
   ```

2. Create `src/services/severityService.ts`
   ```typescript
   import { IPothole } from '../models/Pothole.model';

   export class SeverityService {
     // Weights for severity calculation
     private static WEIGHTS = {
       avgImpact: 0.3,
       maxImpact: 0.5,
       frequency: 0.2,
     };

     // Normalization ranges
     private static MAX_MAGNITUDE = 3.0; // 3g is extreme
     private static MAX_FREQUENCY = 50; // 50 reports is very high

     static calculateSeverity(pothole: IPothole): number {
       const avgNorm = Math.min(
         pothole.impactData.avgMagnitude / this.MAX_MAGNITUDE,
         1
       );

       const maxNorm = Math.min(
         pothole.impactData.maxMagnitude / this.MAX_MAGNITUDE,
         1
       );

       const freqNorm = Math.min(
         pothole.reports / this.MAX_FREQUENCY,
         1
       );

       const severity =
         this.WEIGHTS.avgImpact * avgNorm +
         this.WEIGHTS.maxImpact * maxNorm +
         this.WEIGHTS.frequency * freqNorm;

       return Math.round(severity * 100); // 0-100 scale
     }

     static async updateSeverity(pothole: IPothole): Promise<void> {
       pothole.severity = this.calculateSeverity(pothole);
       await pothole.save();
     }
   }
   ```

3. Create `src/controllers/eventController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { Event } from '../models/Event.model';
   import { ClusteringService } from '../services/clusteringService';
   import { SeverityService } from '../services/severityService';
   import { emitPotholeUpdate } from '../websocket/socketHandler';

   const clusteringService = new ClusteringService();

   export const createEvent = async (req: Request, res: Response) => {
     try {
       const userId = (req as any).auth.sub;
       const eventData = {
         ...req.body,
         userId,
       };

       // Validate required fields
       if (
         !eventData.location?.coordinates ||
         !eventData.accelerationData?.magnitude ||
         eventData.speed == null
       ) {
         return res.status(400).json({ error: 'Missing required fields' });
       }

       // Create event
       const event = new Event(eventData);
       await event.save();

       // Find or create cluster
       let cluster = await clusteringService.findNearbyCluster(
         eventData.location.coordinates
       );

       if (cluster) {
         // Add to existing cluster
         cluster = await clusteringService.addEventToCluster(cluster, event);
         event.clusterId = cluster._id;
         await event.save();
       } else {
         // Create new cluster
         cluster = await clusteringService.createNewCluster(event);
         event.clusterId = cluster._id;
         await event.save();
       }

       // Recalculate severity
       await SeverityService.updateSeverity(cluster);

       // Emit real-time update
       if (cluster.severity > 70) {
         emitPotholeUpdate('new_pothole', cluster);
       } else {
         emitPotholeUpdate('pothole_updated', cluster);
       }

       res.status(201).json({
         success: true,
         eventId: event._id,
         clusterId: cluster._id,
         severity: cluster.severity,
       });
     } catch (error: any) {
       console.error('Create event error:', error);
       res.status(500).json({ error: error.message });
     }
   };
   ```

4. Create `src/routes/events.routes.ts`
   ```typescript
   import express from 'express';
   import { createEvent } from '../controllers/eventController';

   const router = express.Router();

   // POST /api/events - Create new pothole event
   router.post('/', createEvent);

   export default router;
   ```

**Deliverable**: ✅ POST /api/events endpoint radi

---

### ✅ Day 3 Morning: Potholes Endpoints

**Tasks:**
1. Create `src/controllers/potholeController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { Pothole } from '../models/Pothole.model';
   import { emitPotholeUpdate } from '../websocket/socketHandler';

   export const getAllPotholes = async (req: Request, res: Response) => {
     try {
       const {
         severity,
         status,
         limit = 100,
         minSeverity,
       } = req.query;

       const query: any = {};

       if (status) query.status = status;
       if (minSeverity) query.severity = { $gte: Number(minSeverity) };

       const potholes = await Pothole.find(query)
         .sort({ severity: -1 })
         .limit(Number(limit));

       res.json({
         success: true,
         count: potholes.length,
         potholes,
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };

   export const getPotholeById = async (req: Request, res: Response) => {
     try {
       const pothole = await Pothole.findById(req.params.id);

       if (!pothole) {
         return res.status(404).json({ error: 'Pothole not found' });
       }

       res.json({ success: true, pothole });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };

   export const updatePotholeStatus = async (req: Request, res: Response) => {
     try {
       const { status, notes } = req.body;

       const pothole = await Pothole.findById(req.params.id);

       if (!pothole) {
         return res.status(404).json({ error: 'Pothole not found' });
       }

       pothole.status = status;
       if (notes) pothole.notes = notes;
       if (status === 'resolved') pothole.resolvedAt = new Date();

       await pothole.save();

       // Emit update
       emitPotholeUpdate('pothole_updated', pothole);

       res.json({ success: true, pothole });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };

   export const getPotholesNearby = async (req: Request, res: Response) => {
     try {
       const { lng, lat, radius = 1000 } = req.query;

       if (!lng || !lat) {
         return res.status(400).json({ error: 'Missing coordinates' });
       }

       const potholes = await Pothole.find({
         location: {
           $near: {
             $geometry: {
               type: 'Point',
               coordinates: [Number(lng), Number(lat)],
             },
             $maxDistance: Number(radius),
           },
         },
         status: { $ne: 'resolved' },
       }).limit(50);

       res.json({ success: true, count: potholes.length, potholes });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };
   ```

2. Create `src/routes/potholes.routes.ts`
   ```typescript
   import express from 'express';
   import {
     getAllPotholes,
     getPotholeById,
     updatePotholeStatus,
     getPotholesNearby,
   } from '../controllers/potholeController';
   import { requireRole } from '../middleware/auth.middleware';

   const router = express.Router();

   // GET /api/potholes - Get all potholes
   router.get('/', getAllPotholes);

   // GET /api/potholes/nearby - Get nearby potholes
   router.get('/nearby', getPotholesNearby);

   // GET /api/potholes/:id - Get single pothole
   router.get('/:id', getPotholeById);

   // PATCH /api/potholes/:id - Update pothole (officials only)
   router.patch('/:id', requireRole(['official', 'admin']), updatePotholeStatus);

   export default router;
   ```

**Deliverable**: ✅ Pothole CRUD endpoints

---

## 📅 PHASE 3: AI Integration (Day 3-4)

### ✅ Day 3 Afternoon: Gemini API for Image Validation

**Tasks:**
1. Create `src/services/aiVisionService.ts`
   ```typescript
   import { GoogleGenerativeAI } from '@google/generative-ai';

   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

   export class AIVisionService {
     private model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

     async validatePotholeImage(imageUrl: string): Promise<{
       isPothole: boolean;
       confidence: number;
       description: string;
     }> {
       try {
         const prompt = `
           Analyze this image and determine if it shows a pothole or road damage.

           Respond in JSON format:
           {
             "isPothole": true/false,
             "confidence": 0-100,
             "description": "brief description of what you see",
             "estimatedSize": "small/medium/large" (if pothole)
           }
         `;

         const result = await this.model.generateContent([
           prompt,
           {
             inlineData: {
               data: await this.fetchImageAsBase64(imageUrl),
               mimeType: 'image/jpeg',
             },
           },
         ]);

         const response = await result.response;
         const text = response.text();

         // Parse JSON response
         const analysis = JSON.parse(text);

         return {
           isPothole: analysis.isPothole,
           confidence: analysis.confidence,
           description: analysis.description,
         };
       } catch (error) {
         console.error('AI Vision error:', error);
         return {
           isPothole: false,
           confidence: 0,
           description: 'Error analyzing image',
         };
       }
     }

     private async fetchImageAsBase64(url: string): Promise<string> {
       const response = await fetch(url);
       const buffer = await response.arrayBuffer();
       return Buffer.from(buffer).toString('base64');
     }
   }
   ```

2. Create `src/services/cloudinaryService.ts`
   ```typescript
   import { v2 as cloudinary } from 'cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export class CloudinaryService {
     static async uploadImage(
       base64Image: string,
       folder: string = 'potholes'
     ): Promise<string> {
       try {
         const result = await cloudinary.uploader.upload(base64Image, {
           folder,
           resource_type: 'image',
         });

         return result.secure_url;
       } catch (error) {
         console.error('Cloudinary upload error:', error);
         throw new Error('Image upload failed');
       }
     }
   }
   ```

3. Create `src/controllers/uploadController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { CloudinaryService } from '../services/cloudinaryService';
   import { AIVisionService } from '../services/aiVisionService';
   import { Pothole } from '../models/Pothole.model';

   const aiVisionService = new AIVisionService();

   export const uploadPotholePhoto = async (req: Request, res: Response) => {
     try {
       const { potholeId, image } = req.body; // image as base64

       if (!potholeId || !image) {
         return res.status(400).json({ error: 'Missing potholeId or image' });
       }

       // Upload to Cloudinary
       const imageUrl = await CloudinaryService.uploadImage(image);

       // Validate with AI
       const aiResult = await aiVisionService.validatePotholeImage(imageUrl);

       // Update pothole
       const pothole = await Pothole.findById(potholeId);

       if (!pothole) {
         return res.status(404).json({ error: 'Pothole not found' });
       }

       pothole.photo = imageUrl;
       pothole.aiValidated = aiResult.isPothole;
       pothole.aiConfidence = aiResult.confidence;

       // If AI confirms with high confidence, boost severity
       if (aiResult.isPothole && aiResult.confidence > 80) {
         pothole.severity = Math.min(pothole.severity + 10, 100);
       }

       await pothole.save();

       res.json({
         success: true,
         imageUrl,
         aiValidation: aiResult,
         pothole,
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };
   ```

4. Create `src/routes/upload.routes.ts`
   ```typescript
   import express from 'express';
   import { uploadPotholePhoto } from '../controllers/uploadController';

   const router = express.Router();

   router.post('/photo', uploadPotholePhoto);

   export default router;
   ```

**Deliverable**: ✅ Image upload + AI validation

---

## 📅 PHASE 4: Advanced Features (Day 4-6)

### ✅ Day 4: Route Optimization

**Tasks:**
1. Create `src/services/routeOptimizer.ts`
   ```typescript
   import { Pothole, IPothole } from '../models/Pothole.model';

   interface RouteStop {
     potholeId: string;
     location: [number, number];
     severity: number;
   }

   interface OptimizedRoute {
     crewId: number;
     stops: RouteStop[];
     totalDistance: number;
     estimatedTime: number;
   }

   export class RouteOptimizer {
     // Simple greedy nearest-neighbor algorithm
     static async optimizeRoutes(
       numCrews: number,
       potholeIds?: string[]
     ): Promise<OptimizedRoute[]> {
       // Get potholes to fix
       let potholes: IPothole[];

       if (potholeIds) {
         potholes = await Pothole.find({ _id: { $in: potholeIds } });
       } else {
         // Get top severity potholes that need fixing
         potholes = await Pothole.find({
           status: { $in: ['new', 'planned'] },
           severity: { $gte: 50 },
         })
           .sort({ severity: -1 })
           .limit(numCrews * 10);
       }

       if (potholes.length === 0) {
         return [];
       }

       // Split potholes into crews
       const routes: OptimizedRoute[] = [];
       const potholesPerCrew = Math.ceil(potholes.length / numCrews);

       for (let i = 0; i < numCrews; i++) {
         const crewPotholes = potholes.slice(
           i * potholesPerCrew,
           (i + 1) * potholesPerCrew
         );

         if (crewPotholes.length === 0) break;

         const route = this.optimizeSingleRoute(i + 1, crewPotholes);
         routes.push(route);
       }

       return routes;
     }

     private static optimizeSingleRoute(
       crewId: number,
       potholes: IPothole[]
     ): OptimizedRoute {
       const stops: RouteStop[] = [];
       const unvisited = [...potholes];
       let current = unvisited.shift()!;

       stops.push({
         potholeId: current._id.toString(),
         location: current.location.coordinates,
         severity: current.severity,
       });

       let totalDistance = 0;

       // Greedy nearest neighbor
       while (unvisited.length > 0) {
         let nearest = unvisited[0];
         let nearestDist = this.haversineDistance(
           current.location.coordinates,
           nearest.location.coordinates
         );

         for (let i = 1; i < unvisited.length; i++) {
           const dist = this.haversineDistance(
             current.location.coordinates,
             unvisited[i].location.coordinates
           );

           if (dist < nearestDist) {
             nearest = unvisited[i];
             nearestDist = dist;
           }
         }

         stops.push({
           potholeId: nearest._id.toString(),
           location: nearest.location.coordinates,
           severity: nearest.severity,
         });

         totalDistance += nearestDist;
         current = nearest;
         unvisited.splice(unvisited.indexOf(nearest), 1);
       }

       // Estimate time: 20 min per pothole + travel time (40 km/h avg)
       const travelTimeHours = totalDistance / 40;
       const fixTimeHours = stops.length * (20 / 60);
       const estimatedTime = travelTimeHours + fixTimeHours;

       return {
         crewId,
         stops,
         totalDistance,
         estimatedTime,
       };
     }

     private static haversineDistance(
       coord1: [number, number],
       coord2: [number, number]
     ): number {
       const R = 6371; // Earth radius in km
       const dLat = this.toRad(coord2[1] - coord1[1]);
       const dLon = this.toRad(coord2[0] - coord1[0]);

       const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.toRad(coord1[1])) *
           Math.cos(this.toRad(coord2[1])) *
           Math.sin(dLon / 2) *
           Math.sin(dLon / 2);

       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
       return R * c;
     }

     private static toRad(degrees: number): number {
       return (degrees * Math.PI) / 180;
     }
   }
   ```

2. Create `src/controllers/routeController.ts` and `src/routes/routes.routes.ts`

**Deliverable**: ✅ Route optimization endpoint

---

### ✅ Day 5: Statistics & Analytics

**Tasks:**
1. Create `src/controllers/statsController.ts`
   ```typescript
   import { Request, Response } from 'express';
   import { Pothole } from '../models/Pothole.model';
   import { Event } from '../models/Event.model';

   export const getStats = async (req: Request, res: Response) => {
     try {
       const total = await Pothole.countDocuments();
       const resolved = await Pothole.countDocuments({ status: 'resolved' });
       const highSeverity = await Pothole.countDocuments({ severity: { $gte: 70 } });

       // Avg resolution time
       const resolvedPotholes = await Pothole.find({
         status: 'resolved',
         resolvedAt: { $exists: true },
       });

       let totalDays = 0;
       resolvedPotholes.forEach((p) => {
         const days =
           (p.resolvedAt!.getTime() - p.firstReported.getTime()) /
           (1000 * 60 * 60 * 24);
         totalDays += days;
       });

       const avgResolutionTime =
         resolvedPotholes.length > 0
           ? Math.round(totalDays / resolvedPotholes.length)
           : 0;

       // Fixed this month
       const startOfMonth = new Date();
       startOfMonth.setDate(1);
       startOfMonth.setHours(0, 0, 0, 0);

       const fixedThisMonth = await Pothole.countDocuments({
         status: 'resolved',
         resolvedAt: { $gte: startOfMonth },
       });

       res.json({
         success: true,
         stats: {
           total,
           resolved,
           highSeverity,
           fixedThisMonth,
           avgResolutionTime,
         },
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };

   export const getTrends = async (req: Request, res: Response) => {
     try {
       const { days = 30 } = req.query;

       const startDate = new Date();
       startDate.setDate(startDate.getDate() - Number(days));

       // Aggregate by day
       const reported = await Pothole.aggregate([
         {
           $match: {
             firstReported: { $gte: startDate },
           },
         },
         {
           $group: {
             _id: {
               $dateToString: { format: '%Y-%m-%d', date: '$firstReported' },
             },
             count: { $sum: 1 },
           },
         },
         { $sort: { _id: 1 } },
       ]);

       const fixed = await Pothole.aggregate([
         {
           $match: {
             status: 'resolved',
             resolvedAt: { $gte: startDate },
           },
         },
         {
           $group: {
             _id: {
               $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' },
             },
             count: { $sum: 1 },
           },
         },
         { $sort: { _id: 1 } },
       ]);

       res.json({
         success: true,
         trends: {
           reported,
           fixed,
         },
       });
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
   };
   ```

**Deliverable**: ✅ Stats endpoints

---

### ✅ Day 6: WebSocket Real-time

**Tasks:**
1. Create `src/websocket/socketHandler.ts`
   ```typescript
   import { Server } from 'socket.io';
   import { Server as HTTPServer } from 'http';
   import { IPothole } from '../models/Pothole.model';

   let io: Server;

   export const initializeSocket = (httpServer: HTTPServer) => {
     io = new Server(httpServer, {
       cors: {
         origin: [process.env.FRONTEND_URL!, process.env.MOBILE_URL!],
         credentials: true,
       },
     });

     io.on('connection', (socket) => {
       console.log(`Client connected: ${socket.id}`);

       socket.on('subscribe_location', (data: { lat: number; lng: number }) => {
         // Join room for location updates
         const room = `location_${Math.floor(data.lat)}_${Math.floor(data.lng)}`;
         socket.join(room);
         console.log(`Socket ${socket.id} joined room ${room}`);
       });

       socket.on('disconnect', () => {
         console.log(`Client disconnected: ${socket.id}`);
       });
     });

     console.log('✅ Socket.IO initialized');
   };

   export const emitPotholeUpdate = (
     event: 'new_pothole' | 'pothole_updated',
     pothole: IPothole
   ) => {
     if (!io) return;

     // Broadcast to all connected clients
     io.emit(event, {
       potholeId: pothole._id,
       location: pothole.location,
       severity: pothole.severity,
       status: pothole.status,
     });

     // Also emit to specific location room
     const [lng, lat] = pothole.location.coordinates;
     const room = `location_${Math.floor(lat)}_${Math.floor(lng)}`;
     io.to(room).emit('nearby_pothole', pothole);
   };
   ```

**Deliverable**: ✅ Real-time updates

---

## 📅 PHASE 5: Testing & Deployment (Day 7)

### ✅ Day 7: Final Testing & Optimization

**Tasks:**
1. Test all endpoints with Postman/Thunder Client
2. Add request validation
3. Add rate limiting (if time permits)
   ```bash
   npm install express-rate-limit
   ```

4. Create seed data script `src/utils/seed.ts`
   ```typescript
   // Generate 20-30 fake potholes for demo
   ```

5. Write README with API documentation

6. Deploy to DigitalOcean/Heroku/Railway

**Deliverable**: ✅ Production-ready backend

---

## 🎯 PRIORITY CHECKLIST

### MUST HAVE
- [x] POST /api/events (sensor data)
- [x] GET /api/potholes (all potholes)
- [x] GET /api/potholes/nearby
- [x] PATCH /api/potholes/:id (status update)
- [x] Clustering algorithm
- [x] Severity calculation
- [x] Auth0 JWT verification

### SHOULD HAVE
- [x] Image upload + Gemini validation
- [x] Route optimization
- [x] Statistics endpoints
- [x] WebSocket real-time

### NICE TO HAVE
- [ ] AI Chatbot backend
- [ ] Caching (Redis)
- [ ] Rate limiting
- [ ] Advanced analytics

---

## 🐛 COMMON ISSUES

### MongoDB connection fails
```typescript
// Check .env has correct MONGODB_URI
// Whitelist your IP in MongoDB Atlas
```

### Auth0 tokens rejected
```typescript
// Ensure AUTH0_DOMAIN and AUTH0_AUDIENCE are correct
// Check token is sent as: Authorization: Bearer <token>
```

### Clustering not working
```typescript
// Make sure 2dsphere index is created:
EventSchema.index({ location: '2dsphere' });
PotholeSchema.index({ location: '2dsphere' });
```

---

## 📚 RESOURCES

- [Express TypeScript Setup](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Auth0 Node.js Guide](https://auth0.com/docs/quickstart/backend/nodejs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Socket.IO Docs](https://socket.io/docs/v4/)

---

**Nemanja, srećno! 💪 Koordiniraj sa Vukašinom za mobile API i Teodorom za dashboard endpoints!**
