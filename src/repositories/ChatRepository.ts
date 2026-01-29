import { Types } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { ChatRoomModel, IChatRoom } from "../models/ChatRoom.model";
import { ChatType } from "../constants/chatType.enum";
import { generateOneToOneKey } from "../common/utils/oneToOneKey";
import { UserModel } from "../models/User.model";
import { IChatRepository } from "./interfaces/IChatRepository";

export class ChatRepository extends BaseRepository<IChatRoom> implements IChatRepository {
  constructor() {
    super(ChatRoomModel);
  }

  findOneToOneChat(userA: string, userB: string) {
    const key = generateOneToOneKey(userA, userB);

    return this.model.findOne({
      type: ChatType.ONE_TO_ONE,
      oneToOneKey: key,
      isDeleted: false,
    });
  }


  createOneToOneChat(userA: string, userB: string) {
    const key = generateOneToOneKey(userA, userB);

    return this.create({
      type: ChatType.ONE_TO_ONE,
      members: [
        new Types.ObjectId(userA),
        new Types.ObjectId(userB),
      ],
      oneToOneKey: key,
    });
  }
  

  // Get chat list for sidebar
  getUserChats(userId: string) {
    return this.model
      .find({
        members: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .populate("lastMessage")
      .populate("members", "name email profilePicture")
      .populate("admins", "name email")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });
  }


  updateLastMessage(chatRoomId: string, messageId: string) {
    return this.model.updateOne(
      { _id: chatRoomId },
      { $set: { lastMessage: messageId } }
    );
  }


  addMembers(chatRoomId: string, userIds: string[]) {
    return this.model.updateOne(
      { _id: chatRoomId },
      {
        $addToSet: {
          members: {
            $each: userIds.map(id => new Types.ObjectId(id)),
          },
        },
      }
    );
  }


  findByIdWithMembers(chatId: string) {
    return this.model
      .findById(chatId)
      .populate("members", "name email profilePicture")
      .populate("admins", "name email profilePicture")
      .lean();
  }


  removeMember(chatRoomId: string, userId: string) {
    return this.model.updateOne(
      { _id: chatRoomId },
      {
        $pull: {
          members: new Types.ObjectId(userId),
          admins: new Types.ObjectId(userId),
        },
      }
    );
  }


  deleteChat(chatId: string) {
    return this.model.findByIdAndDelete(chatId);
  }


  addAdmin(chatRoomId: string, userId: string) {
    return this.model.updateOne(
      { _id: chatRoomId },
      { $addToSet: { admins: new Types.ObjectId(userId) } }
    );
  }

 
  removeAdmin(chatRoomId: string, userId: string) {
    return this.model.updateOne(
      { _id: chatRoomId },
      { $pull: { admins: new Types.ObjectId(userId) } }
    );
  }


  updateReadState(chatRoomId: string, userId: string, messageId: string) {
    return this.model.updateOne(
      { _id: chatRoomId, "lastRead.user": userId },
      {
        $set: {
          "lastRead.$.message": messageId,
          "lastRead.$.readAt": new Date(),
        },
      },
      { upsert: true }
    );
  }


  updateLastRead(chatRoomId: string, userId: string, messageId: string) {
    return this.model.updateOne(
      { _id: chatRoomId },
      {
        $pull: { lastRead: { user: new Types.ObjectId(userId) } },
      }
    ).then(() =>
      this.model.updateOne(
        { _id: chatRoomId },
        {
          $addToSet: {
            lastRead: {
              user: new Types.ObjectId(userId),
              message: new Types.ObjectId(messageId),
              readAt: new Date(),
            },
          },
        }
      )
    );
  }


  async getNonChattedUsers(userId: string, q?: string) {
    const oneToOneChats = await this.model.find({
      type: ChatType.ONE_TO_ONE,
      members: new Types.ObjectId(userId),
    });

    const chattedUserIds = oneToOneChats
      .flatMap((chat: any) => chat.members)
      .filter( (id: Types.ObjectId) => id.toString() !== userId);

    const query: any = {
      _id: {
        $nin: [new Types.ObjectId(userId), ...chattedUserIds],
      },
      isBlocked: false,
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    return UserModel.find(query)
      .select("name email profilePicture")
      .limit(30);
  }


  async getNonJoinedPublicGroups(userId: string, q?: string) {
    const query: any = {
      type: ChatType.GROUP,
      isPublic: true,
      members: { $ne: new Types.ObjectId(userId) },
    };

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    return this.model
      .find(query)
      .select("name description image")
      .limit(30);
  }
}
