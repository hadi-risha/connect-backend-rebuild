import jwt from "jsonwebtoken";
import crypto from "crypto";
import { jwtConfig } from "../../config/jwt";

// ACCESS TOKEN
export const generateAccessToken = (payload: {
  userId: string;
  role: string;
  email?: string;
}) => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn
  });
};

// REFRESH TOKEN
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex"); //random refresh token
};

export const hashRefreshToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
