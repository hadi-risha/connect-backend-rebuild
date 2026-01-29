import { BaseRepository } from "./BaseRepository";
import { AiChatModel, IAiChat } from "../models/AiChat.model";
import { Types } from "mongoose";
import { IAiChatRepository } from "./interfaces/IAiChatRepository";

export class AiChatRepository extends BaseRepository<IAiChat> implements IAiChatRepository {
  constructor() {
    super(AiChatModel);
  }

  createChat(userId: string, firstMessage: string) {
    return this.create({
      userId: new Types.ObjectId(userId),
      history: [
        {
          role: "user",
          parts: [{ text: firstMessage }],
        },
      ],
    });
  }


  async findChatByIdAndUser(chatId: string, userId: string) {
    return this.findOne({
      _id: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
    });
  }


  async appendToChatHistory(
    chatId: string,
    userId: string,
    items: any[]
  ) {
    return this.model.updateOne(
      {
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
      },
      {
        $push: {
          history: {
            $each: items,
          },
        },
      }
    );
  }


  async existsByIdAndUser(chatId: string, userId: string) {
    return this.findOne({
      _id: new Types.ObjectId(chatId),
      userId: new Types.ObjectId(userId),
    });
  }

}
