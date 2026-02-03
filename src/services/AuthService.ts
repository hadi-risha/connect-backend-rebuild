import { UserRepository } from "../repositories/UserRepository";
import { StatusCodes } from "../constants/statusCodes.enum";
import { logger } from "../common/utils/logger";
import { ApiError } from "../common/errors/ApiError";
import { comparePassword, hashPassword } from "../common/utils/password";
import { generateOtp, verifyOtp } from "../common/utils/otp";
import { sendOtpEmail } from "../common/utils/mailer/mailer";
import { AuthProvider } from "../constants/authProvider.enum";
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from "../common/utils/token";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import { IAuthService } from "./interfaces/IAuthService";
import { generateResetPasswordToken, hashResetPasswordToken } from "../common/utils/resetToken";
import { sendForgotPasswordEmail } from "../common/utils/mailer/forgotPasswordMailer";
import { config } from "../config";
import { Role } from "../constants/roles.enum";


export class AuthService implements IAuthService {
  private userRepo = new UserRepository();
  private tokenRepo = new RefreshTokenRepository();

  async register(data: any) {
    const { name, email, password, confirmPassword } = data;
    logger.info("Registration attempt started", { email });
    console.log("data", name, email, password, confirmPassword)

    if (!name || !email || !password || !confirmPassword) {
      logger.warn("Registration failed - missing fields", { email });
      throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
    }

    if (password.length < 8) {
      logger.warn("Registration failed - weak password", { email });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Password must be at least 8 characters"
      );
    }

    if (password !== confirmPassword) {
      logger.warn("Registration failed - password mismatch", { email });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Passwords do not match"
      );
    }

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      logger.warn("Registration failed - user already exists", { email });
      throw new ApiError(
        StatusCodes.CONFLICT,
        "User already exists"
      );
    }

    const hashedPassword = await hashPassword(password);
    logger.info("Password hashed successfully", { email });

    await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
      provider: AuthProvider.LOCAL,
      isVerified: false
    });

    logger.info("User created successfully (unverified)", { email });

    // Generate OTP
    const { otp, expiresAt } = generateOtp(email);
    logger.info("OTP generated", { email });

    // Send OTP email
    await sendOtpEmail(email, otp);
    logger.info("OTP email sent successfully", { email });
    return expiresAt
  }


  async verifyOtpAndLogin(email: string, otp: string) {
    logger.info("OTP verification attempt", { email });

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      logger.warn("OTP verification failed - user not found", { email });
      throw new ApiError(StatusCodes.BAD_REQUEST, "User not found");
    }

    try {
      verifyOtp(email, otp);
    } catch (err: any) {
      logger.warn("OTP verification failed", {
        email,
        reason: err.message
      });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        err.message
      );
    }

    if (user.isBlocked) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Account is blocked");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    console.log("created accesstoken in verifyOtpAndLogin ", accessToken);
    console.log("created refreshToken in verifyOtpAndLogin ", refreshToken);

    await this.tokenRepo.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: "browser" // optional
    });

    await this.userRepo.verifyUser(email);
    logger.info("User verified & tokens issued", { email });

    return {
      accessToken,
      refreshToken,
      user
    };
  }


  async resendOtp(email: string): Promise<number> {
    if (!email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email is required");
    }
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User not found");
    }

    if (user.isVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User already verified");
    }

    // Generate new OTP (overwrites old one)
    const { otp, expiresAt } = generateOtp(email);

    await sendOtpEmail(email, otp);

    logger.info("OTP resent successfully", { email });

    return expiresAt;
  }


  async login(email: string, password: string) {
    logger.info("Login attempt", { email });

    if (!email || !password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email and password are required",
      );
    }

    const user = await this.userRepo.findByEmailWithPassword(email);
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    if (user.isBlocked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Account is blocked",
        "USER_BLOCKED"
      );
    }

    if (!user.isVerified) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Account not verified",
        "USER_NOT_VERIFIED"
      );
    }

    if (user.provider === AuthProvider.GOOGLE) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Please login using Google authentication",
      );
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    console.log("created accesstoken in login ", accessToken);
    console.log("created refreshToken in login ", refreshToken);

    await this.tokenRepo.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: "browser"
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    console.log("safeUser in login", safeUser)

    logger.info("Login successful", { email });

    return {
      accessToken,
      refreshToken,
      user: safeUser
    };
  }


  async forgotPassword(email: string) {
    logger.info("forgot password recovery", { email });
    if (!email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email required",
      );
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid email",
      );
    }

    if (user.isBlocked) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Account is blocked",
      );
    }

    const { token, hashedToken, expiresAt } = generateResetPasswordToken();
    await this.userRepo.setResetPasswordToken(
      user.id,
      hashedToken,
      expiresAt
    );

    // Reset link
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}&email=${user.email}`;
    // Send email
    await sendForgotPasswordEmail(user.email, resetUrl);
    logger.info("Password reset link sent", { email });

    return {
      message: "Password recovery link sent to your email"
    };
  }


  async validateResetToken(token: string, email: string) {
    if (!token || !email) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid reset link"
      );
    }
    const hashedToken = hashResetPasswordToken(token)
    const user = await this.userRepo.findValidResetToken(
      email,
      hashedToken
    );

    if (!user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Reset link is invalid or expired"
      );
    }

    return {
      message: "Reset link is valid",
    };
  }


  async resetPassword(email: string, token: string, password: string, confirmPassword: string ) {
    if (!password || !confirmPassword || !email || !token) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "All fields are required"
      );
    }

    if (password.length < 8) {
      logger.warn("reset password failed - weak password", { email });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Password must be at least 8 characters"
      );
    }

    if (password !== confirmPassword) {
      logger.warn("reset password failed - password mismatch", { email });
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Passwords do not match"
      );
    }

    const hashedToken = hashResetPasswordToken(token)
    const user = await this.userRepo.findValidResetToken(
      email,
      hashedToken
    );

    if (!user) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Reset link is invalid or expired"
      );
    }

    const hashedPassword = await hashPassword(password);
    logger.info("Password hashed successfully", { email });

    await this.userRepo.updatePasswordAfterReset(
      user.id,
      hashedPassword
    );

    logger.info("Password reset successful", { email });
    return {
      message: "Password reset successful",
    };
  }


  async googleAuth(userId: string) {
    console.log("googleCallback service")
    
    const user = await this.userRepo.findOne({ _id: userId})
    console.log("user data on googleAuth", user)
    if (!user) {
      logger.warn("google auth failed - user not found or created");
      throw new ApiError(StatusCodes.BAD_REQUEST, "User not found");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    console.log("created accesstoken in googleAuth ", accessToken);
    console.log("created refreshToken in googleAuth ", refreshToken);

    await this.tokenRepo.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: "browser" // optional
    });

    return {
      accessToken,
      refreshToken,
      user
    }; 
  }


  // generate refresh token and access token
  async refreshAccessToken(refreshToken: string) {
    logger.info("Refresh token attempt");
    console.log("Incoming refresh token in refreshAccessToken service:", refreshToken);

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await this.tokenRepo.findByTokenHash(tokenHash);
    if (!storedToken) {
      logger.warn("Refresh token invalid");
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
    }

    if (storedToken.expiresAt < new Date()) {
      logger.warn("Refresh token expired", {
        userId: storedToken.userId.toString()
      });

      await this.tokenRepo.deleteById(storedToken.id);
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token expired");
    }

    // ROTATION
    await this.tokenRepo.deleteById(storedToken.id);

    const newRefreshToken = generateRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);

    await this.tokenRepo.create({
      userId: storedToken.userId,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    logger.info("Refresh token rotated", {
      userId: storedToken.userId.toString()
    });

    const user = await this.userRepo.findOne({ _id: storedToken.userId });
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      role: user.role
    });

    logger.info("New access token issued", { userId: user.id });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user
    };
  }

  
  private async bootstrapAdmin(email: string, password: string) {
    const envEmail = config.admin.email;
    const envPassword = config.admin.password;

    if (email !== envEmail || password !== envPassword) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid admin credentials");
    }

    logger.warn("Bootstrapping admin from env");
    const hashedPassword = await hashPassword(password);

    await this.userRepo.create({
        name: "Hadi Risha",
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        provider: AuthProvider.LOCAL,
        isVerified: true,
        isBlocked: false
    });
  }
  
  
  async adminLogin(email: string, password: string) {
    logger.info("Admin login attempt", { email });

    if (!email || !password) {
      logger.warn("Admin login failed - missing credentials", { email });
      throw new ApiError(StatusCodes.BAD_REQUEST, "Email and password required");
    }

    let admin = await this.userRepo.findByEmailWithPassword(email);

    // If admin NOT found → try bootstrap from env(create admin)
    if (!admin) {
      // No record found. To compare or create an admin, run bootstrap.
      await this.bootstrapAdmin(email, password);
      admin = await this.userRepo.findByEmailWithPassword(email);
    }

    if (!admin) {
      logger.warn("Admin login failed - invalid credentials", { email });
      throw new ApiError(StatusCodes.FORBIDDEN, "Invalid credentials");
    }

    if (admin.role !== Role.ADMIN) {
      logger.warn("Admin login failed - user not an admin", { email, role: admin.role });
      throw new ApiError(StatusCodes.FORBIDDEN, "Not an admin");
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      logger.warn("Admin login failed - password mismatch", { email });
      throw new ApiError(StatusCodes.FORBIDDEN, "Invalid credentials");
    }

    // Blocked check 
    if (admin.isBlocked) {
      logger.warn("Admin login failed - account blocked", { email });
      throw new ApiError(StatusCodes.FORBIDDEN, "Admin account blocked");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: admin._id,
      role: admin.role
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await this.tokenRepo.create({
      userId: admin._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deviceInfo: "browser"
    });
    logger.info("Admin login successful");

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    };
  }
  
  
  // logout current device
  async logout(refreshToken: string) {
    const hash = hashRefreshToken(refreshToken);
    await this.tokenRepo.deleteByTokenHash(hash);
    logger.info("User logged out from one device", { tokenHash: hash });
  }


  // logout ALL devices
  async logoutAll(userId: string) {
    await this.tokenRepo.deleteAllForUser(userId);
    logger.info("User logged out from all devices", { userId });
  }

}
