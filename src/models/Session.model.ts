import { Schema, model, Document, Types } from 'mongoose';
import { SessionCategory } from '../constants/sessionCategory.enum';

export interface ISession extends Document {
  title: string;
  introduction: string;
  description: string;
  bulletPoints?: string[];
  coverPhoto: {
    key?: string;
    url?: string;
  };

  duration: number; // in minutes (Easier for:calculating end time, overlap checks, UI formatting later)
  fees: number;

  timeSlots: Date[];  //Easy filtering - upcoming sessions{ timeSlots: { $gte: new Date() } }
  instructorId: Types.ObjectId;
  category: SessionCategory;
  isArchived: boolean;
}

const SessionSchema = new Schema<ISession>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    introduction: {
      type: String,
    },

    description: {
      type: String,
    },

    bulletPoints: {
      type: [String],
      default: undefined,
    },

    coverPhoto: {
      type: {
        key: { type: String },
        url: { type: String },
      },
      required: false,
    },

    duration: {
      type: Number,
      required: true,
      min: 1, // minutes
    },

    fees: {
      type: Number,
      required: true,
      min: 0,
    },

    timeSlots: {
      type: [Date],
      required: true,
      validate: {
        validator: (v: Date[]) => v.length > 0,
        message: 'At least one time slot is required',
      },
    },

    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: Object.values(SessionCategory),
      default: SessionCategory.ARTS,
      index: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>('Session', SessionSchema);
