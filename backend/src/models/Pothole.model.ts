import mongoose, { Schema, Document } from 'mongoose';

export interface IPothole extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  severity: number; // 0-100
  status: 'new' | 'planned' | 'in_progress' | 'resolved' | 'rejected';
  reports: number; // count of unique users
  uniqueUsers: string[]; // array of userIds
  impactData: {
    avgMagnitude: number;
    maxMagnitude: number;
    count: number;
  };
  photo?: string; // Cloudinary URL
  aiValidated: boolean;
  aiConfidence?: number;
  notes?: string;
  firstReported: Date;
  lastReported: Date;
  resolvedAt?: Date;
}

const PotholeSchema = new Schema<IPothole>(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    severity: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['new', 'planned', 'in_progress', 'resolved', 'rejected'],
      default: 'new',
    },
    reports: { type: Number, default: 1 },
    uniqueUsers: [{ type: String }],
    impactData: {
      avgMagnitude: { type: Number, required: true },
      maxMagnitude: { type: Number, required: true },
      count: { type: Number, default: 1 },
    },
    photo: String,
    aiValidated: { type: Boolean, default: false },
    aiConfidence: Number,
    notes: String,
    firstReported: { type: Date, default: Date.now },
    lastReported: { type: Date, default: Date.now },
    resolvedAt: Date,
  },
  { timestamps: true }
);

PotholeSchema.index({ location: '2dsphere' });
PotholeSchema.index({ severity: -1 });
PotholeSchema.index({ status: 1 });

export const Pothole = mongoose.model<IPothole>('Pothole', PotholeSchema);
