import { Request, Response } from "express";
import { StatusCodes } from "../constants/statusCodes.enum";
import { ApiError } from "../common/errors/ApiError";
import { logger } from "../common/utils/logger";

import { ZegoService } from "../services/ZegoService";

const zegoService = new ZegoService();

export const joinVideoSession = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.id;
  const { bookingId } = req.body;

  if (!userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  if (!bookingId) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "bookingId is required"
    );
  }

  const result = await zegoService.joinVideoSession(
    userId,
    bookingId
  );

  res.status(StatusCodes.OK).json(result);
}