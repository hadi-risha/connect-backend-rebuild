import { Router } from "express";
import passport from "passport";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { adminLogin, forgotPassword, googleCallback, login, 
    logout, refreshToken, register, resendOtp, resetPassword, 
    validateResetToken, verifyOtp } from "../controllers/AuthController";
import { googleAuthCallback } from "../middlewares/googleAuth.middleware";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword)
router.post("/validate-reset-token", validateResetToken)
router.post("/reset-password", resetPassword)

// redirect to google
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"], session: false}) );  
// google callback
router.get("/google/callback", googleAuthCallback, googleCallback);

router.post("/refresh", refreshToken);  
router.post("/admin/login", adminLogin);
router.post("/logout", logout);   


export const authRoutes = router;


