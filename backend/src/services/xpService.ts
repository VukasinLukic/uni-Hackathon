import { User, IUser } from '../models/User.model';
import { Reward } from '../models/Reward.model';
import mongoose from 'mongoose';
import { emitLevelUp } from '../websocket/socketHandler';

export interface XPAwardResult {
  success: boolean;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  newXP: number;
  newTotalXP: number;
  xpToNextLevel?: number;
}

export class XPService {
  /**
   * Calculate XP required for a specific level
   * Formula: 100 × 1.5^(level-1)
   *
   * Level 1: 100 XP
   * Level 2: 150 XP
   * Level 3: 225 XP
   * Level 4: 337 XP
   * Level 5: 506 XP
   * Level 10: 3,844 XP
   * Level 20: 478,630 XP
   */
  static calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  /**
   * Calculate total XP needed to reach a level from level 1
   */
  static calculateTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += this.calculateXPForLevel(i);
    }
    return total;
  }

  /**
   * Calculate level from total XP
   */
  static calculateLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpSum = 0;

    while (xpSum + this.calculateXPForLevel(level) <= totalXP) {
      xpSum += this.calculateXPForLevel(level);
      level++;
    }

    return level;
  }

  /**
   * Calculate current XP progress toward next level
   */
  static calculateCurrentXP(totalXP: number, level: number): number {
    const xpForPreviousLevels = this.calculateTotalXPForLevel(level);
    return totalXP - xpForPreviousLevels;
  }

  /**
   * Award XP to a user
   * Handles level ups automatically
   * Returns level up information
   */
  static async awardXP(
    userId: string | mongoose.Types.ObjectId,
    xpAmount: number,
    source: string
  ): Promise<XPAwardResult> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Add XP to user's totals
      const oldLevel = user.level;
      const oldTotalXP = user.totalXP;

      user.totalXP += xpAmount;

      // Calculate new level based on total XP
      const newLevel = this.calculateLevelFromXP(user.totalXP);
      const leveledUp = newLevel > oldLevel;

      // Update user level and current XP
      user.level = newLevel;
      user.currentXP = this.calculateCurrentXP(user.totalXP, newLevel);

      await user.save();

      // Emit Socket.IO event if user leveled up
      if (leveledUp) {
        emitLevelUp((user._id as any).toString(), {
          newLevel,
          currentXP: user.currentXP,
          totalXP: user.totalXP,
          xpForNextLevel: this.calculateXPForLevel(newLevel),
        });
      }

      // Create reward record for XP transaction
      await Reward.create({
        userId: (user._id as any),
        type: 'daily',
        title: `+${xpAmount} XP`,
        description: source,
        xpAmount,
        source,
      });

      const xpToNextLevel = this.calculateXPForLevel(newLevel);

      return {
        success: true,
        xpAwarded: xpAmount,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined,
        newXP: user.currentXP,
        newTotalXP: user.totalXP,
        xpToNextLevel,
      };
    } catch (error: any) {
      console.error('XP award error:', error);
      throw error;
    }
  }

  /**
   * Get user's XP and level information
   */
  static async getUserXPInfo(userId: string | mongoose.Types.ObjectId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const xpForNextLevel = this.calculateXPForLevel(user.level);
    const xpProgress = (user.currentXP / xpForNextLevel) * 100;

    return {
      level: user.level,
      currentXP: user.currentXP,
      totalXP: user.totalXP,
      xpForNextLevel,
      xpProgress: Math.round(xpProgress * 10) / 10, // Round to 1 decimal
      xpRemaining: xpForNextLevel - user.currentXP,
    };
  }

  /**
   * Award XP for different actions
   */
  static async awardXPForAction(
    userId: string | mongoose.Types.ObjectId,
    action: 'drive_km' | 'explore_cell' | 'detect_pothole' | 'verify_pothole' | 'achievement',
    metadata?: { amount?: number; achievementName?: string }
  ): Promise<XPAwardResult> {
    let xpAmount = 0;
    let source = '';

    switch (action) {
      case 'drive_km':
        xpAmount = (metadata?.amount || 1) * 10; // 10 XP per km
        source = `Drove ${metadata?.amount || 1} km`;
        break;

      case 'explore_cell':
        xpAmount = 50; // 50 XP per new cell explored
        source = 'Explored new area';
        break;

      case 'detect_pothole':
        xpAmount = 20; // 20 XP for detecting a pothole (pending verification)
        source = 'Detected pothole';
        break;

      case 'verify_pothole':
        xpAmount = 100; // 100 XP for verified pothole
        source = 'Pothole verified';
        break;

      case 'achievement':
        xpAmount = metadata?.amount || 100;
        source = `Achievement: ${metadata?.achievementName || 'Unlocked'}`;
        break;

      default:
        throw new Error('Unknown action type');
    }

    return this.awardXP(userId, xpAmount, source);
  }
}
