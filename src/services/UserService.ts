import { UserRepository } from "../repositories/UserRepository";
import { StatusCodes } from "../constants/statusCodes.enum";
import { Role } from "../constants/roles.enum";
import { ApiError } from "../common/errors/ApiError";
import imagekit from "../integrations/imagekit";
import { SwitchRolePayload } from "../interfaces/SwitchRolePayload";
import { SessionRepository } from "../repositories/SessionRepository";
import { BookingRepository } from "../repositories/BookingRepository";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { Types } from "mongoose";
import { WishlistRepository } from "../repositories/WishlistRepository";
import { AiChatRepository } from "../repositories/AiChatRepository";
import { AiUserChatsRepository } from "../repositories/AiUserChatsRepository";
import { AiRatingRepository } from "../repositories/AiRatingRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { IUserService } from "./interfaces/IUserService";
import { logger } from "../common/utils/logger";

export class UserService implements IUserService {
  private userRepo = new UserRepository();
  private sessionRepo = new SessionRepository();
  private bookingRepo = new BookingRepository();
  private wishlistRepo = new WishlistRepository();
  private aiChatRepo = new AiChatRepository();
  private aiUserChatsRepo = new AiUserChatsRepository();
  private aiRatingRepo = new AiRatingRepository();
  private notificationRepo = new NotificationRepository();

  async getUserProfile(userId: string) {
    const user = await this.userRepo.findOne({ _id: userId });
    if (!user){
      logger.warn("User not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    } 
    return user;
  }

  async switchRole(userId: string, payload: SwitchRolePayload) {
    const { role, instructorProfile, photo, removePhoto } = payload;

    const user = await this.userRepo.findOne({ _id: userId });
    if (!user){
      logger.warn("User not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    } 

    // Instructor → Student
    if (role === Role.STUDENT) {
      if (user.profilePicture?.key) {
        await imagekit.deleteFile(user.profilePicture.key);
      }

      await this.userRepo.update(
        { _id: userId },
        {
          $set: { role },
          $unset: { instructorProfile: "", profilePicture: "" },
        }
      );

      return this.userRepo.findOne({ _id: userId });
    }

    // Student → Instructor
    if (role === Role.INSTRUCTOR) {
      if (!instructorProfile?.bio || !instructorProfile?.expertise) {
        logger.warn("Instructor details required")
        throw new ApiError(StatusCodes.BAD_REQUEST, "Instructor details required");
      }

      // delete old image if replaced or removed
      if ((photo || removePhoto) && user.profilePicture?.key) {
        await imagekit.deleteFile(user.profilePicture.key);
      }

      await this.userRepo.update(
        { _id: userId },
        {
          $set: {
            role,
            instructorProfile,
            ...(photo && { profilePicture: photo }),
          },
          ...(removePhoto && { $unset: { profilePicture: "" } }),
        }
      );

      return this.userRepo.findOne({ _id: userId });
    }
  }


  async updateProfile(
    userId: string,
    payload: {
      name?: string;
      profilePicture?: { key: string; url: string };
      removePhoto?: boolean;
      instructorProfile?: {
        bio?: string;
        expertise?: string;
      };
    }
  ) {
    const user = await this.userRepo.findOne({ _id: userId });
    if (!user){
      logger.warn("User not found")
      throw new ApiError(404, "User not found");
    } 

    const update: any = {};
    const unset: any = {};

    if (payload.name !== undefined) {
      update.name = payload.name;
    }

    // Profile picture handling
    if (payload.profilePicture) {
      // delete old image if replacing
      if (user.profilePicture?.key) {
        await imagekit.deleteFile(user.profilePicture.key);
      }
      update.profilePicture = payload.profilePicture;
    }

    if (payload.removePhoto && user.profilePicture?.key) {
      await imagekit.deleteFile(user.profilePicture.key);
      unset.profilePicture = "";
    }

    // Instructor-only fields
    if (user.role === Role.INSTRUCTOR && payload.instructorProfile) {
      update.instructorProfile = {
        bio: payload.instructorProfile.bio ?? user.instructorProfile?.bio,
        expertise:
          payload.instructorProfile.expertise ??
          user.instructorProfile?.expertise,
      };
    }

    await this.userRepo.update(
      { _id: userId },
      {
        ...(Object.keys(update).length && { $set: update }),
        ...(Object.keys(unset).length && { $unset: unset }),
      }
    );

    return this.userRepo.findOne({ _id: userId });
  }


  async getAllActiveSessions(userId: string, role: Role) {
    let bookedSessionIds: Types.ObjectId[] = [];

    if (role === Role.STUDENT) {
      bookedSessionIds =
        await this.bookingRepo.getBookedSessionIdsForStudent(userId);
    }

    if (role === Role.INSTRUCTOR) {
      bookedSessionIds =
        await this.bookingRepo.getBookedSessionIdsForInstructor(userId);
    }

    const sessions =
      await this.sessionRepo.getActiveUnbookedSessions(bookedSessionIds);

    // only customize for students
    if (role !== Role.STUDENT) return sessions;

    const wishlistEntries =
      await this.wishlistRepo.findByStudentId(new Types.ObjectId(userId));

    const wishlistSet = new Set(
      wishlistEntries.map(w => w.sessionId.toString())
    );

    return sessions.map((s: any) => ({
      ...s.toObject(),
      isWishlisted: wishlistSet.has(s._id.toString()),
    }));
  }


  async getSingleSession(sessionId: string, userId: string, role: Role) {
    const session = await this.sessionRepo.findOne({ _id: sessionId, isArchived: false });
    if (!session) {
      logger.warn("Session not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
    }
  
    if (role === Role.STUDENT) {
      const isWishlisted = await this.wishlistRepo.exists(
        new Types.ObjectId(userId),
        session._id
      );

      return {
        ...session.toObject(),
        isWishlisted,
      };
    }

    return session;
  }


  async searchSessions(userId: string, role: Role, query: string) {
    const regex = new RegExp(query.split(" ").join("|"), "i");

    const sessions = await this.sessionRepo.searchSessions(regex);

    // Fetch bookings (role-aware)
    let bookings = [];
    if (role === Role.STUDENT) {
      bookings = await this.bookingRepo.find({
        studentId: userId,
        status: BookingStatus.BOOKED,
      });
    } else {
      bookings = await this.bookingRepo.find({
        instructorId: userId,
        status: BookingStatus.BOOKED,
      });
    }

    const bookingMap = new Map(
      bookings.map(b => [b.sessionId.toString(), b])
    );

    // RESPONSE SHAPE (Frontend-friendly)
    return sessions.map((session: any) => {
      const booking = bookingMap.get(session._id.toString());
      return {
        sessionId: session._id,
        title: session.title,
        introduction: session.introduction,
        category: session.category,
        coverPhoto: session.coverPhoto,
        instructorId: session.instructorId,

        isBooked: !!booking,
        bookingId: booking?._id ?? null,

        redirectTo:
          role === Role.INSTRUCTOR
            ? `/instructor/session/${session._id}`
            : booking
              ? `/student/bookings/${booking._id}`
              : `/student/session/book/${session._id}`,
      };
    });
  }


  async createAiChat(userId: string, text: string) {
    if (!text || !text.trim()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Text is required");
    }

    const chat = await this.aiChatRepo.createChat(userId, text);

    // add to user's chat list
    const title =
      text.length > 40 ? text.slice(0, 40) + "..." : text;

    await this.aiUserChatsRepo.addChatToUser(
      userId,
      chat._id.toString(),
      title
    );

    return {
      chatId: chat._id,
      title,
      createdAt: chat.createdAt,
    };
  }


  async fetchAiChatList(userId: string) {
    const userChatsDoc = await this.aiUserChatsRepo.getChatsByUserId(userId);

    // no chats yet → return empty list
    if (!userChatsDoc) {
      return [];
    }

    return userChatsDoc.chats;
  }


  async fetchSingleAiChat(userId: string, chatId: string) {
    const chat = await this.aiChatRepo.findChatByIdAndUser(chatId, userId);

    if (!chat) {
      logger.warn("AI chat not found")
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "AI chat not found"
      );
    }

    return chat;
  }


  async updateExistingAiChat(
    userId: string,
    chatId: string,
    payload: {
      question?: string;
      answer: string;
      img?: string;
    }
  ) {
    const { question, answer, img } = payload;

    if (!answer || !answer.trim()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Answer is required"
      );
    }

    const chatExists = await this.aiChatRepo.existsByIdAndUser(
      chatId,
      userId
    );

    if (!chatExists) {
      logger.warn("AI chat not found")
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "AI chat not found"
      );
    }

    // Build history items
    const newItems = [
      ...(question
        ? [
            {
              role: "user",
              parts: [{ text: question }],
              ...(img && { img }),
            },
          ]
        : []),
      {
        role: "model",
        parts: [{ text: answer }],
      },
    ];

    // Append to chat
    await this.aiChatRepo.appendToChatHistory(
      chatId,
      userId,
      newItems
    );

    return { success: true };
  }


  async submitAiRating(userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Rating must be between 1 and 5"
      );
    }

    // Optional: prevent duplicate ratings per user
    // const existing = await this.aiRatingRepo.findByUserId(userId);
    // if (existing) {
    //   throw new ApiError(StatusCodes.CONFLICT, "Rating already submitted");
    // }

    await this.aiRatingRepo.createRating(userId, rating);

    return { success: true };
  }


  async getActiveNotifications() {
    return this.notificationRepo.findActiveForUsers();
  }

}
