import { ISession } from "../../models/Session.model";

export interface ISessionService {
  createSession(instructorId: string, payload: Partial<ISession>): Promise<any>;

  getSingleSession(sessionId: string, instructorId: string): Promise<any>;

  updateSession(
    sessionId: string,
    instructorId: string,
    payload: Partial<ISession> & { imageRemoved?: boolean }
  ): Promise<any>;

  getInstructorSessions(instructorId: string): Promise<any[]>;

  getArchivedSessions(instructorId: string): Promise<any[]>;

  toggleArchiveStatus(
    sessionId: string,
    instructorId: string,
    isArchived: boolean
  ): Promise<any>;
}
