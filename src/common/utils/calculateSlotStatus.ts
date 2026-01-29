import { BookingStatus } from "../../constants/bookingStatus.enum";

export function calculateSlotStatus(bookings: { status: BookingStatus }[]) {
  const hasBooked = bookings.some(
    (b) => b.status === BookingStatus.BOOKED
  );

  if (hasBooked) {
    return BookingStatus.BOOKED;
  }

  const allCompleted = bookings.every(
    (b) => b.status === BookingStatus.COMPLETED
  );

  if (allCompleted) {
    return BookingStatus.COMPLETED;
  }

  return BookingStatus.CANCELLED;
}

