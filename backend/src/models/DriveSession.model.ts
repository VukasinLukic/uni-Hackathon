import mongoose, { Schema, Document } from 'mongoose';

export interface IDriveSession extends Document {
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  distanceDriven: number; // in meters
  route: {
    type: string;
    coordinates: [number, number][]; // Array of [longitude, latitude] points
  };
  potholesDetected: number;
  cellsExplored: number;
  xpEarned: number;
  active: boolean;
}

const DriveSessionSchema = new Schema<IDriveSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
    },
    distanceDriven: {
      type: Number,
      default: 0, // in meters
    },
    route: {
      type: {
        type: String,
        enum: ['LineString'],
        default: 'LineString',
      },
      coordinates: {
        type: [[Number]],
        default: [],
      },
    },
    potholesDetected: {
      type: Number,
      default: 0,
    },
    cellsExplored: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Geospatial index for route queries
DriveSessionSchema.index({ route: '2dsphere' });

// Index for finding active sessions
DriveSessionSchema.index({ userId: 1, active: 1 });

// Index for user session history
DriveSessionSchema.index({ userId: 1, startTime: -1 });

export const DriveSession = mongoose.model<IDriveSession>(
  'DriveSession',
  DriveSessionSchema
);
