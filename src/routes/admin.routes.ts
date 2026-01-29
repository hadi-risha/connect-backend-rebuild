import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Role } from "../constants/roles.enum";
import { roleGuard } from "../middlewares/roleGuardMiddleware";
import { createNotification, getAdminDashboard, getAiRatings, 
  getAllUsers, getNotifications, toggleBlockUser, toggleNotificationVisibility, 
  toggleUserRole, updateNotification } from "../controllers/AdminController";

const router = Router();
router.use(authMiddleware, roleGuard(Role.ADMIN));

router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-role", toggleUserRole);
router.patch("/users/:id/toggle-block", toggleBlockUser);
router.get("/ai-ratings", getAiRatings);
router.get("/notifications", getNotifications);
router.post("/notifications", createNotification);
router.patch("/notifications/:id", updateNotification);
router.patch("/notifications/:id/toggle-visibility", toggleNotificationVisibility);
router.get("/dashboard", getAdminDashboard);


export const adminRoutes = router;
