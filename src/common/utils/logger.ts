import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}`
      : `[${timestamp}] ${level}: ${message}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: "info",
  }),

  // Daily rotating log file (for all logs)
  new DailyRotateFile({
    dirname: logDir,
    filename: "application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d", // auto-delete after 14 days
    level: "info",
  }),

  // Separate error logs
  new DailyRotateFile({
    dirname: logDir,
    filename: "error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
  }),
];

export const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports,
  exitOnError: false,
});
