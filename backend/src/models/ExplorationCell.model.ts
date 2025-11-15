import mongoose, { Schema, Document } from 'mongoose';

export interface IExplorationCell extends Document {
  userId: mongoose.Types.ObjectId;
  cellId: string; // Geohash or grid ID (e.g., "45.7489_21.2257_100m")
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  radius: number; // in meters (default: 100)
  exploredAt: Date;
  driveSessionId?: mongoose.Types.ObjectId;
  xpAwarded: number;
}

const ExplorationCellSchema = new Schema<IExplorationCell>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cellId: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    radius: {
      type: Number,
      default: 100, // 100m radius per cell
    },
    exploredAt: {
      type: Date,
      default: Date.now,
    },
    driveSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'DriveSession',
    },
    xpAwarded: {
      type: Number,
      default: 10, // 10 XP per new cell explored
    },
  },
  { timestamps: true }
);

// Geospatial index for finding nearby explored cells
ExplorationCellSchema.index({ location: '2dsphere' });

// Compound index to prevent duplicate cell exploration by same user
ExplorationCellSchema.index({ userId: 1, cellId: 1 }, { unique: true });

// Index for efficient user exploration queries
ExplorationCellSchema.index({ userId: 1, exploredAt: -1 });

export const ExplorationCell = mongoose.model<IExplorationCell>(
  'ExplorationCell',
  ExplorationCellSchema
);
