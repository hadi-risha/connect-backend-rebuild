import { Request, Response } from "express";
import { MessageService } from "../services/MessageService";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ApiError } from "../common/errors/ApiError";

const messageService = new MessageService();

export const getMessages = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { chatRoomId } = req.params;
  const limit = Number(req.query.limit ?? 30);
  const skip = Number(req.query.skip ?? 0);

  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const messages = await messageService.getMessages(
    chatRoomId,
    userId,
    limit,
    skip
  );

  res.status(StatusCodes.OK).json({ messages });
};


export const deleteMessage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { messageId } = req.params;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  await messageService.deleteMessage(messageId, userId);

  res.status(StatusCodes.OK).json({ message: "Message deleted" });
};


export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  const message = await messageService.sendMessage({
    senderId: userId,
    ...req.body,
  });

  res.status(StatusCodes.CREATED).json({ message });
};


export const reactToMessage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { messageId } = req.params;
  const { emoji } = req.body;
  if (!userId) throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  await messageService.reactToMessage(messageId, userId, emoji);

  res.status(StatusCodes.OK).json({ message: "Reaction updated" });
};


