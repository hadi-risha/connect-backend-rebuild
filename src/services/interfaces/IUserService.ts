// import { Role } from "../constants/roles.enum";
// import { SwitchRolePayload } from "../interfaces/SwitchRolePayload";

import { Role } from "../../constants/roles.enum";
import { SwitchRolePayload } from "../../interfaces/SwitchRolePayload";

export interface IUserService {
  switchRole(userId: string, payload: SwitchRolePayload): Promise<any>;
  updateProfile(
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
  ): Promise<any>;

  getAllActiveSessions(userId: string, role: Role): Promise<any[]>;
  getSingleSession(sessionId: string, userId: string, role: Role): Promise<any>;
  searchSessions(userId: string, role: Role, query: string): Promise<any[]>;

  createAiChat(userId: string, text: string): Promise<{
    chatId: string;
    title: string;
    createdAt: Date;
  }>;

  fetchAiChatList(userId: string): Promise<any[]>;
  fetchSingleAiChat(userId: string, chatId: string): Promise<any>;
  updateExistingAiChat(
    userId: string,
    chatId: string,
    payload: { question?: string; answer: string; img?: string }
  ): Promise<{ success: boolean }>;

  submitAiRating(userId: string, rating: number): Promise<{ success: boolean }>;

  getActiveNotifications(): Promise<any[]>;
}
