import { BookingStatus } from "../../constants/bookingStatus.enum";

export interface IInstructorService {
  getInstructorBookings(instructorId: string, status?: BookingStatus): Promise<any>;
}
