import { app } from "./app";
import { connectDB } from "./database/mongoose";
import { config } from "./config";
import { createServer } from "http";
import { initSocket } from "./sockets";
import { logger } from "./common/utils/logger";
import { sessionCompletionJob } from "./jobs/sessionCompletion.job";

const httpServer = createServer(app);

// Process-level error handlers (These catch errors OUTSIDE express)
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION, Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED PROMISE REJECTION", err);
});

// Start server 
const startServer = async () => {
  try {
    await connectDB();

    // Initialize cron job AFTER DB is connected
    sessionCompletionJob();

    // Initialize socket 
    initSocket(httpServer);

    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (err) {
    logger.error("FAILED TO START SERVER", err);
    process.exit(1);
  }
};

startServer();
