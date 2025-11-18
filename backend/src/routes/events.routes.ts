import express from 'express';
import { createEvent } from '../controllers/eventController';

const router = express.Router();

// POST /api/events - Create new pothole event
router.post('/', createEvent);

export default router;
