import express from 'express';
import { checkJwt, getOrCreateUser } from '../middleware/auth0.middleware';
import { User } from '../models/User.model';

const router = express.Router();

// GET /api/users/profile - Get current user's profile
router.get('/profile', checkJwt, getOrCreateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        auth0Id: req.user.auth0Id,
        email: req.user.email,
        username: req.user.username,
        name: req.user.name,
        bio: req.user.bio,
        phone: req.user.phone,
        avatarNumber: req.user.avatarNumber || 1,
        avatarUrl: req.user.avatarUrl,
        role: req.user.role,
        level: req.user.level,
        currentXP: req.user.currentXP,
        totalXP: req.user.totalXP,
        stats: req.user.stats,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update current user's profile
router.put('/profile', checkJwt, getOrCreateUser, async (req, res) => {
  try {
    const { name, bio, phone, avatarNumber } = req.body;

    // Validate avatarNumber
    if (avatarNumber && (avatarNumber < 1 || avatarNumber > 5)) {
      return res.status(400).json({
        success: false,
        error: 'Avatar number must be between 1 and 5',
      });
    }

    // Update user
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (avatarNumber !== undefined) updateFields.avatarNumber = avatarNumber;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser!._id,
        auth0Id: updatedUser!.auth0Id,
        email: updatedUser!.email,
        username: updatedUser!.username,
        name: updatedUser!.name,
        bio: updatedUser!.bio,
        phone: updatedUser!.phone,
        avatarNumber: updatedUser!.avatarNumber,
        avatarUrl: updatedUser!.avatarUrl,
        role: updatedUser!.role,
        level: updatedUser!.level,
        currentXP: updatedUser!.currentXP,
        totalXP: updatedUser!.totalXP,
        stats: updatedUser!.stats,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// GET /api/users/stats - Get current user's stats
router.get('/stats', checkJwt, getOrCreateUser, async (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        level: req.user.level,
        currentXP: req.user.currentXP,
        totalXP: req.user.totalXP,
        ...req.user.stats,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

export default router;
