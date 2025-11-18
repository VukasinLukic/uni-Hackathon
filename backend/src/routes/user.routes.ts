import express from 'express';
import { checkJwt, getOrCreateUser } from '../middleware/auth0.middleware';
import { User } from '../models/User.model';

const router = express.Router();

// POST /api/users/signup - Signup with username and license plate
router.post('/signup', async (req, res) => {
  try {
    const { username, licensePlate } = req.body;

    if (!username || !licensePlate) {
      return res.status(400).json({ success: false, message: 'Username and license plate required' });
    }

    // Check if license plate already exists
    const existingUser = await User.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'License plate already registered' });
    }

    // Generate random avatar number 1-22 (pixel art avatars)
    const randomAvatar = Math.floor(Math.random() * 22) + 1;

    // Create unique email using timestamp
    const uniqueEmail = `${licensePlate.toUpperCase()}-${Date.now()}@pavepatrol.app`;

    const user = await User.create({
      username: username,
      licensePlate: licensePlate.toUpperCase(),
      email: uniqueEmail,
      auth0Id: `license-${licensePlate.toUpperCase()}-${Date.now()}`, // Generate unique auth0Id for license plate users
      name: username,
      role: 'driver',
      avatarNumber: randomAvatar,
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        licensePlate: user.licensePlate,
        name: user.name,
        avatarNumber: user.avatarNumber,
        level: user.level,
        currentXP: user.currentXP,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/leaderboard - Get top users by XP
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topUsers = await User.find()
      .sort({ totalXP: -1, currentXP: -1 })
      .limit(limit)
      .select('username name avatarNumber totalXP currentXP level licensePlate')
      .lean();

    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.username || user.name,
      points: user.totalXP || user.currentXP || 0,
      avatar: user.avatarNumber || 1,
      level: user.level || 1,
      licensePlate: user.licensePlate,
    }));

    res.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

// POST /api/users/login-plate - Login with username and license plate
router.post('/login-plate', async (req, res) => {
  try {
    const { username, licensePlate } = req.body;

    if (!licensePlate) {
      return res.status(400).json({ success: false, message: 'License plate required' });
    }

    // Find user by license plate
    const user = await User.findOne({ licensePlate: licensePlate.toUpperCase() });

    if (!user) {
      return res.status(400).json({ success: false, message: 'License plate not found. Please sign up first.' });
    }

    // If username is provided, verify it matches
    if (username && user.username !== username) {
      return res.status(400).json({ success: false, message: 'Incorrect username for this license plate' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        licensePlate: user.licensePlate,
        name: user.name,
        avatarNumber: user.avatarNumber,
        level: user.level,
        currentXP: user.currentXP,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/profile - Get current user's profile (web - Auth0 required)
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

    // Validate avatarNumber (now supports 1-22 for pixel art avatars)
    if (avatarNumber && (avatarNumber < 1 || avatarNumber > 22)) {
      return res.status(400).json({
        success: false,
        error: 'Avatar number must be between 1 and 22',
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

// GET /api/users/profile/:userId - Get user profile by ID (mobile - no auth required)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        auth0Id: user.auth0Id,
        email: user.email,
        username: user.username,
        licensePlate: user.licensePlate,
        name: user.name,
        bio: user.bio,
        phone: user.phone,
        avatarNumber: user.avatarNumber || 1,
        avatarUrl: user.avatarUrl,
        role: user.role,
        level: user.level,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile/:userId - Update user profile by ID (mobile - no auth required)
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, bio, phone, avatarNumber } = req.body;

    // Validate avatarNumber (now supports 1-22 for pixel art avatars)
    if (avatarNumber && (avatarNumber < 1 || avatarNumber > 22)) {
      return res.status(400).json({
        success: false,
        error: 'Avatar number must be between 1 and 22',
      });
    }

    // Update user
    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (avatarNumber !== undefined) updateFields.avatarNumber = avatarNumber;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        auth0Id: updatedUser.auth0Id,
        email: updatedUser.email,
        username: updatedUser.username,
        licensePlate: updatedUser.licensePlate,
        name: updatedUser.name,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        avatarNumber: updatedUser.avatarNumber,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        level: updatedUser.level,
        currentXP: updatedUser.currentXP,
        totalXP: updatedUser.totalXP,
        stats: updatedUser.stats,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /api/users/:userId/xp - Add XP to user (for token collection)
router.post('/:userId/xp', async (req, res) => {
  try {
    const { userId } = req.params;
    const { xp, reason } = req.body;

    if (!xp || xp <= 0) {
      return res.status(400).json({
        success: false,
        error: 'XP must be a positive number',
      });
    }

    // Find user by username (userId is actually username in mobile app)
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add XP
    user.currentXP = (user.currentXP || 0) + xp;
    user.totalXP = (user.totalXP || 0) + xp;

    // Check for level up (100 XP per level)
    const newLevel = Math.floor(user.currentXP / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      console.log(`🎉 User ${user.username} leveled up to level ${newLevel}!`);
    }

    await user.save();

    console.log(`✅ Added ${xp} XP to ${user.username}. Reason: ${reason || 'None'}`);

    res.json({
      success: true,
      message: `Added ${xp} XP`,
      user: {
        id: user._id,
        username: user.username,
        currentXP: user.currentXP,
        totalXP: user.totalXP,
        level: user.level,
      },
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ success: false, error: 'Failed to add XP' });
  }
});

export default router;
