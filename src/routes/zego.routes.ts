import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { authMiddleware } from "../middlewares/authMiddleware";
import { joinVideoSession } from "../controllers/ZegoController";

const router = Router();

router.post("/join", authMiddleware, joinVideoSession);

export const zegoRoutes = router;
