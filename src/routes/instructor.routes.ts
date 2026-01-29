import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Role } from "../constants/roles.enum";
import { roleGuard } from "../middlewares/roleGuardMiddleware";
import { createSession, getArchivedSessions, getInstructorBookings, getInstructorSessions, getSingleSession, toggleSessionArchive, updateSession } from "../controllers/InstructorController";

const router = Router();
router.use(authMiddleware, roleGuard(Role.INSTRUCTOR));

router.post("/session", createSession );
router.get("/session/:sessionId", getSingleSession);
router.patch("/session/:sessionId", updateSession);
router.get("/bookings/:status", getInstructorBookings);

router.get("/sessions", getInstructorSessions); //my-sessions (all instructors session is in user rout)
router.get("/sessions/archived", getArchivedSessions);
router.patch("/session/:sessionId/archive", toggleSessionArchive); //body: { isArchived: true | false }

export const instructorRoutes = router;
