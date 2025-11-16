import mongoose from 'mongoose';
import { Pothole } from '../models/Pothole.model';
import { Event } from '../models/Event.model';
import { connectDB } from '../config/database';
import * as dotenv from 'dotenv';

dotenv.config();

async function createIndexes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('\n🔨 Creating geospatial indexes...\n');

    // Create index for Pothole
    console.log('Creating 2dsphere index on Pothole.location...');
    await Pothole.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Pothole index created');

    // Create index for Event
    console.log('Creating 2dsphere index on Event.location...');
    await Event.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Event index created');

    // Verify indexes
    console.log('\n📋 Verifying indexes...');
    const potholeIndexes = await Pothole.collection.getIndexes();
    const eventIndexes = await Event.collection.getIndexes();

    console.log('\nPothole indexes:', Object.keys(potholeIndexes));
    console.log('Event indexes:', Object.keys(eventIndexes));

    console.log('\n✅ All indexes created successfully!');
    console.log('🚀 Clustering will now work properly for new events.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
