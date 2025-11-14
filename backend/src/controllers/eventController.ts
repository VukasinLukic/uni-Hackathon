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
      event.clusterId = cluster._id as any;
      await event.save();
    } else {
      // Create new cluster
      cluster = await clusteringService.createNewCluster(event);
      event.clusterId = cluster._id as any;
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
