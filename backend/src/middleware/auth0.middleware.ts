import { Request, Response, NextFunction } from 'express';
import { expressjwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { User } from '../models/User.model';

// Extend Express Request to include auth0 user info
declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string; // Auth0 user ID
        [key: string]: any;
      };
      user?: any; // MongoDB user document
    }
  }
}

// Auth0 JWT verification middleware
export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

// Middleware to get or create user from Auth0 token
export const getOrCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth?.sub) {
      return res.status(401).json({ error: 'No Auth0 user ID found' });
    }

    const auth0Id = req.auth.sub;

    // Try to find existing user
    let user = await User.findOne({ auth0Id });

    // If user doesn't exist, create one
    if (!user) {
      const email = req.auth['https://api.roadsense.com/email'] || req.auth.email || `user-${auth0Id}@roadsense.com`;
      const name = req.auth['https://api.roadsense.com/name'] || req.auth.name || email.split('@')[0];

      user = await User.create({
        auth0Id,
        email,
        username: email.split('@')[0], // Use email prefix as username
        name,
        avatarNumber: 1, // Default avatar
        role: 'driver',
      });

      console.log(`✅ Created new user for Auth0 ID: ${auth0Id}`);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error in getOrCreateUser middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
