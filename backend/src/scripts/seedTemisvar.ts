import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { ExplorationCell } from '../models/ExplorationCell.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pavepatrol';

// Temisvar coordinates
const TEMISVAR_CENTER = { lat: 45.7489, lng: 21.2087 };

// Generate grid of explored cells around Temisvar center
function generateExploredCells(centerLat: number, centerLng: number, gridSize: number = 20) {
  const CELL_SIZE = 0.001; // ~100m
  const cells = [];

  // Create a grid of explored cells
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      // Skip some cells to make it more realistic (not perfect grid)
      if (Math.random() > 0.7) continue;

      const lat = centerLat + (i * CELL_SIZE);
      const lng = centerLng + (j * CELL_SIZE);

      const cellId = `${Math.floor(lat / CELL_SIZE)}_${Math.floor(lng / CELL_SIZE)}`;

      cells.push({
        cellId,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        exploredAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
      });
    }
  }

  return cells;
}

// Generate tokens around Temisvar
function generateTokens(centerLat: number, centerLng: number) {
  const tokens = [
    // Main streets
    { lat: centerLat + 0.0015, lng: centerLng + 0.0020, value: 100 },
    { lat: centerLat - 0.0010, lng: centerLng + 0.0025, value: 150 },
    { lat: centerLat + 0.0025, lng: centerLng - 0.0015, value: 200 },
    { lat: centerLat - 0.0020, lng: centerLng - 0.0010, value: 100 },

    // Parks/landmarks
    { lat: centerLat + 0.0030, lng: centerLng + 0.0010, value: 250 },
    { lat: centerLat - 0.0025, lng: centerLng + 0.0030, value: 300 },

    // Residential areas
    { lat: centerLat + 0.0010, lng: centerLng + 0.0035, value: 100 },
    { lat: centerLat - 0.0035, lng: centerLng - 0.0005, value: 150 },
    { lat: centerLat + 0.0040, lng: centerLng - 0.0020, value: 200 },
    { lat: centerLat - 0.0015, lng: centerLng - 0.0040, value: 250 },

    // Bonus tokens
    { lat: centerLat + 0.0005, lng: centerLng - 0.0045, value: 500 }, // Rare
    { lat: centerLat + 0.0045, lng: centerLng + 0.0015, value: 500 }, // Rare
  ];

  return tokens.map((token, index) => ({
    id: `temisvar-token-${index + 1}`,
    ...token,
  }));
}

async function seedTemisvar() {
  try {
    console.log('🌱 Starting Temisvar seed...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find test user (or create one)
    let testUser = await User.findOne({ username: 'simica' });

    if (!testUser) {
      console.log('Creating test user: simica');
      testUser = await User.create({
        username: 'simica',
        licensePlate: 'TM-420-PP',
        name: 'Simica Test',
        avatarNumber: 3,
        currentXP: 500,
        level: 2,
      });
    }

    console.log(`✅ Test user: ${testUser.username} (ID: ${testUser._id})`);

    // Generate explored cells
    const exploredCells = generateExploredCells(TEMISVAR_CENTER.lat, TEMISVAR_CENTER.lng, 15);
    console.log(`📍 Generated ${exploredCells.length} explored cells`);

    // Clear existing cells for this user
    await ExplorationCell.deleteMany({ userId: testUser._id });

    // Insert explored cells
    const cellDocs = exploredCells.map(cell => ({
      ...cell,
      userId: testUser._id,
    }));

    await ExplorationCell.insertMany(cellDocs);
    console.log(`✅ Inserted ${cellDocs.length} explored cells for ${testUser.username}`);

    // Update user stats
    testUser.stats = {
      ...testUser.stats,
      cellsExplored: cellDocs.length,
      distanceDriven: cellDocs.length * 100, // ~100m per cell
    };
    await testUser.save();

    // Generate tokens (for future implementation)
    const tokens = generateTokens(TEMISVAR_CENTER.lat, TEMISVAR_CENTER.lng);
    console.log(`🪙 Generated ${tokens.length} tokens (saved to tokens.json for frontend)`);

    // Save tokens to a JSON file for frontend to use
    const fs = require('fs');
    const path = require('path');
    const tokensPath = path.join(__dirname, '../../data/temisvar-tokens.json');
    fs.mkdirSync(path.dirname(tokensPath), { recursive: true });
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));

    console.log('\n✅ Temisvar seed completed!');
    console.log(`   User: ${testUser.username}`);
    console.log(`   Explored cells: ${cellDocs.length}`);
    console.log(`   Tokens: ${tokens.length}`);
    console.log(`   Tokens saved to: ${tokensPath}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedTemisvar();
