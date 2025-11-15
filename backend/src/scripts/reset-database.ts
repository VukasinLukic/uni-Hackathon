import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Import all models
import { User } from '../models/User.model';
import { Achievement } from '../models/Achievement.model';
import { Reward } from '../models/Reward.model';
import { ExplorationCell } from '../models/ExplorationCell.model';
import { DriveSession } from '../models/DriveSession.model';
import { Leaderboard } from '../models/Leaderboard.model';
import { RedeemableReward, UserRedemption } from '../models/RedeemableReward.model';
import { Event } from '../models/Event.model';
import { Pothole } from '../models/Pothole.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function resetDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🗑️  Deleting all data from collections...\n');

    // Delete all data from each collection
    const deletions = await Promise.all([
      User.deleteMany({}),
      Achievement.deleteMany({}),
      Reward.deleteMany({}),
      ExplorationCell.deleteMany({}),
      DriveSession.deleteMany({}),
      Leaderboard.deleteMany({}),
      RedeemableReward.deleteMany({}),
      UserRedemption.deleteMany({}),
      Event.deleteMany({}),
      Pothole.deleteMany({}),
    ]);

    console.log(`   ✓ Users deleted: ${deletions[0].deletedCount}`);
    console.log(`   ✓ Achievements deleted: ${deletions[1].deletedCount}`);
    console.log(`   ✓ Rewards deleted: ${deletions[2].deletedCount}`);
    console.log(`   ✓ Exploration Cells deleted: ${deletions[3].deletedCount}`);
    console.log(`   ✓ Drive Sessions deleted: ${deletions[4].deletedCount}`);
    console.log(`   ✓ Leaderboards deleted: ${deletions[5].deletedCount}`);
    console.log(`   ✓ Redeemable Rewards deleted: ${deletions[6].deletedCount}`);
    console.log(`   ✓ User Redemptions deleted: ${deletions[7].deletedCount}`);
    console.log(`   ✓ Events deleted: ${deletions[8].deletedCount}`);
    console.log(`   ✓ Potholes deleted: ${deletions[9].deletedCount}`);

    console.log('\n✅ Database reset complete!\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetDatabase();
