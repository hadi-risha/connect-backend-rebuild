import { IBaseRepository } from "./IBaseRepository";
import { IBooking } from "../../models/Booking.model";
import { Role } from "../../constants/roles.enum";
import { PopulatedBooking } from "../../interfaces/bookingsResponse";
import { Types } from "mongoose";

export interface IBookingRepository extends IBaseRepository<IBooking> {
  hasOverlap(
    userId: string,
    start: Date,
    end: Date,
    role: Role.STUDENT | Role.INSTRUCTOR
  ): any;

  findStudentBookedSessions(filter: any): Promise<PopulatedBooking[]>;

  findStudentBookingById(filter: any): Promise<PopulatedBooking | null>;

  findById(bookingId: string): any;

  getBookedSessionIdsForStudent(studentId: string): Promise<Types.ObjectId[]>;

  getBookedSessionIdsForInstructor(
    instructorId: string
  ): Promise<Types.ObjectId[]>;

  findInstructorBookedSessions(filter: any): any;

  markCompletedSessions(bufferMinutes: number): any;
}
