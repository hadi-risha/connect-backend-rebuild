import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";
import { BookingRepository } from "../repositories/BookingRepository";
import { config } from "../config";
import { generateZegoToken } from "../common/utils/zegoToken";
import { IZegoService } from "./interfaces/IZegoService";
import { Role } from "../constants/roles.enum";
import { logger } from "../common/utils/logger";

export class ZegoService implements IZegoService {
  private bookingRepo = new BookingRepository();

  // async joinVideoSession(userId: string, bookingId: string) {
  async joinVideoSession( userId: string, bookingId: string ): Promise<{
    token: string;
    roomId: string;
    role: Role.STUDENT | Role.INSTRUCTOR;
    userId: string;
  }> {
    const booking = await this.bookingRepo.findById(bookingId);

    if (!booking) {
      logger.warn("Booking not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
    }

    // Authorization
    const isStudent =
      booking.studentId.toString() === userId;
    const isInstructor =
      booking.instructorId.toString() === userId;

    if (!isStudent && !isInstructor) {
      logger.warn("Not allowed")
      throw new ApiError(StatusCodes.FORBIDDEN, "Not allowed");
    }

    // Time validation
    const now = new Date();
    //comment only now - then uncomment - we need this, but now to test video call we need to comment
    // if (now < booking.timeSlot || now > booking.endTime) {
    //   throw new ApiError(
    //     StatusCodes.FORBIDDEN,
    //     "Session not active"
    //   );
    // }

    // Generate Zego token
    const token = generateZegoToken(
      config.zegoCloud.appId,
      config.zegoCloud.serverSecret,
      userId, // WHO is joining
      booking.meetingId // WHICH room to join
    );

    const role: Role.STUDENT | Role.INSTRUCTOR = isStudent
      ? Role.STUDENT
      : Role.INSTRUCTOR;

    return {
      token,
      roomId: booking.meetingId,
      role,
      userId
    };
  }
}
