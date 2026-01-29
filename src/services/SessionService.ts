import { Types } from "mongoose";
import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";
import { SessionRepository } from "../repositories/SessionRepository";
import { ISession } from "../models/Session.model";
import imagekit from "../integrations/imagekit";
import { ISessionService } from "./interfaces/ISessionService";
import { logger } from "../common/utils/logger";

export class SessionService implements ISessionService {
  private sessionRepo = new SessionRepository();

  async createSession(instructorId: string,payload: Partial<ISession>) {
    const {
      title,
      introduction,
      description,
      bulletPoints,
      duration,
      fees,
      category,
      timeSlots,
      coverPhoto,
    } = payload;
  
    if (
      !title ||
      !introduction ||
      !description ||
      !duration ||
      fees === undefined ||
      !category ||
      !Array.isArray(timeSlots) ||
      timeSlots.length === 0 || !coverPhoto
    ) {
      logger.warn("Missing required session fields")
      throw new ApiError(StatusCodes.BAD_REQUEST,"Missing required session fields");
    }
  
    // Convert ISO strings → Date[]
    const parsedTimeSlots = timeSlots.map((t) => new Date(t));
  
    const session = await this.sessionRepo.create({
      title,
      introduction,
      description,
      bulletPoints,
      duration,
      fees,
      category,
      coverPhoto,
      timeSlots: parsedTimeSlots,
      instructorId: new Types.ObjectId(instructorId),
    });

    return session;
  }
 

  async getSingleSession(sessionId: string, instructorId: string) {
    const session = await this.sessionRepo.findOne({
      _id: sessionId,
      instructorId,
      isArchived: false,
    });

    if (!session) {
      logger.warn("Session not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
    }

    return session;
  }


  async updateSession(sessionId: string, instructorId: string, payload: Partial<ISession> & {imageRemoved?: boolean;}) {      
    const session = await this.sessionRepo.findOne({
      _id: sessionId,
      instructorId,
      isArchived: false,
    });
      
    if (!session) {
      logger.warn("Session not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
    }

    const {
      title,
      introduction,
      description,
      bulletPoints,
      duration,
      fees,
      category,
      timeSlots,
      coverPhoto,
      imageRemoved,
    } = payload;

    if (imageRemoved && !coverPhoto) {
      throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Session image is required"
      );
    }

    if (!session.coverPhoto && !coverPhoto) {
      throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Session image is required"
      );
    }

    // IMAGE HANDLING
    if (imageRemoved && session.coverPhoto?.key) {
      // delete old image first
      await imagekit.deleteFile(session.coverPhoto.key);
    }

    /** 🕒 Time slot conversion */
    const parsedTimeSlots = timeSlots
      ? timeSlots.map((t) => new Date(t))
      : undefined;

    const updateData: any = {
      ...(title && { title }),
      ...(introduction && { introduction }),
      ...(description && { description }),
      ...(bulletPoints && { bulletPoints }),
      ...(duration && { duration }),
      ...(fees !== undefined && { fees }),
      ...(category && { category }),
      ...(parsedTimeSlots && { timeSlots: parsedTimeSlots }),
      ...(coverPhoto && { coverPhoto }), // new image saved here
    };

    await this.sessionRepo.update(
      { _id: sessionId },
      updateData
    );

    return this.sessionRepo.findOne({ _id: sessionId });
  }


  async getInstructorSessions(instructorId: string) {
    return this.sessionRepo.findByInstructor({ instructorId, isArchived: false });
  }


  async getArchivedSessions(instructorId: string) {
    const sessions = await this.sessionRepo.findByInstructor({ instructorId,isArchived: true,});
    return sessions;
  }


  async toggleArchiveStatus(
    sessionId: string,
    instructorId: string,
    isArchived: boolean
  ) {
    const session = await this.sessionRepo.findOne({
      _id: sessionId,
      instructorId, 
    });

    if (!session) {
      logger.warn("Session not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
    }

    if (session.isArchived === isArchived) {
      return session; 
    }

    await this.sessionRepo.update({ _id: sessionId },
      { isArchived }
    );

    return this.sessionRepo.findOne({ _id: sessionId });
  }

}
