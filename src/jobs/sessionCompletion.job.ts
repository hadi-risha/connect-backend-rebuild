import cron from "node-cron";
import { BookingRepository } from "../repositories/BookingRepository";

const bookingRepo = new BookingRepository()
const COMPLETION_BUFFER_MINUTES = 5; // 5 minutes buffer

export const sessionCompletionJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    const result = await bookingRepo.markCompletedSessions(COMPLETION_BUFFER_MINUTES);
    console.log(`[Session Completion] Marked ${result.modifiedCount} sessions as completed`);
  });
};
