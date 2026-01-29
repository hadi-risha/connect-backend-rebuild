import { Types } from "mongoose";
import { MessageRepository } from "../repositories/MessageRepository";
import { ChatRepository } from "../repositories/ChatRepository";
import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";
import { IMessageService } from "./interfaces/IMessageService";
import { logger } from "../common/utils/logger";

export class MessageService implements IMessageService {
  private messageRepo = new MessageRepository();
  private chatRepo = new ChatRepository();

  async sendMessage({
    chatRoomId,
    senderId,
    type,
    image,
    audio,
    content,
    replyTo,
  }: {
    chatRoomId: string;
    senderId: string;
    type?: "text" | "image" | "audio";
    image: {url:string; key:string};
    audio: {url:string; key:string};
    content?: string;
    replyTo?: string;
  }) {
    const finalType = type ?? "text";

    if (finalType === "text" && !content) {
      logger.warn("Text message cannot be empty")
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Text message cannot be empty"
      );
    }

    const message = await this.messageRepo.createMessage({
      chatRoom: new Types.ObjectId(chatRoomId),
      sender: new Types.ObjectId(senderId),
      type: finalType, 
      content,
      replyTo: replyTo ? new Types.ObjectId(replyTo) : undefined,
    });

    await this.chatRepo.updateLastMessage(chatRoomId, message._id.toString());
    await this.chatRepo.updateLastRead(
      chatRoomId,
      senderId,
      message._id.toString()
    );

    return message;
  }


  async getMessages(chatRoomId: string, userId: string, limit = 30, skip = 0) {
    const chat = await this.chatRepo.findOne({
      _id: chatRoomId,
      members: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chat) {
      logger.warn("Access denied")
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied");
    }

    return this.messageRepo.getChatMessages(chatRoomId, limit, skip);
  }


  async reactToMessage(
    messageId: string,
    userId: string,
    emoji: string
  ) {
    const message = await this.messageRepo.toggleReaction(
      messageId,
      userId,
      emoji
    );

    if (!message) {
      logger.warn("Message not found")
      throw new ApiError(StatusCodes.NOT_FOUND, "Message not found");
    }

    return message;
  }


  async deleteMessage(messageId: string, userId: string) {
    const result = await this.messageRepo.softDeleteMessage(messageId, userId);

    if (result.matchedCount === 0) {
      logger.warn("Cannot delete message")
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot delete this message"
      );
    }
  }
}
