import { Pothole, IPothole } from '../models/Pothole.model';
import { IEvent } from '../models/Event.model';

const CLUSTERING_RADIUS = 3; // meters

export class ClusteringService {
  /**
   * Find nearby pothole cluster within specified radius
   * Uses MongoDB geospatial query with 2dsphere index
   */
  async findNearbyCluster(
    coordinates: [number, number],
    maxDistance: number = CLUSTERING_RADIUS
  ): Promise<IPothole | null> {
    try {
      // Add timeout to geospatial query (max 5 seconds)
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
        status: { $ne: 'resolved' }, // Don't cluster with resolved potholes
      }).maxTimeMS(5000); // 5 second timeout for query

      return cluster;
    } catch (error: any) {
      // If query times out or fails, just create new cluster
      console.warn('findNearbyCluster error (creating new cluster):', error.message);
      return null;
    }
  }

  /**
   * Create new pothole cluster from first event
   */
  async createNewCluster(event: IEvent): Promise<IPothole> {
    const newCluster = new Pothole({
      location: {
        type: 'Point',
        coordinates: event.location.coordinates,
      },
      severity: 0, // Will be calculated by SeverityService
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

  /**
   * Add event to existing cluster and update statistics
   */
  async addEventToCluster(cluster: IPothole, event: IEvent): Promise<IPothole> {
    // Update unique users count
    if (!cluster.uniqueUsers.includes(event.userId)) {
      cluster.uniqueUsers.push(event.userId);
      cluster.reports = cluster.uniqueUsers.length;
    }

    // Update impact data (running average)
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
