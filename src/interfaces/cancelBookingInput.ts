import { CancellationBy } from "../constants/cancellationBy.enum";

export interface CancelBookingInput {
  bookingId: string;
  cancelledBy: CancellationBy;
  userId: string;
}