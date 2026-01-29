export interface IChatService {
  createOneToOneChat(currentUserId: string, targetUserId: string): Promise<any>;
  getUserChats(userId: string): Promise<any>;
  createGroupChat(
    creatorId: string,
    name: string,
    image?: { key?: string; url?: string },
    description?: string
  ): Promise<any>;
  validateMembership(chatRoomId: string, userId: string): Promise<any>;
  validateAdmin(chatRoomId: string, userId: string): Promise<any>;
  addMembers(chatRoomId: string, requesterId: string, newUserIds?: string[]): Promise<any>;
  getGroupChatById(chatId: string): Promise<any>;
  removeMember(chatRoomId: string, adminId: string, userIdToRemove: string): Promise<any>;
  leaveGroup(chatRoomId: string, userId: string): Promise<any>;
  deleteGroup(chatId: string, adminId: string): Promise<void>;
  markChatRead(chatRoomId: string, userId: string, messageId: string): Promise<any>;
  getNonChattedUsers(userId: string, q?: string): Promise<any>;
  getNonJoinedPublicGroups(userId: string, q?: string): Promise<any>;
  getChatById(chatId: string): Promise<any>;
  updateGroup(
    chatId: string,
    userId: string,
    payload: {
      name?: string;
      description?: string;
      image?: { key: string; url: string };
      removeOldImage?: boolean;
    }
  ): Promise<any>;
}
