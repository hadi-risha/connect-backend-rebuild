import { Types } from "mongoose";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { Role } from "../constants/roles.enum";
import { PopulatedBooking } from "../interfaces/bookingsResponse";
import { BookingModel, IBooking } from "../models/Booking.model";
import { BaseRepository } from "./BaseRepository";
import { IBookingRepository } from "./interfaces/IBookingRepository";

export class BookingRepository extends BaseRepository<IBooking> implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  async hasOverlap( userId: string, start: Date, end: Date, role: Role.STUDENT | Role.INSTRUCTOR ) {
    const field = role === "student" ? "studentId" : "instructorId";

    return this.model.findOne({
        [field]: userId,
        status: BookingStatus.BOOKED,
        $or: [
          { timeSlot: { $lt: end }, endTime: { $gt: start } }
        ],
    });
  }


  async findStudentBookedSessions(filter: any): Promise<PopulatedBooking[]> {
    return this.model
      .find(filter)
      .populate({
        path: "instructorId",
        select: "name role profilePicture",
      })
      .populate({
        path: "sessionId",
        select:
          "title introduction description bulletPoints coverPhoto duration fees",
      })
      .sort({ timeSlot: 1 }) // upcoming first
      .lean(); 
  }


  async findStudentBookingById(filter: any): Promise<PopulatedBooking | null> {
    return this.model
      .findOne(filter)
      .populate({
        path: "instructorId",
        select: "name role profilePicture",
      })
      .populate({
        path: "sessionId",
        select:
          "title introduction description bulletPoints coverPhoto duration fees",
      })
      .lean();
  }


  async findById(bookingId: string) {
    return this.model.findById(bookingId);
  }


  async getBookedSessionIdsForStudent(studentId: string) {
    const bookings = await BookingModel.find({
      studentId: new Types.ObjectId(studentId),
      status: BookingStatus.BOOKED,
    }).select("sessionId");

    return bookings.map(b => b.sessionId as Types.ObjectId);
  }


  async getBookedSessionIdsForInstructor(instructorId: string) {
    const bookings = await BookingModel.find({
      instructorId: new Types.ObjectId(instructorId),
      status: BookingStatus.BOOKED,
    }).select("sessionId");

    return bookings.map(b => b.sessionId as Types.ObjectId);
  }


  async findInstructorBookedSessions(filter: any) {
    return this.model
      .find(filter)
      .populate({
        path: "studentId",
        select: "name role profilePicture",
      })
      .populate({
        path: "sessionId",
        select:
          "title introduction description bulletPoints coverPhoto duration fees",
      })
      .sort({ timeSlot: 1 })
      .lean();
  }


  async markCompletedSessions(bufferMinutes: number) {
    const now = new Date();
    const bufferTime = new Date(now.getTime() - bufferMinutes * 60 * 1000);

    return this.model.updateMany(
      {
        status: BookingStatus.BOOKED,
        endTime: { $lte: bufferTime },
      },
      {
        status: BookingStatus.COMPLETED,
        completedAt: now,
      }
    );
  }

}
