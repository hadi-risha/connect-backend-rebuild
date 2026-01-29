export interface IAuthService {
  register(data: any): Promise<any>;
  verifyOtpAndLogin(email: string, otp: string): Promise<any>;
  resendOtp(email: string): Promise<any>;
  login(email: string, password: string): Promise<any>;
  forgotPassword(email: string): Promise<any>;
  validateResetToken(token: string, email: string): Promise<any>;
  resetPassword(email: string, token: string, password: string, confirmPassword: string): Promise<any>;
  googleAuth(userId: string): Promise<any>;
  refreshAccessToken(refreshToken: string): Promise<any>;
  adminLogin(email: string, password: string): Promise<any>;
  logout(refreshToken: string): Promise<void>;
  logoutAll(userId: string): Promise<void>;
}
