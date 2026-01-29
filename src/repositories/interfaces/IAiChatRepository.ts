import { IBaseRepository } from "./IBaseRepository";
import { IAiChat } from "../../models/AiChat.model";

export interface IAiChatRepository extends IBaseRepository<IAiChat> {
  createChat(userId: string, firstMessage: string): any;

  findChatByIdAndUser(chatId: string, userId: string): any;

  appendToChatHistory(
    chatId: string,
    userId: string,
    items: any[]
  ): any;

  existsByIdAndUser(chatId: string, userId: string): any;
}
