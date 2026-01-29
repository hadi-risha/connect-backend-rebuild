import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getMessages,
  deleteMessage,
  sendMessage,
  reactToMessage,
} from "../controllers/MessageController";
import { Role } from "../constants/roles.enum";
import { roleGuard } from "../middlewares/roleGuardMiddleware";

export const messageRoutes = Router();
messageRoutes.use(authMiddleware, roleGuard(Role.STUDENT, Role.INSTRUCTOR));

messageRoutes.get("/:chatRoomId", getMessages);
messageRoutes.post("/", sendMessage);
messageRoutes.post("/:messageId/react", reactToMessage);
messageRoutes.delete("/:messageId", deleteMessage);
