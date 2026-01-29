import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getMyChats,
  createChat,
  createGroupChat,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  markChatRead,
  getDiscoverUsers,
  getDiscoverGroups,
  getChatDetail,
  updateGroupChat,
  deleteGroupChat,
} from "../controllers/ChatController";
import { roleGuard } from "../middlewares/roleGuardMiddleware";
import { Role } from "../constants/roles.enum";

export const chatRoutes = Router();
chatRoutes.use(authMiddleware, roleGuard(Role.STUDENT, Role.INSTRUCTOR)); 

chatRoutes.get("/", getMyChats); //chatList
chatRoutes.post("/one-to-one", createChat);
chatRoutes.post("/group", createGroupChat);
chatRoutes.post("/group/add", addGroupMember);  // admin(multi people allowed) OR self-join
chatRoutes.post("/group/remove", removeGroupMember);  // admin only
chatRoutes.post("/group/leave", leaveGroup);   // self
chatRoutes.delete("/group/:chatId", deleteGroupChat);
chatRoutes.put("/group/:chatId", updateGroupChat); 

chatRoutes.post("/read", markChatRead);
chatRoutes.get("/discover/users", getDiscoverUsers);
chatRoutes.get("/discover/groups", getDiscoverGroups);
chatRoutes.get("/:chatId", getChatDetail); // get single chat/group details
