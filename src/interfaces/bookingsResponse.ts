// for all user bookings
import { Types } from "mongoose";
import { CancellationBy } from "../constants/cancellationBy.enum";

export interface PopulatedBooking {
  _id: Types.ObjectId;

  bookedDate: Date;
  timeSlot: Date;
  endTime: Date;

  status: string;
  concerns?: string;

  instructorId: {
    _id: Types.ObjectId;
    name: string;
    role: string;
    profilePicture?: {
      key?: string;
      url?: string;
    };
  };

  sessionId: {
    _id: Types.ObjectId;
    title: string;
    introduction: string;
    description: string;
    bulletPoints?: string[];
    coverPhoto?: {
      key?: string;
      url?: string;
    };
    duration: number;
    fees: number;
  };

  meetingId?: string;

  amountPaid: number;
  currency: string;
  isRefunded: boolean;
  refundedAmount?: number;

  // Refund tracking
  refundStatus?: "pending" | "succeeded" | "failed";

  cancellation?: {
    cancelledBy: CancellationBy;
    cancelledAt: Date;
    reason?: string;
  };
}
