import { Achievement, IAchievement } from '../models/Achievement.model';
import { User } from '../models/User.model';
import { XPService } from './xpService';
import { emitAchievementUnlocked } from '../websocket/socketHandler';
import mongoose from 'mongoose';

export interface AchievementDefinition {
  id: string;
  type: 'distance' | 'reports' | 'exploration' | 'streak' | 'special';
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  requirement: {
    stat: 'distanceDriven' | 'potholesDetected' | 'cellsExplored' | 'explorationPercentage' | 'totalReports' | 'confirmedPotholes';
    threshold: number;
  };
}

// Base achievements definition (15-20 achievements)
export const BASE_ACHIEVEMENTS: AchievementDefinition[] = [
  // Exploration achievements
  {
    id: 'first_steps',
    type: 'exploration',
    title: 'First Steps',
    description: 'Explore your first area',
    icon: '🗺️',
    xpReward: 50,
    requirement: { stat: 'cellsExplored', threshold: 1 },
  },
  {
    id: 'explorer',
    type: 'exploration',
    title: 'Explorer',
    description: 'Explore 10 different areas',
    icon: '🧭',
    xpReward: 200,
    requirement: { stat: 'cellsExplored', threshold: 10 },
  },
  {
    id: 'pathfinder',
    type: 'exploration',
    title: 'Pathfinder',
    description: 'Explore 50 different areas',
    icon: '🏔️',
    xpReward: 500,
    requirement: { stat: 'cellsExplored', threshold: 50 },
  },
  {
    id: 'cartographer',
    type: 'exploration',
    title: 'Cartographer',
    description: 'Explore 100 different areas',
    icon: '🗾',
    xpReward: 1000,
    requirement: { stat: 'cellsExplored', threshold: 100 },
  },
  {
    id: 'city_explorer',
    type: 'exploration',
    title: 'City Explorer',
    description: 'Explore 25% of the city',
    icon: '🏙️',
    xpReward: 1500,
    requirement: { stat: 'explorationPercentage', threshold: 25 },
  },
  {
    id: 'city_master',
    type: 'exploration',
    title: 'City Master',
    description: 'Explore 50% of the city',
    icon: '👑',
    xpReward: 3000,
    requirement: { stat: 'explorationPercentage', threshold: 50 },
  },

  // Detection achievements
  {
    id: 'first_find',
    type: 'reports',
    title: 'First Find',
    description: 'Detect your first pothole',
    icon: '🕳️',
    xpReward: 50,
    requirement: { stat: 'potholesDetected', threshold: 1 },
  },
  {
    id: 'spotter',
    type: 'reports',
    title: 'Spotter',
    description: 'Detect 10 potholes',
    icon: '👁️',
    xpReward: 200,
    requirement: { stat: 'potholesDetected', threshold: 10 },
  },
  {
    id: 'detective',
    type: 'reports',
    title: 'Detective',
    description: 'Detect 50 potholes',
    icon: '🔍',
    xpReward: 500,
    requirement: { stat: 'potholesDetected', threshold: 50 },
  },
  {
    id: 'road_guardian',
    type: 'reports',
    title: 'Road Guardian',
    description: 'Detect 200 potholes',
    icon: '🛡️',
    xpReward: 1500,
    requirement: { stat: 'potholesDetected', threshold: 200 },
  },
  {
    id: 'verified_reporter',
    type: 'reports',
    title: 'Verified Reporter',
    description: 'Have 10 confirmed potholes',
    icon: '✅',
    xpReward: 300,
    requirement: { stat: 'confirmedPotholes', threshold: 10 },
  },
  {
    id: 'trusted_source',
    type: 'reports',
    title: 'Trusted Source',
    description: 'Have 50 confirmed potholes',
    icon: '⭐',
    xpReward: 800,
    requirement: { stat: 'confirmedPotholes', threshold: 50 },
  },

  // Distance achievements
  {
    id: 'first_drive',
    type: 'distance',
    title: 'First Drive',
    description: 'Drive 1 km',
    icon: '🚗',
    xpReward: 50,
    requirement: { stat: 'distanceDriven', threshold: 1 },
  },
  {
    id: 'commuter',
    type: 'distance',
    title: 'Commuter',
    description: 'Drive 50 km',
    icon: '🛣️',
    xpReward: 300,
    requirement: { stat: 'distanceDriven', threshold: 50 },
  },
  {
    id: 'road_warrior',
    type: 'distance',
    title: 'Road Warrior',
    description: 'Drive 200 km',
    icon: '🏁',
    xpReward: 800,
    requirement: { stat: 'distanceDriven', threshold: 200 },
  },
  {
    id: 'marathon_driver',
    type: 'distance',
    title: 'Marathon Driver',
    description: 'Drive 500 km',
    icon: '🚀',
    xpReward: 2000,
    requirement: { stat: 'distanceDriven', threshold: 500 },
  },

  // Report count achievements
  {
    id: 'reporter',
    type: 'reports',
    title: 'Reporter',
    description: 'Submit 25 total reports',
    icon: '📝',
    xpReward: 250,
    requirement: { stat: 'totalReports', threshold: 25 },
  },
  {
    id: 'active_contributor',
    type: 'reports',
    title: 'Active Contributor',
    description: 'Submit 100 total reports',
    icon: '📊',
    xpReward: 750,
    requirement: { stat: 'totalReports', threshold: 100 },
  },
];

export class AchievementService {
  /**
   * Check user's progress for all achievements
   * Unlock any newly earned achievements
   */
  static async checkAndUnlockAchievements(userId: string | mongoose.Types.ObjectId): Promise<IAchievement[]> {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get all achievements already unlocked by this user
    const unlockedAchievements = await Achievement.find({ userId });
    const unlockedIds = unlockedAchievements.map(a => a.title); // Using title as ID since we don't have achievement ID field

    const newlyUnlocked: IAchievement[] = [];

    // Check each base achievement
    for (const achievementDef of BASE_ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedIds.includes(achievementDef.title)) {
        continue;
      }

      // Check if requirement is met
      const currentValue = user.stats[achievementDef.requirement.stat];
      if (currentValue >= achievementDef.requirement.threshold) {
        // Unlock achievement
        const newAchievement = await Achievement.create({
          userId: (user._id as any),
          type: achievementDef.type,
          title: achievementDef.title,
          description: achievementDef.description,
          icon: achievementDef.icon,
          xpReward: achievementDef.xpReward,
          progress: {
            current: currentValue,
            target: achievementDef.requirement.threshold,
          },
        });

        // Award XP for achievement
        await XPService.awardXPForAction(userId, 'achievement', {
          amount: achievementDef.xpReward,
          achievementName: achievementDef.title,
        });

        // Emit Socket.IO event
        emitAchievementUnlocked((user._id as any).toString(), {
          title: achievementDef.title,
          description: achievementDef.description,
          icon: achievementDef.icon,
          xpReward: achievementDef.xpReward,
        });

        newlyUnlocked.push(newAchievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get all unlocked achievements for a user
   */
  static async getUserAchievements(userId: string | mongoose.Types.ObjectId): Promise<IAchievement[]> {
    return Achievement.find({ userId }).sort({ unlockedAt: -1 });
  }

  /**
   * Get progress toward locked achievements
   */
  static async getAchievementProgress(userId: string | mongoose.Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const unlockedAchievements = await Achievement.find({ userId });
    const unlockedTitles = unlockedAchievements.map(a => a.title);

    const progress = BASE_ACHIEVEMENTS.map(achievementDef => {
      const isUnlocked = unlockedTitles.includes(achievementDef.title);
      const currentValue = user.stats[achievementDef.requirement.stat];
      const progressPercentage = Math.min(
        100,
        Math.round((currentValue / achievementDef.requirement.threshold) * 100)
      );

      return {
        id: achievementDef.id,
        title: achievementDef.title,
        description: achievementDef.description,
        icon: achievementDef.icon,
        type: achievementDef.type,
        xpReward: achievementDef.xpReward,
        isUnlocked,
        progress: {
          current: currentValue,
          target: achievementDef.requirement.threshold,
          percentage: progressPercentage,
        },
      };
    });

    return progress;
  }

  /**
   * Get all available achievements (with locked/unlocked status)
   */
  static async getAllAchievements(userId: string | mongoose.Types.ObjectId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const unlockedAchievements = await Achievement.find({ userId });
    const unlockedTitles = unlockedAchievements.map(a => a.title);

    return BASE_ACHIEVEMENTS.map(achievementDef => ({
      id: achievementDef.id,
      title: achievementDef.title,
      description: achievementDef.description,
      icon: achievementDef.icon,
      type: achievementDef.type,
      xpReward: achievementDef.xpReward,
      isUnlocked: unlockedTitles.includes(achievementDef.title),
      requirement: achievementDef.requirement,
    }));
  }
}
