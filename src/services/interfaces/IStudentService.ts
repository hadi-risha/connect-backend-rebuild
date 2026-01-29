import { BookingStatus } from "../../constants/bookingStatus.enum";
import { CancelBookingInput } from "../../interfaces/cancelBookingInput";

export interface IStudentService {
  createPaymentIntent(
    studentId: string,
    sessionId: string,
    timeSlot: string,
    selectedDate: string,
    concerns?: string
  ): Promise<string | null>;

  createBookingFromWebhook(pi: any): Promise<void>;

  getStudentBookings(studentId: string, status?: BookingStatus): Promise<any[]>;

  cancelBooking(input: CancelBookingInput): Promise<void>;

  toggleWishlist(studentId: string, sessionId: string): Promise<{ added: boolean }>;

  getWishlistSessions(studentId: string): Promise<any[]>;

  getStudentBookingById(studentId: string, bookingId: string): Promise<any | null>;
}
