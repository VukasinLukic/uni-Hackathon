import mongoose from 'mongoose';
import { Pothole } from '../models/Pothole.model';
import { Event } from '../models/Event.model';
import { User } from '../models/User.model';
import { connectDB } from '../config/database';
import * as dotenv from 'dotenv';

dotenv.config();

// Belgrade area coordinates (roughly)
const BELGRADE_CENTER = { lat: 44.8125, lng: 20.4612 };
const RADIUS = 0.1; // ~10km radius

// Generate random coordinate near Belgrade
function randomCoordinate() {
  const lat = BELGRADE_CENTER.lat + (Math.random() - 0.5) * RADIUS;
  const lng = BELGRADE_CENTER.lng + (Math.random() - 0.5) * RADIUS;
  return [lng, lat]; // GeoJSON format: [longitude, latitude]
}

// Generate random date in last 30 days
function randomDate(daysAgo: number = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

// Random severity (0-100)
function randomSeverity() {
  return Math.floor(Math.random() * 100);
}

// Random magnitude (0.5 - 3.5)
function randomMagnitude() {
  return 0.5 + Math.random() * 3.0;
}

// Random status
function randomStatus() {
  const statuses = ['new', 'planned', 'in_progress', 'resolved'];
  const weights = [0.5, 0.25, 0.15, 0.1]; // More "new" potholes
  const rand = Math.random();
  let sum = 0;
  for (let i = 0; i < statuses.length; i++) {
    sum += weights[i];
    if (rand < sum) return statuses[i];
  }
  return 'new';
}

// Mock user IDs
const MOCK_USERS = [
  'user-001-marko',
  'user-002-ana',
  'user-003-stefan',
  'user-004-jelena',
  'user-005-nikola',
  'user-006-milica',
  'user-007-ivan',
  'user-008-sara',
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Pothole.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});

    console.log('👥 Creating users...');
    const users = await User.insertMany(
      MOCK_USERS.map((id, index) => ({
        auth0Id: id,
        email: `${id}@roadsense.com`,
        name: id.split('-')[2],
        role: index === 0 ? 'admin' : index < 3 ? 'official' : 'driver',
        stats: {
          totalReports: Math.floor(Math.random() * 50),
          confirmedPotholes: Math.floor(Math.random() * 20),
          points: Math.floor(Math.random() * 500),
        },
      }))
    );
    console.log(`✅ Created ${users.length} users`);

    console.log('🕳️  Creating potholes...');
    const potholes = [];

    // Create 50 potholes
    for (let i = 0; i < 50; i++) {
      const coords = randomCoordinate();
      const status = randomStatus();
      const firstReported = randomDate(30);
      const lastReported = new Date(
        firstReported.getTime() + Math.random() * (Date.now() - firstReported.getTime())
      );
      const reports = 1 + Math.floor(Math.random() * 15);
      const avgMag = randomMagnitude();
      const maxMag = avgMag + Math.random() * 0.8;

      const pothole = new Pothole({
        location: {
          type: 'Point',
          coordinates: coords,
        },
        severity: randomSeverity(),
        status,
        reports,
        uniqueUsers: MOCK_USERS.slice(0, reports).map(id => id),
        impactData: {
          avgMagnitude: avgMag,
          maxMagnitude: maxMag,
          count: reports,
        },
        aiValidated: Math.random() > 0.6, // 40% AI validated
        aiConfidence: Math.random() > 0.6 ? Math.floor(60 + Math.random() * 40) : undefined,
        firstReported,
        lastReported,
        resolvedAt: status === 'resolved' ? lastReported : undefined,
      });

      await pothole.save();
      potholes.push(pothole);
    }
    console.log(`✅ Created ${potholes.length} potholes`);

    console.log('📍 Creating events...');
    const events = [];

    // Create 200 events (distributed across potholes)
    for (let i = 0; i < 200; i++) {
      const pothole = potholes[Math.floor(Math.random() * potholes.length)];
      const [lng, lat] = pothole.location.coordinates;

      // Add small variation to coords (within 10m)
      const variation = 0.0001; // ~10m
      const eventCoords = [
        lng + (Math.random() - 0.5) * variation,
        lat + (Math.random() - 0.5) * variation,
      ];

      const magnitude = randomMagnitude();

      const event = new Event({
        userId: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
        location: {
          type: 'Point',
          coordinates: eventCoords,
        },
        timestamp: randomDate(30),
        accelerationData: {
          magnitude,
          x: (Math.random() - 0.5) * magnitude,
          y: (Math.random() - 0.5) * magnitude,
          z: magnitude * 0.8,
        },
        gyroscopeData: {
          alpha: Math.random() * 360,
          beta: Math.random() * 180 - 90,
          gamma: Math.random() * 180 - 90,
        },
        speed: 20 + Math.random() * 50, // 20-70 km/h
        deviceOrientation: {
          pitch: Math.random() * 20 - 10,
          roll: Math.random() * 20 - 10,
          yaw: Math.random() * 360,
        },
        clusterId: pothole._id,
      });

      await event.save();
      events.push(event);
    }
    console.log(`✅ Created ${events.length} events`);

    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🕳️  Potholes: ${potholes.length}`);
    console.log(`   📍 Events: ${events.length}`);

    const statusCounts = await Pothole.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    console.log('\n   Status breakdown:');
    statusCounts.forEach(s => console.log(`      ${s._id}: ${s.count}`));

    const avgSeverity = await Pothole.aggregate([
      { $group: { _id: null, avg: { $avg: '$severity' } } },
    ]);
    console.log(`\n   Average severity: ${Math.round(avgSeverity[0].avg)}`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
