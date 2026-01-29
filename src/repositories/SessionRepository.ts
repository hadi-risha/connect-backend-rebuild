import { Types } from "mongoose";
import { SessionModel, ISession } from "../models/Session.model";
import { BaseRepository } from "./BaseRepository";
import { ISessionRepository } from "./interfaces/ISessionRepository";

export class SessionRepository extends BaseRepository<ISession> implements ISessionRepository {
  constructor() {
    super(SessionModel);
  }


  findByInstructor(filter: any) {
    return this.model.find(filter);
  }


  getActiveUnbookedSessions(excludedSessionIds: Types.ObjectId[]) {
    return this.model
      .find({
        isArchived: false,
        _id: { $nin: excludedSessionIds },
      })
  }


  searchSessions(regex: RegExp) {
    return this.model.find({
      isArchived: false,
      $or: [
        { title: regex },
        { introduction: regex },
        { description: regex },
        { category: regex },
      ],
    }).lean();
  }
}