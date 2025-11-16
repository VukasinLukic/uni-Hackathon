import { DriveSession, IDriveSession } from '../models/DriveSession.model';
import { User } from '../models/User.model';
import { XPService } from './xpService';
import { ExplorationService } from './explorationService';
import { AchievementService } from './achievementService';
import mongoose from 'mongoose';

export class DriveSessionService {
  /**
   * Start a new drive session
   */
  static async startSession(userId: string | mongoose.Types.ObjectId): Promise<IDriveSession> {
    // Check if user has an active session
    const activeSession = await DriveSession.findOne({ userId, active: true });
    if (activeSession) {
      throw new Error('User already has an active drive session');
    }

    const session = await DriveSession.create({
      userId,
      startTime: new Date(),
      active: true,
      distanceDriven: 0,
      potholesDetected: 0,
      cellsExplored: 0,
      xpEarned: 0,
      route: {
        type: 'LineString',
        coordinates: [],
      },
    });

    return session;
  }

  /**
   * Update drive session with new location
   * Tracks route, distance, and new cells explored
   */
  static async updateSession(
    sessionId: string | mongoose.Types.ObjectId,
    location: { lat: number; lng: number }
  ): Promise<{
    session: IDriveSession;
    newCell: boolean;
    cellId?: string;
    xpAwarded: number;
  }> {
    const session = await DriveSession.findById(sessionId);
    if (!session) {
      throw new Error('Drive session not found');
    }

    if (!session.active) {
      throw new Error('Drive session is not active');
    }

    // Add location to route
    const coordinates: [number, number] = [location.lng, location.lat];
    session.route.coordinates.push(coordinates);

    // Calculate distance if we have at least 2 points
    if (session.route.coordinates.length >= 2) {
      const prevCoords = session.route.coordinates[session.route.coordinates.length - 2];
      const distance = this.calculateDistance(
        prevCoords[1],
        prevCoords[0],
        location.lat,
        location.lng
      );
      session.distanceDriven += distance;
    }

    // Check if new cell explored
    const cellResult = await ExplorationService.exploreCell(
      session.userId,
      location.lat,
      location.lng,
      session._id as mongoose.Types.ObjectId
    );

    let xpAwarded = 0;
    if (cellResult.isNewCell) {
      session.cellsExplored += 1;
      session.xpEarned += cellResult.xpAwarded;
      xpAwarded = cellResult.xpAwarded;
    }

    await session.save();

    return {
      session,
      newCell: cellResult.isNewCell,
      cellId: cellResult.cellId,
      xpAwarded,
    };
  }

  /**
   * End drive session
   * Calculates final stats and awards XP
   */
  static async endSession(
    sessionId: string | mongoose.Types.ObjectId
  ): Promise<{
    session: IDriveSession;
    summary: {
      duration: number;
      distanceKm: number;
      cellsExplored: number;
      potholesDetected: number;
      totalXP: number;
      newAchievements: number;
    };
  }> {
    const session = await DriveSession.findById(sessionId);
    if (!session) {
      throw new Error('Drive session not found');
    }

    if (!session.active) {
      throw new Error('Drive session already ended');
    }

    // Mark session as ended
    session.endTime = new Date();
    session.active = false;

    // Calculate duration in seconds
    session.duration = Math.floor(
      (session.endTime.getTime() - session.startTime.getTime()) / 1000
    );

    // Calculate distance-based XP (10 XP per km)
    const distanceKm = session.distanceDriven / 1000;
    const distanceXP = Math.floor(distanceKm * 10);

    // Award distance XP
    if (distanceXP > 0) {
      await XPService.awardXPForAction(session.userId, 'drive_km', {
        amount: distanceKm,
      });
      session.xpEarned += distanceXP;
    }

    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(session.userId, {
      $inc: {
        'stats.distanceDriven': distanceKm,
      },
    });

    // Check for newly unlocked achievements
    const newAchievements = await AchievementService.checkAndUnlockAchievements(
      session.userId
    );

    return {
      session,
      summary: {
        duration: session.duration,
        distanceKm: Math.round(distanceKm * 100) / 100,
        cellsExplored: session.cellsExplored,
        potholesDetected: session.potholesDetected,
        totalXP: session.xpEarned,
        newAchievements: newAchievements.length,
      },
    };
  }

  /**
   * Get active session for user
   */
  static async getActiveSession(
    userId: string | mongoose.Types.ObjectId
  ): Promise<IDriveSession | null> {
    return DriveSession.findOne({ userId, active: true });
  }

  /**
   * Get user's drive history
   */
  static async getDriveHistory(
    userId: string | mongoose.Types.ObjectId,
    limit: number = 20
  ): Promise<IDriveSession[]> {
    return DriveSession.find({ userId, active: false })
      .sort({ startTime: -1 })
      .limit(limit);
  }

  /**
   * Get drive session statistics
   */
  static async getDriveStats(userId: string | mongoose.Types.ObjectId): Promise<{
    totalDrives: number;
    totalDistance: number;
    totalDuration: number;
    totalXP: number;
    averageDistance: number;
    averageDuration: number;
  }> {
    const sessions = await DriveSession.find({ userId, active: false });

    const totalDrives = sessions.length;
    const totalDistance = sessions.reduce((sum, s) => sum + s.distanceDriven, 0) / 1000; // km
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0); // seconds
    const totalXP = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

    return {
      totalDrives,
      totalDistance: Math.round(totalDistance * 100) / 100,
      totalDuration,
      totalXP,
      averageDistance:
        totalDrives > 0 ? Math.round((totalDistance / totalDrives) * 100) / 100 : 0,
      averageDuration:
        totalDrives > 0 ? Math.round(totalDuration / totalDrives) : 0,
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  private static calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
