import { IBaseRepository } from "./IBaseRepository";
import { IMessage } from "../../models/Message.model";

export interface IMessageRepository extends IBaseRepository<IMessage> {
  createMessage(data: Partial<IMessage>): any;

  getChatMessages(
    chatRoomId: string,
    limit?: number,
    skip?: number
  ): any;

  markAsRead(chatRoomId: string, userId: string): any;

  toggleReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): any;

  softDeleteMessage(messageId: string, userId: string): any;
}
