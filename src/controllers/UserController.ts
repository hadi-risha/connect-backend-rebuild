import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { StatusCodes } from "../constants/statusCodes.enum";
import imagekit from "../integrations/imagekit";
import { ApiError } from "../common/errors/ApiError";
import { config } from "../config";
import { AiChatParam, SessionIdParam } from "./interfaces/IRequestParams";

const userService = new UserService();

export const getImageKitAuth = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const authParams = imagekit.getAuthenticationParameters();
  console.log("ImageKit auth generated", {
    userId: req.user.id,
    publicKey: config.imagekit.publicKey,
    expire: authParams.expire,
    tokenLength: authParams.token?.length,
    signatureLength: authParams.signature?.length,
  })

  res.status(StatusCodes.OK).json(authParams);
};


export const switchRole = async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const result = await userService.switchRole(userId, req.body);

  res.status(StatusCodes.OK).json({
    message: "Role updated successfully",
    user: result,
  });
};


export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const updatedUser = await userService.updateProfile(userId, req.body);

  res.status(StatusCodes.OK).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
};


export const getAllActiveSessions = async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  const role = req?.user?.role;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const sessions = await userService.getAllActiveSessions(userId, role);

  res.status(StatusCodes.OK).json({
    message: "Active sessions fetched successfully",
    sessions,
  });
};


export const getSingleSession = async (req: Request<SessionIdParam>, res: Response) => {
  const { sessionId } = req.params;
  const userId = req?.user?.id;
  const role = req?.user?.role;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const session = await userService.getSingleSession(sessionId, userId, role);

  res.status(StatusCodes.OK).json({message: "session fetched successfully", session });
};


export const searchSessions = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const q = req.query.q as string;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  if (!q || !q.trim()) {
    return res.status(200).json({ results: [] });
  }
  const results = await userService.searchSessions(userId, role, q);

  res.status(StatusCodes.OK).json({
    message: "Search results",
    results,
  });
};


export const createAiChat = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { text } = req.body;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const result = await userService.createAiChat(userId, text);

  res.status(StatusCodes.CREATED).json({
    message: "AI chat created successfully",
    result,
  });
};


export const fetchAiChatlist = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const chats = await userService.fetchAiChatList(userId);

  return res.status(StatusCodes.OK).json({
    message: "User AI chat list fetched successfully",
    userChats: chats,
  });
};


export const fetchSingleAiChat = async (
  req: Request<AiChatParam>,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const chatId = req.params.id;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const chat = await userService.fetchSingleAiChat(userId, chatId);

  return res.status(StatusCodes.OK).json({
    message: "User AI chat fetched successfully",
    chat,
  });
};


export const updateExistingAiChat = async (
  req: Request<AiChatParam>,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const chatId = req.params.id;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const { question, answer, img } = req.body;
  const updated = await userService.updateExistingAiChat(userId, chatId, {
    question,
    answer,
    img,
  });

  return res.status(StatusCodes.OK).json({
    message: "User AI conversation added successfully", updatedChat: updated
  });
};


export const aiRating = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { rating } = req.body;
  if (!userId || !role) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  await userService.submitAiRating(userId, rating);

  return res.status(StatusCodes.CREATED).json({
    message: "Rating submitted successfully!",
  });
};



export const getActiveNotifications = async (req: Request, res: Response) => {
  const notifications = await userService.getActiveNotifications();

  res.status(StatusCodes.OK).json({
    message: "Notifications fetched",
    data: notifications,
  });
};



