import { Request, Response } from 'express';
import { Pothole } from '../models/Pothole.model';
import { emitPotholeUpdate } from '../websocket/socketHandler';

export const getAllPotholes = async (req: Request, res: Response) => {
  try {
    const {
      severity,
      status,
      limit = 100,
      minSeverity,
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (minSeverity) query.severity = { $gte: Number(minSeverity) };

    const potholes = await Pothole.find(query)
      .sort({ severity: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: potholes.length,
      potholes,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPotholeById = async (req: Request, res: Response) => {
  try {
    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({ error: 'Pothole not found' });
    }

    res.json({ success: true, pothole });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePotholeStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;

    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({ error: 'Pothole not found' });
    }

    pothole.status = status;
    if (notes) pothole.notes = notes;
    if (status === 'resolved') pothole.resolvedAt = new Date();

    await pothole.save();

    // Emit update
    emitPotholeUpdate('pothole_updated', pothole);

    res.json({ success: true, pothole });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPotholesNearby = async (req: Request, res: Response) => {
  try {
    const { lng, lat, radius = 1000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const potholes = await Pothole.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius),
        },
      },
      status: { $ne: 'resolved' },
    }).limit(50);

    res.json({ success: true, count: potholes.length, potholes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
