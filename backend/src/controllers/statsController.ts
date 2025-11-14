import { Request, Response } from 'express';
import { Pothole } from '../models/Pothole.model';

export const getStats = async (req: Request, res: Response) => {
  try {
    const total = await Pothole.countDocuments();
    const resolved = await Pothole.countDocuments({ status: 'resolved' });
    const highSeverity = await Pothole.countDocuments({ severity: { $gte: 70 } });

    // Average resolution time
    const resolvedPotholes = await Pothole.find({
      status: 'resolved',
      resolvedAt: { $exists: true },
    });

    let totalDays = 0;
    resolvedPotholes.forEach((p) => {
      const days =
        (p.resolvedAt!.getTime() - p.firstReported.getTime()) /
        (1000 * 60 * 60 * 24);
      totalDays += days;
    });

    const avgResolutionTime =
      resolvedPotholes.length > 0
        ? Math.round(totalDays / resolvedPotholes.length)
        : 0;

    // Fixed this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const fixedThisMonth = await Pothole.countDocuments({
      status: 'resolved',
      resolvedAt: { $gte: startOfMonth },
    });

    res.json({
      success: true,
      stats: {
        total,
        resolved,
        highSeverity,
        fixedThisMonth,
        avgResolutionTime,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTrends = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Aggregate by day
    const reported = await Pothole.aggregate([
      {
        $match: {
          firstReported: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$firstReported' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const fixed = await Pothole.aggregate([
      {
        $match: {
          status: 'resolved',
          resolvedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$resolvedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      trends: {
        reported,
        fixed,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
