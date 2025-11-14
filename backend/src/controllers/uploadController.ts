import { Request, Response } from 'express';
import { Pothole } from '../models/Pothole.model';
import { CloudinaryService } from '../services/cloudinaryService';
import { AIVisionService } from '../services/aiVisionService';
import { SeverityService } from '../services/severityService';
import { emitPotholeUpdate } from '../websocket/socketHandler';

export const uploadPotholePhoto = async (req: Request, res: Response) => {
  try {
    const { potholeId, imageBase64 } = req.body;

    if (!potholeId || !imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: potholeId and imageBase64',
      });
    }

    // Find pothole
    const pothole = await Pothole.findById(potholeId);
    if (!pothole) {
      return res.status(404).json({
        success: false,
        error: 'Pothole not found',
      });
    }

    // Upload to Cloudinary
    console.log('📤 Uploading image to Cloudinary...');
    const imageUrl = await CloudinaryService.uploadImage(imageBase64);
    console.log('✅ Image uploaded:', imageUrl);

    // Validate with AI
    console.log('🤖 Validating image with Gemini AI...');
    const aiValidation = await AIVisionService.validatePotholeImage(imageUrl);
    console.log('✅ AI validation result:', aiValidation);

    // Update pothole
    pothole.photo = imageUrl;
    pothole.aiValidated = aiValidation.isValid;
    pothole.aiConfidence = aiValidation.confidence;

    // Boost severity if AI confirms high confidence
    if (aiValidation.isValid && aiValidation.confidence > 80) {
      console.log('🚀 High-confidence AI validation - boosting severity');
      // Increase severity by 10% (max 100)
      const boostedSeverity = Math.min(
        Math.round(pothole.severity * 1.1),
        100
      );
      pothole.severity = boostedSeverity;
    }

    await pothole.save();

    // Emit real-time update
    emitPotholeUpdate('pothole_updated', pothole);

    res.status(200).json({
      success: true,
      pothole: {
        id: pothole._id,
        photo: pothole.photo,
        aiValidated: pothole.aiValidated,
        aiConfidence: pothole.aiConfidence,
        severity: pothole.severity,
        aiReason: aiValidation.reason,
      },
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
