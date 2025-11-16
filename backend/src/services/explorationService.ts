import { ExplorationCell, IExplorationCell } from '../models/ExplorationCell.model';
import { User } from '../models/User.model';
import { XPService } from './xpService';
import { AchievementService } from './achievementService';
import mongoose from 'mongoose';

export class ExplorationService {
  /**
   * Calculate cell ID from coordinates
   * Uses 0.001 degrees (~100m) grid
   */
  static getCellId(lat: number, lng: number): string {
    const cellLat = Math.floor(lat / 0.001); // ~100m cells
    const cellLng = Math.floor(lng / 0.001);
    return `${cellLat}_${cellLng}`;
  }

  /**
   * Calculate cell bounds from cell ID
   */
  static getCellBounds(cellId: string): {
    north: number;
    south: number;
    east: number;
    west: number;
  } {
    const [latStr, lngStr] = cellId.split('_');
    const cellLat = parseInt(latStr);
    const cellLng = parseInt(lngStr);

    return {
      north: (cellLat + 1) * 0.001,
      south: cellLat * 0.001,
      east: (cellLng + 1) * 0.001,
      west: cellLng * 0.001,
    };
  }

  /**
   * Calculate center coordinates from cell ID
   */
  static getCellCenter(cellId: string): { lat: number; lng: number } {
    const bounds = this.getCellBounds(cellId);
    return {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2,
    };
  }

  /**
   * Record cell exploration
   * Awards XP if it's a new cell for the user
   */
  static async exploreCell(
    userId: string | mongoose.Types.ObjectId,
    lat: number,
    lng: number,
    driveSessionId?: mongoose.Types.ObjectId
  ): Promise<{
    isNewCell: boolean;
    cellId: string;
    xpAwarded: number;
    cell: IExplorationCell | null;
  }> {
    const cellId = this.getCellId(lat, lng);
    const center = this.getCellCenter(cellId);

    // Check if cell already explored by user
    let cell = await ExplorationCell.findOne({ userId, cellId });

    let isNewCell = false;
    let xpAwarded = 0;

    if (!cell) {
      // New cell - create and award XP
      cell = await ExplorationCell.create({
        cellId,
        userId,
        location: {
          type: 'Point',
          coordinates: [center.lng, center.lat],
        },
        radius: 100,
        exploredAt: new Date(),
        driveSessionId,
        xpAwarded: 50,
      });

      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.cellsExplored': 1 },
      });

      // Award XP for exploring new cell
      await XPService.awardXPForAction(userId, 'explore_cell');
      xpAwarded = 50;

      // Check achievements
      await AchievementService.checkAndUnlockAchievements(userId);

      isNewCell = true;
    }

    return {
      isNewCell,
      cellId,
      xpAwarded,
      cell,
    };
  }

  /**
   * Get user's explored cells
   */
  static async getUserCells(
    userId: string | mongoose.Types.ObjectId
  ): Promise<IExplorationCell[]> {
    return ExplorationCell.find({ userId }).sort({ exploredAt: -1 });
  }

  /**
   * Get exploration stats for user
   */
  static async getExplorationStats(userId: string | mongoose.Types.ObjectId): Promise<{
    totalCells: number;
    explorationPercentage: number;
    recentCells: IExplorationCell[];
    totalXPFromExploration: number;
  }> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const recentCells = await ExplorationCell.find({ userId })
      .sort({ exploredAt: -1 })
      .limit(10);

    const totalCells = user.stats.cellsExplored;

    // Calculate exploration percentage (based on city size)
    // For demo, assume city has 10,000 cells total
    const totalCityCells = 10000;
    const explorationPercentage = Math.min(
      (totalCells / totalCityCells) * 100,
      100
    );

    // Calculate total XP earned from exploration
    const allCells = await ExplorationCell.find({ userId });
    const totalXPFromExploration = allCells.reduce(
      (sum, cell) => sum + cell.xpAwarded,
      0
    );

    return {
      totalCells,
      explorationPercentage: Math.round(explorationPercentage * 10) / 10,
      recentCells,
      totalXPFromExploration,
    };
  }

  /**
   * Get cells for map overlay (GeoJSON format)
   */
  static async getCellsGeoJSON(userId: string | mongoose.Types.ObjectId): Promise<any> {
    const cells = await this.getUserCells(userId);

    return {
      type: 'FeatureCollection',
      features: cells.map((cell) => {
        const bounds = this.getCellBounds(cell.cellId);
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [bounds.west, bounds.south],
                [bounds.east, bounds.south],
                [bounds.east, bounds.north],
                [bounds.west, bounds.north],
                [bounds.west, bounds.south],
              ],
            ],
          },
          properties: {
            cellId: cell.cellId,
            exploredAt: cell.exploredAt,
            xpAwarded: cell.xpAwarded,
          },
        };
      }),
    };
  }

  /**
   * Get exploration heatmap data
   */
  static async getExplorationHeatmap(
    userId: string | mongoose.Types.ObjectId
  ): Promise<Array<{ lat: number; lng: number; weight: number }>> {
    const cells = await ExplorationCell.find({ userId });

    return cells.map((cell) => ({
      lat: cell.location.coordinates[1],
      lng: cell.location.coordinates[0],
      weight: 1, // Can be adjusted based on exploration frequency
    }));
  }
}
