import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { aiRating, createAiChat, fetchAiChatlist, fetchSingleAiChat, getActiveNotifications, getAllActiveSessions, getSingleSession, getUserProfile, searchSessions, switchRole, updateExistingAiChat, updateProfile } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleGuard } from "../middlewares/roleGuardMiddleware";
import { Role } from "../constants/roles.enum";
import { getImageKitAuth } from "../controllers/UserController";

const router = Router();
router.use(authMiddleware); 

router.get("/imagekit-auth", roleGuard(Role.ADMIN, Role.STUDENT, Role.INSTRUCTOR), getImageKitAuth); //This endpoint is called by frontend before upload. ImageKit requires auth parameters from backend.
router.get("/profile", roleGuard(Role.ADMIN, Role.STUDENT, Role.INSTRUCTOR), getUserProfile); //This endpoint is called by frontend before upload. ImageKit requires auth parameters from backend.

router.use(roleGuard(Role.STUDENT, Role.INSTRUCTOR)); 

router.post("/switch-role", switchRole );
router.put("/profile", updateProfile );
router.get("/sessions/all", getAllActiveSessions );
router.get("/session/:sessionId", getSingleSession);
router.get("/sessions/search", searchSessions);
router.post('/ai/chat', createAiChat); 
router.get('/ai/chats', fetchAiChatlist); 
router.get('/ai/chat/:id', fetchSingleAiChat);
router.put('/ai/chat/:id', updateExistingAiChat); 
router.post('/ai/rating', aiRating); 
router.get('/notifications', getActiveNotifications); 

export const userRoutes = router;