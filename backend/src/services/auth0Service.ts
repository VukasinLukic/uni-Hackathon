// @ts-nocheck
import { ManagementClient, AuthenticationClient } from 'auth0';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { User, IUser } from '../models/User.model';
import { generateAccessToken, generateRefreshToken } from '../config/jwt';

const auth0Domain = process.env.AUTH0_DOMAIN!;
const auth0Audience = process.env.AUTH0_AUDIENCE!;

// JWKS client for verifying Auth0 tokens
const client = jwksClient({
  jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

const getKey = (header: any, callback: any) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

export interface Auth0TokenPayload {
  sub: string; // Auth0 user ID (e.g., "auth0|123456" or "google-oauth2|123456")
  email: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  aud: string | string[];
  iss: string;
  iat: number;
  exp: number;
}

export class Auth0Service {
  /**
   * Verify Auth0 JWT token
   */
  static async verifyAuth0Token(token: string): Promise<Auth0TokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          audience: auth0Audience,
          issuer: `https://${auth0Domain}/`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as Auth0TokenPayload);
          }
        }
      );
    });
  }

  /**
   * Get or create user from Auth0 token
   * Syncs Auth0 user data with our database
   */
  static async getOrCreateUserFromAuth0(
    auth0Payload: Auth0TokenPayload
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
  }> {
    const auth0Id = auth0Payload.sub;
    const email = auth0Payload.email;
    const name = auth0Payload.name || auth0Payload.nickname || email.split('@')[0];
    const avatarUrl = auth0Payload.picture;

    // Check if user exists by Auth0 ID
    let user = await User.findOne({ auth0Id });

    let isNewUser = false;

    if (!user) {
      // Check if user exists by email (for migration from custom auth)
      user = await User.findOne({ email });

      if (user) {
        // Update existing user with Auth0 ID
        user.auth0Id = auth0Id;
        if (avatarUrl && !user.avatarUrl) {
          user.avatarUrl = avatarUrl;
        }
        await user.save();
      } else {
        // Create new user
        isNewUser = true;
        user = await User.create({
          email,
          username: name,
          auth0Id,
          avatarUrl,
          // No password for Auth0 users
          role: 'user',
        });
      }
    } else {
      // Update user info from Auth0
      let updated = false;

      if (avatarUrl && avatarUrl !== user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }

      if (updated) {
        await user.save();
      }
    }

    // Generate our own JWT tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
      isNewUser,
    };
  }

  /**
   * Extract provider from Auth0 sub (e.g., "google-oauth2|123" -> "google")
   */
  static extractProvider(auth0Sub: string): string {
    const parts = auth0Sub.split('|');
    if (parts.length < 2) return 'auth0';

    const provider = parts[0];
    if (provider === 'google-oauth2') return 'google';
    if (provider === 'facebook') return 'facebook';
    if (provider === 'github') return 'github';
    if (provider === 'twitter') return 'twitter';

    return provider;
  }
}
