import { Request, Response } from 'express';
import { User } from '../models/User.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  JWTPayload,
} from '../config/jwt';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, username, and password are required',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email or username already exists',
      });
    }

    // Create user
    const user = new User({
      email,
      username,
      password,
    });

    await user.save();

    // Generate tokens
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      success: true,
      user: {
        id: (user._id as any),
        email: user.email,
        username: user.username,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Login existing user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      username: user.username,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      user: {
        id: (user._id as any),
        email: user.email,
        username: user.username,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        stats: user.stats,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };

    const accessToken = generateAccessToken(newPayload);

    res.json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: (user._id as any),
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        stats: user.stats,
        settings: user.settings,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
