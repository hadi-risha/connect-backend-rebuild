import { IBaseRepository } from "./IBaseRepository";
import { ISession } from "../../models/Session.model";
import { Types } from "mongoose";

export interface ISessionRepository extends IBaseRepository<ISession> {
  findByInstructor(filter: any): any;

  getActiveUnbookedSessions(
    excludedSessionIds: Types.ObjectId[]
  ): any;

  searchSessions(regex: RegExp): any;
}
