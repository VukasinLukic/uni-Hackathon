import { Request, Response } from 'express';
import { DriveSessionService } from '../services/driveSessionService';

/**
 * POST /api/drives/start
 * Start a new drive session
 */
export const startDrive = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const session = await DriveSessionService.startSession(userId);

    res.json({
      success: true,
      session: {
        id: session._id,
        startTime: session.startTime,
        active: session.active,
      },
    });
  } catch (error: any) {
    console.error('Start drive error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/drives/:sessionId/update
 * Update drive session with new location
 */
export const updateDrive = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const result = await DriveSessionService.updateSession(sessionId, { lat, lng });

    res.json({
      success: true,
      newCell: result.newCell,
      cellId: result.cellId,
      xpAwarded: result.xpAwarded,
      distance: result.session.distanceDriven,
      cellsExplored: result.session.cellsExplored,
    });
  } catch (error: any) {
    console.error('Update drive error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/drives/:sessionId/end
 * End drive session
 */
export const endDrive = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const result = await DriveSessionService.endSession(sessionId);

    res.json({
      success: true,
      summary: result.summary,
      session: {
        id: result.session._id,
        startTime: result.session.startTime,
        endTime: result.session.endTime,
        duration: result.session.duration,
        distanceDriven: result.session.distanceDriven,
        cellsExplored: result.session.cellsExplored,
        potholesDetected: result.session.potholesDetected,
        xpEarned: result.session.xpEarned,
      },
    });
  } catch (error: any) {
    console.error('End drive error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/drives/active
 * Get user's active drive session
 */
export const getActiveDrive = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const session = await DriveSessionService.getActiveSession(userId);

    if (!session) {
      return res.json({
        success: true,
        session: null,
      });
    }

    res.json({
      success: true,
      session: {
        id: session._id,
        startTime: session.startTime,
        distanceDriven: session.distanceDriven,
        cellsExplored: session.cellsExplored,
        potholesDetected: session.potholesDetected,
        xpEarned: session.xpEarned,
        active: session.active,
      },
    });
  } catch (error: any) {
    console.error('Get active drive error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/drives/history
 * Get user's drive history
 */
export const getDriveHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;

    const sessions = await DriveSessionService.getDriveHistory(userId, limit);

    res.json({
      success: true,
      count: sessions.length,
      sessions: sessions.map((s) => ({
        id: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        distanceDriven: s.distanceDriven,
        cellsExplored: s.cellsExplored,
        potholesDetected: s.potholesDetected,
        xpEarned: s.xpEarned,
      })),
    });
  } catch (error: any) {
    console.error('Get drive history error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * GET /api/drives/stats
 * Get drive statistics
 */
export const getDriveStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const stats = await DriveSessionService.getDriveStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Get drive stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
