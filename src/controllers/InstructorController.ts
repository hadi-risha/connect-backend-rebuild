import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ApiError } from "../common/errors/ApiError";
import { SessionService } from "../services/SessionService";
import { InstructorService } from "../services/InstructorService";
import { BookingStatus } from "../constants/bookingStatus.enum";

const sessionService = new SessionService();
const instructorService = new InstructorService();

export const createSession = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  if (!instructorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const session = await sessionService.createSession(
    instructorId,
    req.body
  );

  res.status(StatusCodes.CREATED).json({message: "session created successfully", session});
};


export const getSingleSession = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { sessionId } = req.params;
  if (!instructorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const session = await sessionService.getSingleSession(
    sessionId,
    instructorId
  );

  res.status(StatusCodes.OK).json({message: "session fetched successfully", session });
};


export const updateSession = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { sessionId } = req.params;
  if (!instructorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const session = await sessionService.updateSession(
    sessionId,
    instructorId,
    req.body
  );

  res.status(StatusCodes.OK).json({message: "session updated successfully", session});
};


export const getInstructorBookings = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { status } = req.params;
  if (!instructorId) {
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

  const bookings = await instructorService.getInstructorBookings(
    instructorId,
    bookingStatus
  );

  res.status(StatusCodes.OK).json({ bookings });
};


export const getInstructorSessions = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  if (!instructorId) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
  const sessions = await sessionService.getInstructorSessions(instructorId);

  res.status(StatusCodes.OK).json({
    message: "Instructor sessions fetched successfully",
    sessions,
  });
};


export const getArchivedSessions = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  if (!instructorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const sessions = await sessionService.getArchivedSessions(instructorId);

  res.status(StatusCodes.OK).json({
    message: "Archived sessions fetched successfully",
    sessions,
  });
};


export const toggleSessionArchive = async (req: Request, res: Response) => {
  const instructorId = req.user?.id;
  const { sessionId } = req.params;
  const { isArchived } = req.body;
  if (!instructorId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  if (typeof isArchived !== "boolean") {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "isArchived must be boolean"
    );
  }

  const session = await sessionService.toggleArchiveStatus(
    sessionId,
    instructorId,
    isArchived
  );

  res.status(StatusCodes.OK).json({
    message: isArchived
      ? "Session archived successfully"
      : "Session restored successfully",
    session,
  });
};

