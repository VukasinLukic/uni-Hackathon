import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth0Id = (req as any).auth?.sub;

      if (!auth0Id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findOne({ auth0Id });

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Auth error' });
    }
  };
};
