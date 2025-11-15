import cron from 'node-cron';
import { LeaderboardService } from './leaderboardService';

/**
 * Setup cron jobs for automatic leaderboard updates
 */
export const setupCronJobs = () => {
  console.log('⏰ Setting up cron jobs...');

  /**
   * Update all leaderboards every hour
   * Cron: 0 * * * * (at minute 0 of every hour)
   */
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [CRON] Running hourly leaderboard update...');
    try {
      await LeaderboardService.updateAllLeaderboards();
      console.log('✅ [CRON] Hourly leaderboard update completed');
    } catch (error) {
      console.error('❌ [CRON] Hourly leaderboard update failed:', error);
    }
  });

  /**
   * Update daily leaderboard at midnight
   * Cron: 0 0 * * * (at 00:00)
   */
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [CRON] Running daily leaderboard reset...');
    try {
      await LeaderboardService.generateLeaderboard('daily', 'xp');
      await LeaderboardService.generateLeaderboard('daily', 'exploration');
      await LeaderboardService.generateLeaderboard('daily', 'distance');
      await LeaderboardService.generateLeaderboard('daily', 'detection');
      console.log('✅ [CRON] Daily leaderboard reset completed');
    } catch (error) {
      console.error('❌ [CRON] Daily leaderboard reset failed:', error);
    }
  });

  /**
   * Update weekly leaderboard every Monday at midnight
   * Cron: 0 0 * * 1 (at 00:00 on Monday)
   */
  cron.schedule('0 0 * * 1', async () => {
    console.log('⏰ [CRON] Running weekly leaderboard reset...');
    try {
      await LeaderboardService.generateLeaderboard('weekly', 'xp');
      await LeaderboardService.generateLeaderboard('weekly', 'exploration');
      await LeaderboardService.generateLeaderboard('weekly', 'distance');
      await LeaderboardService.generateLeaderboard('weekly', 'detection');
      console.log('✅ [CRON] Weekly leaderboard reset completed');
    } catch (error) {
      console.error('❌ [CRON] Weekly leaderboard reset failed:', error);
    }
  });

  /**
   * Update monthly leaderboard on 1st of every month at midnight
   * Cron: 0 0 1 * * (at 00:00 on day 1 of the month)
   */
  cron.schedule('0 0 1 * *', async () => {
    console.log('⏰ [CRON] Running monthly leaderboard reset...');
    try {
      await LeaderboardService.generateLeaderboard('monthly', 'xp');
      await LeaderboardService.generateLeaderboard('monthly', 'exploration');
      await LeaderboardService.generateLeaderboard('monthly', 'distance');
      await LeaderboardService.generateLeaderboard('monthly', 'detection');
      console.log('✅ [CRON] Monthly leaderboard reset completed');
    } catch (error) {
      console.error('❌ [CRON] Monthly leaderboard reset failed:', error);
    }
  });

  console.log('✅ Cron jobs scheduled:');
  console.log('   - Hourly leaderboard update: Every hour');
  console.log('   - Daily leaderboard reset: Every day at midnight');
  console.log('   - Weekly leaderboard reset: Every Monday at midnight');
  console.log('   - Monthly leaderboard reset: 1st of every month at midnight');
};
