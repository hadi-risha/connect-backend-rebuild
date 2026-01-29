import { IBaseRepository } from "./IBaseRepository";
import { IAiUserChats } from "../../models/AiUserChats.model";

export interface IAiUserChatsRepository
  extends IBaseRepository<IAiUserChats> {
  addChatToUser(
    userId: string,
    chatId: string,
    title: string
  ): any;

  getChatsByUserId(userId: string): any;
}
