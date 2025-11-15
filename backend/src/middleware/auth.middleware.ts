import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { verifyAccessToken } from '../config/jwt';
import { Auth0Service } from '../services/auth0Service';

/**
 * Hybrid Authentication Middleware
 * Supports both custom JWT tokens and Auth0 tokens
 *
 * Priority:
 * 1. Try to verify as Auth0 token
 * 2. If fails, try to verify as custom JWT token
 * 3. If both fail, return 401
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

    // Try Auth0 token first
    try {
      const auth0Payload = await Auth0Service.verifyAuth0Token(token);

      // Find user by Auth0 ID
      const user = await User.findOne({ auth0Id: auth0Payload.sub });

      if (user) {
        (req as any).userId = (user._id as any).toString();
        (req as any).userEmail = user.email;
        (req as any).username = user.username;
        (req as any).authType = 'auth0';
        return next();
      } else {
        // User doesn't exist in our DB yet
        return res.status(401).json({
          success: false,
          error: 'User not found. Please complete authentication via /api/auth/auth0/callback',
        });
      }
    } catch (auth0Error) {
      // Auth0 verification failed, try custom JWT
      try {
        const payload = verifyAccessToken(token);

        // Attach userId to request
        (req as any).userId = payload.userId;
        (req as any).userEmail = payload.email;
        (req as any).username = payload.username;
        (req as any).authType = 'custom';

        next();
      } catch (jwtError) {
        // Both Auth0 and custom JWT failed
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
      }
    }
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Authentication error',
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
