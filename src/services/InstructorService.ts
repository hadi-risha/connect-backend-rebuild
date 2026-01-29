import { ApiError } from "../common/errors/ApiError";
import { BookingRepository } from "../repositories/BookingRepository";
import { calculateSlotStatus } from "../common/utils/calculateSlotStatus";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { IInstructorService } from "./interfaces/IInstructorService";

export class InstructorService implements IInstructorService {
    private bookingRepo = new BookingRepository();

    async getInstructorBookings(instructorId: string, status?: BookingStatus) {
        const filter: any = { instructorId };
        if (status) {
            filter.status = status;
        }
        const bookings = await this.bookingRepo.findInstructorBookedSessions(filter);
        const grouped = new Map<string, any>();

        for (const b of bookings) {
            const key = `${b.sessionId._id}-${b.bookedDate.toISOString()}-${b.timeSlot.toISOString()}`;

            if (!grouped.has(key)) {
            grouped.set(key, {
                _id: b._id, 
                bookedDate: b.bookedDate.toISOString(),
                timeSlot: b.timeSlot.toISOString(),
                endTime: b.endTime.toISOString(),

                status: b.status,

                session: {
                    _id: b.sessionId._id.toString(),
                    title: b.sessionId.title,
                    introduction: b.sessionId.introduction,
                    description: b.sessionId.description,
                    bulletPoints: b.sessionId.bulletPoints,
                    coverPhoto: b.sessionId.coverPhoto,
                    duration: b.sessionId.duration,
                    fees: b.sessionId.fees,
                },

                meetingId: b.meetingId,
                students: [],
            });
            }

            grouped.get(key).students.push({
                student: {
                    _id: b.studentId._id.toString(),
                    name: b.studentId.name,
                    role: b.studentId.role,
                    profilePicture: b.studentId.profilePicture,
                },

                status: b.status,
                concerns: b.concerns,

                amountPaid: b.amountPaid,
                currency: b.currency,

                isRefunded: b.isRefunded,
                refundedAmount: b.refundedAmount,

                cancellation: b.cancellation
                    ? {
                        cancelledBy: b.cancellation.cancelledBy,
                        cancelledAt: b.cancellation.cancelledAt.toISOString(),
                        reason: b.cancellation.reason,
                    }
                    : undefined,
            });
        }

        return Array.from(grouped.values()).map((g) => {
            const slotStatus = calculateSlotStatus(g.students);

            return {
                ...g,
                status: slotStatus,
                totalStudents: g.students.length,
            };
        });

    }

}