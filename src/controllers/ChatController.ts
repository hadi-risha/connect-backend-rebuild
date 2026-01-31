import { Request, Response } from "express";
import { ChatService } from "../services/ChatService";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ApiError } from "../common/errors/ApiError";
import { ChatParam } from "./interfaces/IRequestParams";

const chatService = new ChatService();

// Get user chat list
export const getMyChats = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const chats = await chatService.getUserChats(userId);

  res.status(StatusCodes.OK).json({ chats });
};

// create 1-to-1 chat
export const createChat = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { targetUserId } = req.body;

  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const chat = await chatService.createOneToOneChat(
    userId,
    targetUserId
  );

  res.status(StatusCodes.OK).json({ chat });
};


// Create group chat
export const createGroupChat = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const {  name, image, description } = req.body;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const chat = await chatService.createGroupChat(
    userId,
    name,
    image,
    description,
  );

  res.status(StatusCodes.CREATED).json({ chat });
};


export const addGroupMember = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chatRoomId, newUserIds } = req.body;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");

  await chatService.addMembers(chatRoomId, userId, newUserIds);
  const updatedChat = await chatService.getGroupChatById(chatRoomId);

  res.status(StatusCodes.OK).json({
    message: "Member(s) added",
    chat: updatedChat,
  });
};


export const removeGroupMember = async (req: Request, res: Response) => {
  const adminId = req.user?.id;
  const { chatRoomId, userIdToRemove } = req.body;
  if (!adminId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  await chatService.removeMember(chatRoomId, adminId, userIdToRemove);

  res.status(StatusCodes.OK).json({ message: "Member removed" });
};


export const leaveGroup = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chatRoomId } = req.body;
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  await chatService.leaveGroup(chatRoomId, userId);

  res.status(StatusCodes.OK).json({ message: "Left group" });
};


export const deleteGroupChat = async (req: Request<ChatParam>, res: Response) => {
  const adminId = req.user?.id;
  const { chatId } = req.params;
  if (!adminId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  await chatService.deleteGroup(chatId, adminId);

  res.status(StatusCodes.OK).json({ message: "Group deleted" });
};


export const markChatRead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { chatRoomId, messageId } = req.body;
  await chatService.markChatRead(chatRoomId, userId, messageId);

  res.status(200).json({ success: true });
};


export const getDiscoverUsers = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const q = req.query.q as string;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const users = await chatService.getNonChattedUsers(userId, q);

  res.status(200).json({ users });
};


export const getDiscoverGroups = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const q = req.query.q as string;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const groups = await chatService.getNonJoinedPublicGroups(userId, q);

  res.status(200).json({ groups });
};


export const getChatDetail = async (req: Request<ChatParam>, res: Response) => {
  const chatId = req.params.chatId;
  const chat = await chatService.getChatById(chatId);

  res.status(StatusCodes.OK).json({ group: chat });
};


export const updateGroupChat = async (req: Request<ChatParam>, res: Response) => {
  const chatId = req.params.chatId;
  const userId = req.user?.id;
  if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });

  const payload = req.body; 

  try {
    const updatedGroup = await chatService.updateGroup(chatId, userId, payload);
    res.status(StatusCodes.OK).json({ chat: updatedGroup });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Failed to update group" });
  }
};

