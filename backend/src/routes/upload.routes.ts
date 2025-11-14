import express from 'express';
import { uploadPotholePhoto } from '../controllers/uploadController';

const router = express.Router();

router.post('/photo', uploadPotholePhoto);

export default router;
