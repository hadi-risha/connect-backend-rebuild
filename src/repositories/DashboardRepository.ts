import { BookingModel } from "../models/Booking.model";
import { UserModel } from "../models/User.model";
import { SessionModel } from "../models/Session.model";
import { Role } from "../constants/roles.enum";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { IDashboardRepository } from "./interfaces/IDashboardRepository";

export class DashboardRepository implements IDashboardRepository {

  // USER STATS
  async getUserStats() {
    const usersByRole = await UserModel.aggregate([
      {
        // remove admins from stats
        $match: {
          role: { $ne: Role.ADMIN },
        },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      totalUsers: 0,
      instructors: 0,
      students: 0,
    };

    usersByRole.forEach((u) => {
      stats.totalUsers += u.count;

      if (u._id === Role.INSTRUCTOR) stats.instructors = u.count;
      if (u._id === Role.STUDENT) stats.students = u.count;
    });

    return stats;
  }


  // BOOKING STATS 
  async getBookingStats(start?: Date, end?: Date) {
    const filter: any = {};

    // Date range filter
    if (start && end) {
      filter.bookedAt = { $gte: start, $lte: end };
    }

    const totalBookings = await BookingModel.countDocuments(filter);

    const completed = await BookingModel.countDocuments({
      ...filter,
      status: BookingStatus.COMPLETED, 
    });

    const cancelled = await BookingModel.countDocuments({
      ...filter,
      status: BookingStatus.CANCELLED, 
    });

    return { totalBookings, completed, cancelled };
  }


  // SESSION STATS 
  async getSessionsStats() {
    const totalSessions = await SessionModel.countDocuments({
      isArchived: false,
    });

    // timeSlots is array → must use $elemMatch
    const upcomingSessions = await SessionModel.countDocuments({
      isArchived: false,
      timeSlots: { $elemMatch: { $gte: new Date() } },
    });

    return { totalSessions, upcomingSessions };
  }


  async getRecentBookings(limit = 5) {
    return BookingModel.find()
      .populate("studentId", "name")
      .populate("instructorId", "name")
      .populate("sessionId", "title")
      .sort({ bookedAt: -1 })
      .limit(limit)
      .lean();
  }
}
