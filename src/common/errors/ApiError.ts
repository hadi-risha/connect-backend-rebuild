import { StatusCodes } from "../../constants/statusCodes.enum";

export class ApiError extends Error {
  statusCode: StatusCodes;
  code?: string; // optional, not required (for blocked verified indicator)

  constructor(
    statusCode: StatusCodes, 
    message: string,
  code?: string

  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
