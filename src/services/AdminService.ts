import { UserRepository } from "../repositories/UserRepository";
import { BookingRepository } from "../repositories/BookingRepository";
import { AiRatingRepository } from "../repositories/AiRatingRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { DashboardRepository } from "../repositories/DashboardRepository";
import { StatusCodes } from "../constants/statusCodes.enum";
import { IAdminService } from "./interfaces/IAdminService";
import { logger } from "../common/utils/logger";
import { ApiError } from "../common/errors/ApiError";
import { Role } from "../constants/roles.enum";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { Types } from "mongoose";

export class AdminService implements IAdminService {
  private userRepo = new UserRepository();
  private bookingRepo = new BookingRepository();
  private ratingRepo = new AiRatingRepository();
  private notificationRepo = new NotificationRepository();
  private dashboardRepo = new DashboardRepository();

  async getAllUsers() {
    return this.userRepo
      .find({ role: { $ne: Role.ADMIN } })
  }


  async toggleRole(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      logger.warn("Toggle role failed - user not found", { userId });
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.role === Role.INSTRUCTOR) {
      const activeBooking = await this.bookingRepo.findOne({
        instructorId: user._id,
        status: BookingStatus.BOOKED,
      });

      if (activeBooking) {
        logger.warn("Toggle role failed - instructor has active bookings", { userId });
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Instructor has active bookings. Cannot switch role."
        );
      }

      user.role = Role.STUDENT;
    } else {
      user.role = Role.INSTRUCTOR;
    }

    await user.save();
    return user;
  }


  async toggleBlock(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      logger.warn("Toggle block failed - user not found", { userId });
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    if (user.role === Role.ADMIN) {
      logger.warn("Attempted to block admin user", { userId });
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Admin users cannot be blocked"
      );
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return user;
  }
 

  async getAiRatingsForAdmin() {
    const ratings = await this.ratingRepo.getAllRatingsWithUsers();
    if (!ratings || ratings.length === 0) {
      logger.info("No AI ratings found for admin");
    }

    return ratings.map((r: any) => ({
      ratingId: r._id,
      rating: r.rating,
      createdAt: r.createdAt,
      user: {
        id: r.userId?._id,
        name: r.userId?.name,
        email: r.userId?.email,
        role: r.userId?.role,
        profilePicture: r.userId?.profilePicture,
        isBlocked: r.userId?.isBlocked,
      },
    }));
  }

  async getAllNotifications() {
    const notifications = await this.notificationRepo.findAll();
    if (!notifications || notifications.length === 0) {
        logger.info("No notifications found");
    }

    return notifications;
  }



  async createNotification(adminId: string, title: string, content: string) {
    if (!title || !content) {
      logger.warn("Failed to create notification - missing title or content", { adminId });
      throw new ApiError(StatusCodes.BAD_REQUEST, "Title and content required");
    }

    return this.notificationRepo.create({
      title,
      content,
      createdBy: new Types.ObjectId(adminId),
    });
  }


  async updateNotification(id: string, title: string, content: string) {
    const notif = await this.notificationRepo.findById(id);
    if (!notif) {
      logger.warn("Update notification failed - not found", { notificationId: id });
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
    }

    notif.title = title ?? notif.title;
    notif.content = content ?? notif.content;

    await notif.save();
    return notif;
  }


  async toggleVisibility(id: string) {
    const notif = await this.notificationRepo.findById(id);
    if (!notif) {
      logger.warn("Toggle notification visibility failed - not found", { notificationId: id });
      throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
    }

    notif.isVisible = !notif.isVisible;
    await notif.save();

    return notif;
  }


  async getDashboardData(start?: string, end?: string) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    const [userStats, bookingStats, sessionStats, recentBookings] =
      await Promise.all([
        this.dashboardRepo.getUserStats(),
        this.dashboardRepo.getBookingStats(startDate, endDate),
        this.dashboardRepo.getSessionsStats(),
        this.dashboardRepo.getRecentBookings(),
      ]);
    logger.info("Fetched dashboard data")
    return { userStats, bookingStats, sessionStats, recentBookings };
  }

}