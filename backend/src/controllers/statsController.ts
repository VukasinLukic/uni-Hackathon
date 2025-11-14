import { Request, Response } from 'express';

export const getStats = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented yet' });
};

export const getTrends = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented yet' });
};
