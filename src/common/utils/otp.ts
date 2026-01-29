import crypto from "crypto";

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}
const otpStore: Record<string, OtpEntry> = {};

export interface GenerateOtpResult {
  otp: string;
  expiresAt: number;
}

export const generateOtp = (email: string): GenerateOtpResult  => {
  const normalizedEmail = email.toLowerCase().trim();
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000;

  otpStore[normalizedEmail] = {
    otp,
    expiresAt,
    attempts: 0
  };

  return { otp, expiresAt };
};

export const verifyOtp = (email: string, otp: string): void => {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore[normalizedEmail];

  if (!record) {
    throw new Error("OTP not found. Please request a new one.");
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[normalizedEmail];
    throw new Error("OTP expired. Please request a new one.");
  }

  // if (record.attempts >= 5) {
  //   delete otpStore[normalizedEmail];
  //   throw new Error("Too many attempts. Please request a new OTP.");
  // }

  record.attempts++;

  if (record.otp !== otp) {
    throw new Error("Incorrect OTP");
  }

  delete otpStore[normalizedEmail];
};

