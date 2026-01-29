import { Schema, model, Document, Types } from 'mongoose';
import { BookingStatus } from '../constants/bookingStatus.enum';
import { CancellationBy } from '../constants/cancellationBy.enum';

export interface IBooking extends Document {
  studentId: Types.ObjectId;
  instructorId: Types.ObjectId;
  sessionId: Types.ObjectId;

  bookedAt: Date;
  bookedDate: Date;          
  timeSlot: Date;            // start time
  endTime: Date;             // derived from session.duration
  completedAt?: Date;

  concerns?: string;

  status: BookingStatus;

  stripePaymentIntentId: string;
  amountPaid: number;
  currency: string;
  isRefunded: boolean; //updated by stripe
  refundedAmount?: number; //updated by stripe
  
  // Refund tracking
  stripeRefundId?: string;
  refundStatus?: "pending" | "succeeded" | "failed";

  // Zego
  meetingId: string;        

  cancellation?: {
    cancelledBy: CancellationBy;
    cancelledAt: Date;
    reason?: string;
  };
}

const BookingSchema = new Schema<IBooking>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },

    bookedDate: {
      type: Date,
      required: true,
      index: true,
    },

    timeSlot: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      required: false,
    },

    concerns: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.BOOKED,
      index: true,
    },

    bookedAt: {
      type: Date,
      default: Date.now,
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      index: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: 'usd',
    },

    isRefunded: {
      type: Boolean,
      default: false,
    },

    refundedAmount: {
      type: Number,
    },
    stripeRefundId: {
      type: String,
    },
    refundStatus: {
      type: String,
    },

    // Zego
    meetingId: {
      type: String,
      required: true,
      index: true,
    },

    cancellation: {
      cancelledBy: {
        type: String,
        enum: Object.values(CancellationBy),
      },
      cancelledAt: {
        type: Date,
      },
      reason: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

// Prevent same student booking same slot again
BookingSchema.index(
  { studentId: 1, sessionId: 1, timeSlot: 1 },
  { unique: true }
);

export const BookingModel = model<IBooking>('Booking', BookingSchema);
