import { Request, Response } from 'express';
import { ExplorationService } from '../services/explorationService';

/**
 * GET /api/exploration/cells
 * Get user's explored cells
 */
export const getMyCells = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const cells = await ExplorationService.getUserCells(userId);

    res.json({
      success: true,
      count: cells.length,
      cells,
    });
  } catch (error: any) {
    console.error('Get cells error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/exploration/stats
 * Get exploration statistics
 */
export const getMyStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const stats = await ExplorationService.getExplorationStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/exploration/geojson
 * Get cells as GeoJSON for map overlay
 */
export const getCellsGeoJSON = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const geojson = await ExplorationService.getCellsGeoJSON(userId);

    res.json(geojson);
  } catch (error: any) {
    console.error('Get GeoJSON error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/exploration/heatmap
 * Get heatmap data for exploration visualization
 */
export const getHeatmap = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const heatmapData = await ExplorationService.getExplorationHeatmap(userId);

    res.json({
      success: true,
      data: heatmapData,
    });
  } catch (error: any) {
    console.error('Get heatmap error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/exploration/explore
 * Manually record a cell exploration (for testing)
 */
export const exploreCell = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const result = await ExplorationService.exploreCell(userId, lat, lng);

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Explore cell error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
