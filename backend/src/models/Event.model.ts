import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  userId: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  timestamp: Date;
  accelerationData: {
    magnitude: number;
    x: number;
    y: number;
    z: number;
  };
  gyroscopeData: {
    alpha: number;
    beta: number;
    gamma: number;
  };
  speed: number; // km/h
  deviceOrientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  clusterId?: mongoose.Types.ObjectId;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    timestamp: { type: Date, default: Date.now },
    accelerationData: {
      magnitude: { type: Number, required: true },
      x: Number,
      y: Number,
      z: Number,
    },
    gyroscopeData: {
      alpha: Number,
      beta: Number,
      gamma: Number,
    },
    speed: { type: Number, required: true },
    deviceOrientation: {
      pitch: Number,
      roll: Number,
      yaw: Number,
    },
    clusterId: { type: Schema.Types.ObjectId, ref: 'Pothole' },
  },
  { timestamps: true }
);

// Geospatial index for location queries
EventSchema.index({ location: '2dsphere' });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
