import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { verifyAccessToken } from '../config/jwt';

/**
 * JWT Authentication Middleware
 * Verifies access token and attaches user info to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach userId to request
    (req as any).userId = payload.userId;
    (req as any).userEmail = payload.email;
    (req as any).username = payload.username;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Role-based Authorization Middleware
 * Requires authenticate middleware to be used first
 */
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
      }

      const user = await User.findById(userId);

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden - insufficient permissions',
        });
      }

      (req as any).user = user;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Auth error',
      });
    }
  };
};
