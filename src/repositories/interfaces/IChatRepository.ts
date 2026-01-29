import { IBaseRepository } from "./IBaseRepository";
import { IChatRoom } from "../../models/ChatRoom.model";

export interface IChatRepository extends IBaseRepository<IChatRoom> {
  findOneToOneChat(userA: string, userB: string): any;

  createOneToOneChat(userA: string, userB: string): any;

  getUserChats(userId: string): any;

  updateLastMessage(chatRoomId: string, messageId: string): any;

  addMembers(chatRoomId: string, userIds: string[]): any;

  findByIdWithMembers(chatId: string): any;

  removeMember(chatRoomId: string, userId: string): any;

  deleteChat(chatId: string): any;

  addAdmin(chatRoomId: string, userId: string): any;

  removeAdmin(chatRoomId: string, userId: string): any;

  updateReadState(
    chatRoomId: string,
    userId: string,
    messageId: string
  ): any;

  updateLastRead(
    chatRoomId: string,
    userId: string,
    messageId: string
  ): any;

  getNonChattedUsers(userId: string, q?: string): any;

  getNonJoinedPublicGroups(userId: string, q?: string): any;
}
