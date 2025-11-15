import { Request, Response } from 'express';
import { Event } from '../models/Event.model';
import { ClusteringService } from '../services/clusteringService';
import { SeverityService } from '../services/severityService';
import { emitPotholeUpdate } from '../websocket/socketHandler';
import { XPService } from '../services/xpService';
import { AchievementService } from '../services/achievementService';
import { User } from '../models/User.model';

const clusteringService = new ClusteringService();

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Allow anonymous events (no auth required for now)
    const userId = (req as any).auth?.sub || 'anonymous';
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

    // Find or create cluster (with timeout protection)
    let cluster: any = null;
    let severity = 0;

    try {
      const clusterPromise = clusteringService.findNearbyCluster(
        eventData.location.coordinates
      );

      // Add timeout wrapper (10 seconds max)
      cluster = await Promise.race([
        clusterPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Cluster query timeout')), 10000)
        )
      ]) as any;

      let isNewDetection = false;

      if (cluster) {
        // Add to existing cluster
        cluster = await clusteringService.addEventToCluster(cluster, event);
        event.clusterId = cluster._id as any;
        await event.save();
      } else {
        // Create new cluster - award XP for new pothole detection!
        cluster = await clusteringService.createNewCluster(event);
        event.clusterId = cluster._id as any;
        await event.save();
        isNewDetection = true;
      }

      // Award XP and check achievements if user is authenticated
      if (userId !== 'anonymous' && isNewDetection) {
        // Award XP for detecting pothole (20 XP)
        await XPService.awardXPForAction(userId, 'detect_pothole');

        // Update user stats
        await User.findByIdAndUpdate(userId, {
          $inc: { 'stats.potholesDetected': 1 },
        });

        // Check for newly unlocked achievements
        await AchievementService.checkAndUnlockAchievements(userId);
      }

      // Recalculate severity (in background, don't block)
      SeverityService.updateSeverity(cluster).then((updatedCluster: any) => {
        severity = updatedCluster.severity;
      }).catch(err => {
        console.error('Severity calc error:', err);
      });
    } catch (clusterError: any) {
      console.error('Clustering error (non-fatal):', clusterError.message);
      // If clustering fails, still return success (event was saved)
    }

    // Send response IMMEDIATELY (before websocket emit)
    res.status(201).json({
      success: true,
      eventId: event._id,
      clusterId: cluster?._id || 'pending',
      severity: cluster?.severity || 0,
    });

    // Emit real-time update asynchronously (don't block response)
    setImmediate(() => {
      try {
        if (cluster && cluster.severity > 70) {
          emitPotholeUpdate('new_pothole', cluster);
        } else if (cluster) {
          emitPotholeUpdate('pothole_updated', cluster);
        }
      } catch (error) {
        console.error('WebSocket emit error:', error);
      }
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
};
