import { Router } from 'express';
import {
  register,
  login,
  refresh,
  getMe,
  auth0Callback,
  auth0Verify,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (email/password)
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (email/password)
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refresh);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires JWT)
 */
router.get('/me', authenticate, getMe);

/**
 * @route   POST /api/auth/auth0/callback
 * @desc    Handle Auth0 authentication (social login)
 * @access  Public
 * @body    Authorization header with Auth0 token
 */
router.post('/auth0/callback', auth0Callback);

/**
 * @route   POST /api/auth/auth0/verify
 * @desc    Verify Auth0 token
 * @access  Public
 */
router.post('/auth0/verify', auth0Verify);

export default router;
