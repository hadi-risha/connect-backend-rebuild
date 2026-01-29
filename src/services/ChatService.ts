import { Types } from "mongoose";
import { ChatRepository } from "../repositories/ChatRepository";
import { IChatService } from "./interfaces/IChatService";
import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ChatType } from "../constants/chatType.enum";
import imagekit from "../integrations/imagekit";
import { logger } from "../common/utils/logger";



export class ChatService implements IChatService {
  private chatRepo = new ChatRepository();

  async createOneToOneChat(
    currentUserId: string,
    targetUserId: string
  ) {
    if (currentUserId === targetUserId) {
      logger.warn("Attempted to create one-to-one chat with self", { userId: currentUserId });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot create chat with yourself"
      );
    }

    let chat = await this.chatRepo.findOneToOneChat(
      currentUserId,
      targetUserId
    );

    if (!chat) {
      chat = await this.chatRepo.createOneToOneChat(
        currentUserId,
        targetUserId
      );
    }

    return chat;
  }

 
  // Get user's chat list
  async getUserChats(userId: string) {
    const chats = await this.chatRepo.getUserChats(userId);
    logger.info(`Fetched user chat list`, { userId, chatCount: chats?.length ?? 0 });

    return chats;
  }


  async createGroupChat(
    creatorId: string,
    name: string,
    image?: { key?: string; url?: string },
    description?: string
  ) {
    const groupChat =  this.chatRepo.create({
      type: ChatType.GROUP,
      owner: new Types.ObjectId(creatorId),
      admins: [new Types.ObjectId(creatorId)],
      members: [new Types.ObjectId(creatorId)],
      name,
      image,
      description,
      isPublic: true,
    });
    logger.info("Group chat created successfully", { groupId: groupChat._id, creatorId });

    return groupChat;
  }


  // Validate user is member of chat
  async validateMembership(chatRoomId: string, userId: string) {
    const chat = await this.chatRepo.findOne({
      _id: chatRoomId,
      members: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chat) {
      logger.warn("Chat access denied - user not a member or chat deleted");
      throw new ApiError(StatusCodes.FORBIDDEN, "Access denied");
    }

    return chat;
  }


  async validateAdmin(chatRoomId: string, userId: string) {
    const chat = await this.validateMembership(chatRoomId, userId);

    if (
      chat.type !== ChatType.GROUP ||
      !chat.admins?.some((id: Types.ObjectId) => id.toString() === userId)
    ) {
      logger.warn("Admin validation failed - insufficient privileges");
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Admin privileges required"
      );
    }

    return chat;
  }

  
  // admin or self join
  async addMembers(
    chatRoomId: string,
    requesterId: string,
    newUserIds?: string[]
  ) {
    const chat = await this.chatRepo.findById(chatRoomId);
    if (!chat) {
      logger.warn("Add members failed - chat not found", { chatRoomId, requesterId });
      throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");
    }

    const isAdmin = chat.admins?.some(
      (id: Types.ObjectId) => id.toString() === requesterId
    );

    const isMember = chat.members.some(
      (id: Types.ObjectId) => id.toString() === requesterId
    );

    let idsToAdd: string[] = [];

    // CASE 1: ADMIN ADDING MEMBERS
    if (isAdmin) {
      if (!newUserIds || newUserIds.length === 0) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Admin must provide users to add"
        );
      }

      idsToAdd = newUserIds;
    }

    // CASE 2: SELF JOIN (public group)
    else {
      if (!chat.isPublic) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Only admins can add members"
        );
      }

      if (isMember) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Already a member");
      }

      idsToAdd = [requesterId]; // only self
    }

    return this.chatRepo.addMembers(chatRoomId, idsToAdd);
  }


  async getGroupChatById(chatId: string) {
    const chat = await this.chatRepo.findByIdWithMembers(chatId);

    if (!chat) {
        logger.warn("Group chat not found", { chatId });
    } else {
        logger.info("Fetched group chat with members", { chatId, memberCount: chat.members?.length ?? 0 });
    }

    return chat;
  }



  async removeMember(
    chatRoomId: string,
    adminId: string,
    userIdToRemove: string
  ) {
    const chat = await this.validateAdmin(chatRoomId, adminId);

    // Prevent removing last admin
    if (
      chat.admins?.length === 1 &&
      chat.admins[0].toString() === userIdToRemove
    ) {
      logger.warn("Attempted to remove last admin from group", { chatRoomId, adminId, userIdToRemove });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Group must have at least one admin"
      );
    }

    return this.chatRepo.removeMember(chatRoomId, userIdToRemove);
  }


  async leaveGroup(chatRoomId: string, userId: string) {
    const chat = await this.validateMembership(chatRoomId, userId);

    const isAdmin = chat.admins?.some(
        (id: Types.ObjectId) => id.toString() === userId
    );

    if (isAdmin && chat.admins!.length === 1) {
      logger.warn("Admin attempted to leave group without assigning another admin", { chatRoomId, userId });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Assign another admin before leaving"
      );
    }

    return this.chatRepo.removeMember(chatRoomId, userId);
  }


  async deleteGroup(chatId: string, adminId: string) {
    const chat = await this.validateAdmin(chatId, adminId);
    await this.chatRepo.deleteChat(chatId);
    logger.info("Group chat deleted successfully", { chatId, deletedBy: adminId });
  }


  async markChatRead(chatRoomId: string, userId: string, messageId: string) {
    await this.validateMembership(chatRoomId, userId);

    return this.chatRepo.updateReadState(
      chatRoomId,
      userId,
      messageId
    );
  }


  async getNonChattedUsers(userId: string, q?: string) {
    const users = await this.chatRepo.getNonChattedUsers(userId, q);
    logger.info("Fetched non-chatted users", { userId, resultCount: users?.length ?? 0, query: q });

    return users;
  }


  async getNonJoinedPublicGroups(userId: string, q?: string) {
    const groups = await this.chatRepo.getNonJoinedPublicGroups(userId, q);
    logger.info("Fetched non-joined public groups", { userId, resultCount: groups?.length ?? 0, query: q });

    return groups;
  }


  async getChatById(chatId: string) {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      logger.warn("Chat not found", { chatId });
      throw new ApiError(StatusCodes.NOT_FOUND, "Chat not found");
    }
    return chat;
  }


  async updateGroup(
    chatId: string,
    userId: string,
    payload: {
      name?: string;
      description?: string;
      image?: { key: string; url: string };
      removeOldImage?: boolean;
    }
  ) {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      logger.warn("Update group failed - group not found", { chatId, userId });
      throw new ApiError(StatusCodes.NOT_FOUND, "Group not found");
    }

    // Only owner or admin can update group
    if (!chat.owner?.equals(userId) && !(chat.admins?.some((a: any) => a.equals(userId)))) {
      logger.warn("Update group failed - insufficient privileges", { chatId, userId });
      throw new ApiError(StatusCodes.FORBIDDEN, "You are not allowed to update this group");
    }

    const update: any = {};
    const unset: any = {};

    if (payload.name !== undefined) update.name = payload.name;
    if (payload.description !== undefined) update.description = payload.description;

    // Image handling
    if (payload.image) {
      if (chat.image?.key) await imagekit.deleteFile(chat.image.key); // delete old
      update.image = payload.image;
    } else if (payload.removeOldImage && chat.image?.key) {
      await imagekit.deleteFile(chat.image.key); // delete old
      unset.image = "";
    }

    await this.chatRepo.update(
      { _id: chatId },
      {
        ...(Object.keys(update).length && { $set: update }),
        ...(Object.keys(unset).length && { $unset: unset }),
      }
    );

    return this.chatRepo.findById(chatId);
  }


}
