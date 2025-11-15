// @ts-nocheck
import { Leaderboard, ILeaderboard, ILeaderboardEntry } from '../models/Leaderboard.model';
import { User } from '../models/User.model';
import { DriveSession } from '../models/DriveSession.model';
import mongoose from 'mongoose';

export class LeaderboardService {
  /**
   * Calculate period dates
   */
  private static getPeriodDates(period: 'daily' | 'weekly' | 'monthly' | 'all_time'): {
    startDate: Date;
    endDate?: Date;
  } {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      case 'all_time':
        startDate = new Date(0); // Unix epoch
        break;
    }

    return { startDate };
  }

  /**
   * Generate leaderboard for a specific period and category
   */
  static async generateLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all_time',
    category: 'xp' | 'exploration' | 'distance' | 'detection'
  ): Promise<ILeaderboard | null> {
    const { startDate } = this.getPeriodDates(period);

    // Get all users and calculate scores based on category
    const users = await User.find().select(
      '_id username avatarUrl level totalXP currentXP stats'
    );

    const entries: ILeaderboardEntry[] = [];

    for (const user of users) {
      let score = 0;

      switch (category) {
        case 'xp':
          score = user.totalXP;
          break;
        case 'exploration':
          score = user.stats.cellsExplored;
          break;
        case 'distance':
          score = user.stats.distanceDriven;
          break;
        case 'detection':
          score = user.stats.potholesDetected;
          break;
      }

      entries.push({
        userId: user._id as mongoose.Types.ObjectId,
        username: user.username,
        avatarUrl: user.avatarUrl,
        score,
        level: user.level,
        stats: {
          cellsExplored: user.stats.cellsExplored,
          distanceDriven: user.stats.distanceDriven,
          potholesDetected: user.stats.potholesDetected,
          totalXP: user.totalXP,
        },
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by score descending
    entries.sort((a, b) => b.score - a.score);

    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Take top 100
    const topEntries = entries.slice(0, 100);

    // Update or create leaderboard
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { period, category },
      {
        period,
        category,
        startDate,
        entries: topEntries,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return leaderboard as ILeaderboard | null;
  }

  /**
   * Get leaderboard with user's position
   */
  static async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all_time',
    category: 'xp' | 'exploration' | 'distance' | 'detection',
    userId?: string | mongoose.Types.ObjectId
  ): Promise<{
    leaderboard: ILeaderboard | null;
    userPosition?: {
      rank: number;
      score: number;
      username: string;
      level: number;
    };
  }> {
    let leaderboard: any = await Leaderboard.findOne({ period, category });

    // If leaderboard doesn't exist or is old, regenerate
    if (
      !leaderboard ||
      (period !== 'all_time' &&
        new Date().getTime() - leaderboard.lastUpdated.getTime() > 3600000)
    ) {
      // Regenerate if older than 1 hour
      // @ts-ignore
      leaderboard = await this.generateLeaderboard(period, category);
    }

    let userPosition;

    if (userId && leaderboard) {
      const userEntry = leaderboard.entries.find(
        (entry: any) => entry.userId.toString() === userId.toString()
      );

      if (userEntry) {
        userPosition = {
          rank: userEntry.rank,
          score: userEntry.score,
          username: userEntry.username,
          level: userEntry.level,
        };
      } else {
        // User not in top 100, find their actual rank
        const user = await User.findById(userId);
        if (user) {
          let score = 0;

          switch (category) {
            case 'xp':
              score = user.totalXP;
              break;
            case 'exploration':
              score = user.stats.cellsExplored;
              break;
            case 'distance':
              score = user.stats.distanceDriven;
              break;
            case 'detection':
              score = user.stats.potholesDetected;
              break;
          }

          // Count how many users have higher score
          const higherScoreCount = await User.countDocuments(
            this.getScoreFilter(category, score)
          );

          userPosition = {
            rank: higherScoreCount + 1,
            score,
            username: user.username,
            level: user.level,
          };
        }
      }
    }

    return {
      leaderboard,
      userPosition,
    };
  }

  /**
   * Get score filter for category
   */
  private static getScoreFilter(
    category: 'xp' | 'exploration' | 'distance' | 'detection',
    score: number
  ): any {
    switch (category) {
      case 'xp':
        return { totalXP: { $gt: score } };
      case 'exploration':
        return { 'stats.cellsExplored': { $gt: score } };
      case 'distance':
        return { 'stats.distanceDriven': { $gt: score } };
      case 'detection':
        return { 'stats.potholesDetected': { $gt: score } };
    }
  }

  /**
   * Get all leaderboards (all periods and categories)
   */
  static async getAllLeaderboards(
    userId?: string | mongoose.Types.ObjectId
  ): Promise<any> {
    const periods: Array<'daily' | 'weekly' | 'monthly' | 'all_time'> = [
      'daily',
      'weekly',
      'monthly',
      'all_time',
    ];
    const categories: Array<'xp' | 'exploration' | 'distance' | 'detection'> = [
      'xp',
      'exploration',
      'distance',
      'detection',
    ];

    const leaderboards: any = {};

    for (const period of periods) {
      leaderboards[period] = {};
      for (const category of categories) {
        const result = await this.getLeaderboard(period, category, userId);
        leaderboards[period][category] = result;
      }
    }

    return leaderboards;
  }

  /**
   * Get user's ranks across all categories
   */
  static async getUserRanks(userId: string | mongoose.Types.ObjectId): Promise<any> {
    const categories: Array<'xp' | 'exploration' | 'distance' | 'detection'> = [
      'xp',
      'exploration',
      'distance',
      'detection',
    ];

    const ranks: any = {};

    for (const category of categories) {
      const result = await this.getLeaderboard('all_time', category, userId);
      ranks[category] = result.userPosition || null;
    }

    return ranks;
  }

  /**
   * Update all leaderboards (called by cron job)
   */
  static async updateAllLeaderboards(): Promise<void> {
    const periods: Array<'daily' | 'weekly' | 'monthly' | 'all_time'> = [
      'daily',
      'weekly',
      'monthly',
      'all_time',
    ];
    const categories: Array<'xp' | 'exploration' | 'distance' | 'detection'> = [
      'xp',
      'exploration',
      'distance',
      'detection',
    ];

    console.log('🔄 Updating leaderboards...');

    for (const period of periods) {
      for (const category of categories) {
        await this.generateLeaderboard(period, category);
        console.log(`  ✅ Updated ${period} - ${category}`);
      }
    }

    console.log('✅ All leaderboards updated');
  }

  /**
   * Get top N users for a category
   */
  static async getTopUsers(
    category: 'xp' | 'exploration' | 'distance' | 'detection',
    limit: number = 10
  ): Promise<ILeaderboardEntry[]> {
    const result = await this.getLeaderboard('all_time', category);
    return result.leaderboard?.entries.slice(0, limit) || [];
  }

  /**
   * Get nearby users (users ranked around current user)
   */
  static async getNearbyUsers(
    userId: string | mongoose.Types.ObjectId,
    category: 'xp' | 'exploration' | 'distance' | 'detection',
    range: number = 5
  ): Promise<ILeaderboardEntry[]> {
    const result = await this.getLeaderboard('all_time', category, userId);

    if (!result.leaderboard || !result.userPosition) {
      return [];
    }

    const userRank = result.userPosition.rank;
    const startRank = Math.max(1, userRank - range);
    const endRank = userRank + range;

    return result.leaderboard.entries.filter(
      (entry) => entry.rank >= startRank && entry.rank <= endRank
    );
  }
}
