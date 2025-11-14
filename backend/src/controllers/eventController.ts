import { Request, Response } from 'express';

export const createEvent = async (req: Request, res: Response) => {
  try {
    res.status(501).json({ message: 'Not implemented yet' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
