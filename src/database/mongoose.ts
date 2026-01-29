import mongoose from "mongoose";
import { config } from "../config";
import { logger } from "../common/utils/logger";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection failed");
    process.exit(1);
  }
};
