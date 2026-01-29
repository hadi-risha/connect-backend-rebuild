import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ApiError } from "../common/errors/ApiError";
import { logger } from "../common/utils/logger";
import { StudentService } from "../services/StudentService";
import { CancellationBy } from "../constants/cancellationBy.enum";
import { BookingStatus } from "../constants/bookingStatus.enum";

const studentService = new StudentService();

export const createPaymentIntent = async (req: Request, res: Response) => {
  const { sessionId, selectedDate, timeSlot, concerns } = req.body;
  const studentId = req.user?.id;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const clientSecret  = await studentService.createPaymentIntent(studentId, sessionId, timeSlot, selectedDate, concerns);

  res.status(StatusCodes.OK).json({ clientSecret });
};


export const getBookings = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const { status } = req.params;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const statusMap: Record<string, BookingStatus> = {
    booked: BookingStatus.BOOKED,
    completed: BookingStatus.COMPLETED,
    cancelled: BookingStatus.CANCELLED,
  };
  
  const bookingStatus = statusMap[status?.toLowerCase()];

  if (!bookingStatus) {
    return res.status(400).json({ message: "Invalid booking status" });
  }

  const bookings = await studentService.getStudentBookings(studentId, bookingStatus);

  res.status(StatusCodes.OK).json({ bookings });
};


export const cancelBooking = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { bookingId } = req.body;
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  await studentService.cancelBooking({bookingId,
    cancelledBy: CancellationBy.STUDENT,  //Instructor cancellation will call same service with CancellationBy.INSTRUCTOR
    userId,
  });

  res.json({ success: true });
};


export const toggleWishlist = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const { sessionId } = req.params;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const result = await studentService.toggleWishlist(studentId, sessionId);

  res.status(StatusCodes.OK).json({
    message: result.added
      ? "Added to wishlist"
      : "Removed from wishlist",
    wishlisted: result.added,
  });
};


export const getWishlistSessions = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const sessions = await studentService.getWishlistSessions(studentId);

  res.status(StatusCodes.OK).json({
    sessions,
  });
};


export const getBookingById = async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const { bookingId } = req.params;
  if (!studentId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  
  const booking = await studentService.getStudentBookingById(
    studentId,
    bookingId
  );
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  res.status(StatusCodes.OK).json({ booking });
};


