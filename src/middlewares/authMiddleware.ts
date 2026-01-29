import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { jwtConfig } from "../config/jwt";
import { StatusCodes } from "../constants/statusCodes.enum";
import { Role } from "../constants/roles.enum";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.access.secret) as {
      userId: string;
      role: Role;
    };

    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token expired or invalid" });
  }
};
