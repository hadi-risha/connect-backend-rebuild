import morgan from "morgan";
import { logger } from "../common/utils/logger";

// Custom stream: Morgan writes into Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Skip logging health checks (optional)
const skip = () => false;

export const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
