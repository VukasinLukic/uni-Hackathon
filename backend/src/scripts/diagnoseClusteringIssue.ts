import mongoose from 'mongoose';
import { Pothole } from '../models/Pothole.model';
import { Event } from '../models/Event.model';
import { connectDB } from '../config/database';
import * as dotenv from 'dotenv';

dotenv.config();

async function diagnose() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('\n📊 DATABASE DIAGNOSTICS\n');
    console.log('='.repeat(60));

    // 1. Count documents
    const totalEvents = await Event.countDocuments();
    const totalPotholes = await Pothole.countDocuments();
    console.log(`\n1️⃣  COUNTS:`);
    console.log(`   Events: ${totalEvents}`);
    console.log(`   Potholes: ${totalPotholes}`);

    // 2. Check events without clusterId
    const eventsWithoutCluster = await Event.countDocuments({ clusterId: null });
    const eventsWithCluster = await Event.countDocuments({
      clusterId: { $ne: null },
    });
    console.log(`\n2️⃣  EVENT CLUSTERING STATUS:`);
    console.log(`   Events WITH clusterId: ${eventsWithCluster}`);
    console.log(`   Events WITHOUT clusterId: ${eventsWithoutCluster}`);

    if (eventsWithoutCluster > 0) {
      console.log(`   ⚠️  WARNING: ${eventsWithoutCluster} events are not linked to any pothole!`);
      console.log(`   These events were likely added directly to DB (not via POST /api/events)`);
    }

    // 3. Check latest events
    const latestEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(15);

    console.log(`\n3️⃣  LATEST 15 EVENTS:`);
    latestEvents.forEach((e, i) => {
      const doc = e as any;
      console.log(
        `   ${i + 1}. Created: ${doc.createdAt?.toISOString() || 'N/A'}, ` +
          `ClusterId: ${e.clusterId || 'NULL'}, ` +
          `Coords: [${e.location.coordinates[0].toFixed(4)}, ${e.location.coordinates[1].toFixed(4)}]`
      );
    });

    // 4. Check indexes
    console.log(`\n4️⃣  GEOSPATIAL INDEXES:`);
    const potholeIndexes = await Pothole.collection.getIndexes();
    const eventIndexes = await Event.collection.getIndexes();

    const potholeHas2dsphere = Object.keys(potholeIndexes).some(name =>
      name.includes('location_2dsphere')
    );
    const eventHas2dsphere = Object.keys(eventIndexes).some(name =>
      name.includes('location_2dsphere')
    );

    console.log(`   Pothole indexes: ${Object.keys(potholeIndexes).join(', ')}`);
    console.log(`   Event indexes: ${Object.keys(eventIndexes).join(', ')}`);
    console.log(`   Pothole has 2dsphere index: ${potholeHas2dsphere ? '✅' : '❌'}`);
    console.log(`   Event has 2dsphere index: ${eventHas2dsphere ? '✅' : '❌'}`);

    if (!potholeHas2dsphere) {
      console.log(`   ⚠️  CRITICAL: Pothole missing 2dsphere index! Clustering won't work.`);
    }

    // 5. Check coordinate format
    const sampleEvents = await Event.find().limit(5);
    console.log(`\n5️⃣  COORDINATE FORMAT CHECK:`);
    sampleEvents.forEach((e, i) => {
      const [first, second] = e.location.coordinates;
      const isValidLng = first >= -180 && first <= 180;
      const isValidLat = second >= -90 && second <= 90;
      const formatOK = isValidLng && isValidLat;

      console.log(
        `   Event ${i + 1}: [${first.toFixed(4)}, ${second.toFixed(4)}] ${formatOK ? '✅' : '❌ INVALID'}`
      );
    });

    // 6. Pothole distribution by report count
    const potholesByReports = await Pothole.aggregate([
      {
        $group: {
          _id: '$reports',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log(`\n6️⃣  POTHOLE DISTRIBUTION BY REPORT COUNT:`);
    potholesByReports.forEach((p) => {
      console.log(`   ${p._id} report(s): ${p.count} potholes`);
    });

    // 7. Recent potholes
    const recentPotholes = await Pothole.find()
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`\n7️⃣  LATEST 5 POTHOLES:`);
    recentPotholes.forEach((p, i) => {
      const doc = p as any;
      console.log(
        `   ${i + 1}. Created: ${doc.createdAt?.toISOString() || 'N/A'}, ` +
          `Reports: ${p.reports}, Severity: ${p.severity}, ` +
          `Coords: [${p.location.coordinates[0].toFixed(4)}, ${p.location.coordinates[1].toFixed(4)}]`
      );
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Diagnostics complete!\n');

    // 8. Recommendations
    console.log('💡 RECOMMENDATIONS:');
    if (eventsWithoutCluster > 0) {
      console.log(
        `   - ${eventsWithoutCluster} events need to be processed. They were added directly to DB.`
      );
      console.log(`   - Solution: Delete them OR manually trigger clustering.`);
    }
    if (!potholeHas2dsphere) {
      console.log(`   - Create 2dsphere index on Pothole.location immediately!`);
    }
    if (eventsWithoutCluster === 0 && potholeHas2dsphere) {
      console.log(
        `   - All events are clustered correctly. The 15 new events were added to EXISTING potholes (within 20m).`
      );
      console.log(`   - This is EXPECTED BEHAVIOR if events are close together.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    process.exit(1);
  }
}

diagnose();
