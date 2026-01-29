import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { MessageModel, IMessage, IMessageReaction } from "../models/Message.model";
import { IMessageRepository } from "./interfaces/IMessageRepository";

export class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository {
  constructor() {
    super(MessageModel);
  }

  createMessage(data: Partial<IMessage>) {
    return this.create(data);
  }

  // Get messages for chat (latest first)
  getChatMessages(chatRoomId: string, limit = 30, skip = 0) {
    return this.model
      .find({
        chatRoom: new Types.ObjectId(chatRoomId),
        isDeleted: false,
      })
      .populate("sender", "name profilePicture")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }


  markAsRead(chatRoomId: string, userId: string) {
    return this.model.updateMany(
      {
        chatRoom: new Types.ObjectId(chatRoomId),
        readBy: { $ne: new Types.ObjectId(userId) },
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
      }
    );
  }

  async toggleReaction(
    messageId: string,
    userId: string,
    emoji: string
  ) {
    const message = await this.model.findById(messageId);
    if (!message) return null;

    if (!message.reactions) {
      message.reactions = [];
    }

    message.reactions.forEach((r: IMessageReaction) => {
      r.users = r.users.filter(
        (id: Types.ObjectId) => id.toString() !== userId
      );
    });

    const target = message.reactions.find(
      (r: IMessageReaction) => r.emoji === emoji
    );

    if (target) {
      target.users.push(new Types.ObjectId(userId));
    } else {
      message.reactions.push({
        emoji,
        users: [new Types.ObjectId(userId)],
      });
    }

    message.reactions = message.reactions.filter(
      (r: IMessageReaction) => r.users.length > 0
    );

    await message.save();
    return message;
  }


  softDeleteMessage(messageId: string, userId: string) {
    return this.model.updateOne(
      {
        _id: messageId,
        sender: new Types.ObjectId(userId),
      },
      {
        $set: {
          isDeleted: true,
          content: "🚫 This message was deleted",
          image: null,
          audio: null,
          reactions: [],
        },
      }
    );
  }
}
