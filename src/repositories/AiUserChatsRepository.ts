import { BaseRepository } from "./BaseRepository";
import { AiUserChatsModel, IAiUserChats } from "../models/AiUserChats.model";
import { Types } from "mongoose";
import { IAiUserChatsRepository } from "./interfaces/IAiUserChatsRepository";

export class AiUserChatsRepository extends BaseRepository<IAiUserChats> implements IAiUserChatsRepository {
  constructor() {
    super(AiUserChatsModel);
  }

  async addChatToUser(
    userId: string,
    chatId: string,
    title: string
  ) {
    return this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $push: {
          chats: {
            _id: chatId,
            title,
            createdAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );
  }


  async getChatsByUserId(userId: string) {
    return this.findOne({
      userId: new Types.ObjectId(userId),
    });
  }
}
