import { Request, Response, NextFunction } from "express";
import { logger } from "../common/utils/logger";
import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(
    `${req.method} ${req.originalUrl} - ${err.message}`,
    err
  );

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }) // ONLY send if exists
    });
  }

  return res
    .status(StatusCodes.INTERNAL_ERROR)
    .json({ success: false, message: "Internal Server Error" });
};
