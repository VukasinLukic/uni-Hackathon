import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createTestUser() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Delete existing test user if exists
    await User.deleteOne({ email: 'test@test.com' });

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const user = await User.create({
      email: 'test@test.com',
      username: 'testuser',
      password: hashedPassword,
      role: 'driver',
      level: 1,
      currentXP: 0,
      totalXP: 0,
      stats: {
        distanceDriven: 0,
        potholesDetected: 0,
        cellsExplored: 0,
        explorationPercentage: 0,
        totalReports: 0,
        confirmedPotholes: 0,
      },
      settings: {
        notifications: true,
        sensitivity: 'medium',
      },
    });

    console.log('✅ Test user created:');
    console.log('   Email: test@test.com');
    console.log('   Password: password123');
    console.log('   User ID:', user._id);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
