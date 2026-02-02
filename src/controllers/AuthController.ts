import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";
import { StatusCodes } from "../constants/statusCodes.enum";
import { config } from "../config";
import { ApiError } from "../common/errors/ApiError";

const authService = new AuthService();

export const register = async (req: Request, res: Response) => {
  const expiresAt = await authService.register(req.body);
  res.status(StatusCodes.CREATED).json({
    message: "OTP sent to your email", expiresAt
  });
};


export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const { accessToken, refreshToken, user } = await authService.verifyOtpAndLogin(email, otp);
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: config.env === "production", // HTTPS only in prod
  //   // sameSite: config.env === "production" ? "strict" : "lax",
  //   sameSite: config.env === "production" ? "none" : "lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    path: "https://connect-backend-rebuild.onrender.com/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.status(StatusCodes.OK).json({
    message: "Account verified successfully",
    accessToken, user
  });
};


export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const expiresAt = await authService.resendOtp(email);

  res.status(StatusCodes.OK).json({
    message: "New OTP sent to your email",
    expiresAt,
  });
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: config.env === "production", // HTTPS only in prod
  //   // sameSite: config.env === "production" ? "strict" : "lax",
  //   sameSite: config.env === "production" ? "none" : "lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    path: "https://connect-backend-rebuild.onrender.com/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.cookie("testingrefreshtoken", "hy refresh token", {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(StatusCodes.OK).json({
    message: "Logged in successfully",
    accessToken, user
  });
};


export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);

  res.status(StatusCodes.OK).json({
    message: result.message,
    success: true
  });
};


export const validateResetToken = async (req: Request, res: Response ) => {
    const { token, email } = req.body;
    const result = await authService.validateResetToken( token, email);

    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
};


export const resetPassword = async (req: Request, res: Response ) => {
    const { email, token, password, confirmPassword,  } = req.body;
    const result = await authService.resetPassword( email, token, password, confirmPassword, );

    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
};


export const googleCallback = async (req: Request, res: Response) => {
  console.log("googleCallback controller")
  const userId = req.user?.id; 
  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }
  const { accessToken, refreshToken, user } = await authService.googleAuth( userId );

  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: config.env === "production", // HTTPS only in prod
  //   // sameSite: config.env === "production" ? "strict" : "lax",
  //   sameSite: config.env === "production" ? "none" : "lax",
  //   path: "/api/auth/refresh",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    path: "https://connect-backend-rebuild.onrender.com/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Redirect in frontend
  res.redirect(
    `${config.frontendUrl}/auth/google/callback?accessToken=${accessToken}`
  );
};


export const refreshToken = async (req: Request, res: Response) => {
  console.log("req.cookies in refresh ", req.cookies)
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Refresh token missing"
    });
  }
  const { accessToken, refreshToken: newRefreshToken, user } = await authService.refreshAccessToken(token);
  // res.cookie("refreshToken", newRefreshToken, {
  //   httpOnly: true,
  //   secure: config.env === "production", // HTTPS only in prod
  //   // sameSite: config.env === "production" ? "strict" : "lax",
  //   sameSite: config.env === "production" ? "none" : "lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    path: "https://connect-backend-rebuild.onrender.com/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user });
};


export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.adminLogin(email, password);
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   secure: config.env === "production", // HTTPS only in prod
  //   // sameSite: config.env === "production" ? "strict" : "lax",
  //   sameSite: config.env === "production" ? "none" : "lax",
  //   maxAge: 7 * 24 * 60 * 60 * 1000
  // });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,          // 🔥 ALWAYS TRUE for Render/Vercel
    sameSite: "none",      // required cross-site
    path: "https://connect-backend-rebuild.onrender.com/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.status(StatusCodes.OK).json({
    message: "Logged in successfully",
    accessToken, user
  });
};


export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    // Even if token missing, treat as logged out
    return res.status(StatusCodes.OK).json({
      message: "Already logged out"
    });
  }

  await authService.logout(refreshToken);

  // Clear cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "strict" : "lax"
  });

  res.status(StatusCodes.OK).json({
    message: "Logged out successfully"
  });
};



