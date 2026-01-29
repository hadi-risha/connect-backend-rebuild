
import { Request, Response, NextFunction } from "express";

import { Role } from "../constants/roles.enum";
import { StatusCodes } from "../constants/statusCodes.enum";

export const roleGuard =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Forbidden" });
    }
    next();
  };
