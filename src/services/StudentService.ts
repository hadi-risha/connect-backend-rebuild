import { StatusCodes } from "../constants/statusCodes.enum";
import { Role } from "../constants/roles.enum";
import { ApiError } from "../common/errors/ApiError";
import { BookingRepository } from "../repositories/BookingRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { WishlistRepository } from "../repositories/WishlistRepository";
import { stripe } from "../integrations/stripe";
import Stripe from "stripe";
import { BookingStatus } from "../constants/bookingStatus.enum";
import { PopulatedBooking } from "../interfaces/bookingsResponse";
import { generateMeetingId } from "../common/utils/generateMeetingId";
import { CancellationBy } from "../constants/cancellationBy.enum";
import { IBooking } from "../models/Booking.model";
import { differenceInHours } from "date-fns";
import { CancelBookingInput } from "../interfaces/cancelBookingInput";
import { Types } from "mongoose";
import { IStudentService } from "./interfaces/IStudentService";
import { logger } from "../common/utils/logger";

export class StudentService implements IStudentService {
    private bookingRepo = new BookingRepository();
    private sessionRepo = new SessionRepository();
    private wishlistRepo = new WishlistRepository();

    async createPaymentIntent(
        studentId: string,
        sessionId: string,
        timeSlot: string,      
        selectedDate: string,  
        concerns?: string
        ) {
        
        console.log("createPaymentIntent service");
        const session = await this.sessionRepo.findOne({ _id: sessionId });
        if (!session) {
            logger.warn("Session not found")
            throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
        }

        const startTime = new Date(timeSlot);
        const bookedDate = new Date(selectedDate);
        
        if (isNaN(startTime.getTime()) || isNaN(bookedDate.getTime())) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid date or time");
        }

        const endTime = new Date(startTime.getTime() + session.duration * 60000);

        // Student overlap
        const studentConflict = await this.bookingRepo.hasOverlap( studentId, startTime, endTime, Role.STUDENT);
        
        if (studentConflict) {
            logger.warn("User(student) already have a booking at this time")
            throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a booking at this time");
        }
            
        // Instructor overlap
        const instructorConflict = await this.bookingRepo.hasOverlap(session.instructorId.toString(), startTime,endTime, Role.INSTRUCTOR);
        if (instructorConflict){
            logger.warn("User(instructor) already have a booking at this time")
            throw new ApiError(StatusCodes.BAD_REQUEST, "Instructor is unavailable at this time");
        }
            
        // Now safe to charge
        const paymentIntent = await stripe.paymentIntents.create({
            amount: session.fees * 100, // rupees → paise
            currency: "inr",
            automatic_payment_methods: { enabled: true },
            // payment_method_types: ["card"],
            metadata: {
            studentId,
            sessionId,
            selectedDate: bookedDate.toISOString(),
            timeSlot: startTime.toISOString(),
            concerns: concerns || "",
            },
        });

        console.log("paymentIntent", paymentIntent);
        console.log("paymentIntent.client_secret", paymentIntent.client_secret);
        return paymentIntent.client_secret;
    }


    async createBookingFromWebhook(pi: Stripe.PaymentIntent) {
        const {
            studentId,
            sessionId,
            timeSlot,
            selectedDate,
            concerns,
        } = pi.metadata;

        // Stripe retries webhooks
        const existingPaymentBooking = await this.bookingRepo.findOne({
            stripePaymentIntentId: pi.id,
        });
        if (existingPaymentBooking) return;

        const session = await this.sessionRepo.findOne({ _id: sessionId });
        if (!session) return; // Do NOT throw — payment already happened

        const startTime = new Date(timeSlot);
        const endTime = new Date(
            startTime.getTime() + session.duration * 60000
        );

        // SAFETY re-check (do NOT throw, just exit)
        const conflict = await this.bookingRepo.findOne({
            instructorId: session.instructorId,
            status: BookingStatus.BOOKED,
            timeSlot: { $lt: endTime },
            endTime: { $gt: startTime },
        });

        if (conflict && conflict.studentId.toString() === studentId) {
            // Same student, same slot already booked
            return;
        }

        // Shared meeting logic
        let meetingId: string;
        let meetingLink: string;

        const existingSlotBooking = await this.bookingRepo.findOne({
            sessionId,
            timeSlot: startTime,
            status: BookingStatus.BOOKED,
        });

        if (existingSlotBooking) {
            // Group session → reuse meeting
            meetingId = existingSlotBooking.meetingId;
            meetingLink = existingSlotBooking.meetingLink;
        } else {
            // First booking for this slot
            meetingId = generateMeetingId(sessionId, startTime);
        }

        // Create booking 
        await this.bookingRepo.create({
            studentId: new Types.ObjectId(studentId),
            instructorId: session.instructorId,
            sessionId: new Types.ObjectId(sessionId),
            bookedDate: new Date(selectedDate),
            timeSlot: startTime,
            endTime,
            concerns,
            status: BookingStatus.BOOKED,

            stripePaymentIntentId: pi.id,
            amountPaid: pi.amount_received / 100,
            currency: pi.currency,

            meetingId,
        });

        // REMOVE SESSION FROM WISHLIST 
        await this.wishlistRepo.delete({
            studentId: new Types.ObjectId(studentId),
            sessionId: new Types.ObjectId(sessionId),
        });
        
    }


    async getStudentBookings(studentId: string, status?: BookingStatus) {
        const filter: any = { studentId };

        if (status) {
            filter.status = status;
        }

        const bookings: PopulatedBooking[] = await this.bookingRepo.findStudentBookedSessions(filter);

        return bookings.map((b) => ({
            _id: b._id.toString(),

            bookedDate: b.bookedDate.toISOString(),
            timeSlot: b.timeSlot.toISOString(),
            endTime: b.endTime.toISOString(),

            status: b.status,
            concerns: b.concerns,

            instructor: {
            _id: b.instructorId._id.toString(),
            name: b.instructorId.name,
            role: b.instructorId.role,
            profilePicture: b?.instructorId?.profilePicture,
            },

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

            amountPaid: b.amountPaid,
            currency: b.currency,
            isRefunded: b.isRefunded,
            refundedAmount: b?.refundedAmount,
            refundStatus: b?.refundStatus,

            cancellation: b.cancellation
                ? {
                    cancelledBy: b.cancellation.cancelledBy,
                    cancelledAt: b.cancellation.cancelledAt,
                    reason: b.cancellation.reason,
                    }
                : undefined,
        }));
    }   


    private calculateRefundAmount( booking: IBooking, cancelledBy: CancellationBy ): number {
        const now = new Date();
        const sessionStart = new Date(booking.timeSlot);

        // Instructor cancels → full refund
        if (cancelledBy === CancellationBy.INSTRUCTOR) {
            return booking.amountPaid;
        }

        const hoursBeforeSession = differenceInHours( sessionStart, now
        );

        // Session already started
        if (hoursBeforeSession <= 0) {
            return 0;
        }

        // ≥ 24 hrs → full refund
        if (hoursBeforeSession >= 24) {
            return booking.amountPaid;
        }

        // < 24 hrs → 50% refund
        return Math.floor(booking.amountPaid * 0.5);
    }

    
    async cancelBooking(input: CancelBookingInput) {
        const { bookingId, cancelledBy, userId } = input;
        const booking = await this.bookingRepo.findOne({
            _id: bookingId,
            status: BookingStatus.BOOKED,
        });

        if (!booking) {
            logger.warn("Booking not found")
            throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
        }

        // Authorization
        if (cancelledBy === CancellationBy.STUDENT && booking.studentId.toString() !== userId) {
            logger.warn("Not allowed")
            throw new ApiError(StatusCodes.FORBIDDEN, "Not allowed");
        }

        // Prevent double cancellation
        if (booking.status === BookingStatus.CANCELLED) {
            logger.warn("Booking already cancelled")
            throw new ApiError(StatusCodes.BAD_REQUEST, "Booking already cancelled");
        }


        // Cancel booking immediately
        await this.bookingRepo.update(
            { _id: bookingId },
            {
                status: BookingStatus.CANCELLED,
                cancellation: {
                    cancelledBy,
                    cancelledAt: new Date(),
                },
            }
        );

        // Calculate refund
        const refundAmount = this.calculateRefundAmount(booking, cancelledBy);

        // Request refund from Stripe (if > 0)
        if (refundAmount > 0) {
            const refund = await stripe.refunds.create({
                payment_intent: booking.stripePaymentIntentId,
                amount: refundAmount * 100, // convert rupees → paise
            });

            // Store refund tracking info
            await this.bookingRepo.update(
                { _id: bookingId },
                {
                stripeRefundId: refund.id,
                refundStatus: refund.status, 
                }
            );
        }

    }


    async toggleWishlist(studentId: string, sessionId: string) {
        const session = await this.sessionRepo.findOne({
            _id: sessionId,
            isArchived: false,
        });

        if (!session) {
            logger.warn("Session not found")
            throw new ApiError(StatusCodes.NOT_FOUND, "Session not found");
        }

        const existing = await this.wishlistRepo.findOne({
            studentId,
            sessionId,
        });

        if (existing) {
            await this.wishlistRepo.delete({
            studentId,
            sessionId,
            });

            return { added: false };
        }
        // await this.wishlistRepo.create({studentId,sessionId,});
        await this.wishlistRepo.create({
            studentId: new Types.ObjectId(studentId),
            sessionId: new Types.ObjectId(sessionId),
        });

        return { added: true };
    }


    async getWishlistSessions(studentId: string) {
        const studentObjectId = new Types.ObjectId(studentId);

        // Get booked session IDs (any status)
        const bookedSessions: { sessionId: Types.ObjectId }[] = await this.bookingRepo.find({ studentId: studentObjectId });
        const bookedSessionIds = bookedSessions.map(b => b.sessionId);

        // Get wishlist session IDs
        const wishlistEntries = await this.wishlistRepo.findByStudentId(studentObjectId);
        const wishlistSessionIds = wishlistEntries.map(w => w.sessionId);
        if (!wishlistSessionIds.length) return [];

        // Fetch sessions (NOT archived, NOT booked)
        const sessions = await this.sessionRepo.find({
            _id: {
            $in: wishlistSessionIds,
            $nin: bookedSessionIds,
            },
            isArchived: false,
        });

        // Map response (frontend-safe)
        return sessions.map((s) => ({
            _id: s._id.toString(),
            title: s.title,
            introduction: s.introduction,
            description: s.description,
            bulletPoints: s.bulletPoints,
            coverPhoto: s.coverPhoto,
            duration: s.duration,
            fees: s.fees,
            category: s.category,
            instructorId: s.instructorId,
            timeSlots: s.timeSlots,
            isWishlisted: true,
        }));
    }


    async getStudentBookingById(studentId: string, bookingId: string) {
        const b = await this.bookingRepo.findStudentBookingById({
            _id: bookingId,
            studentId,
        });

        if (!b) return null;

        return {
            _id: b._id.toString(),

            bookedDate: b.bookedDate.toISOString(),
            timeSlot: b.timeSlot.toISOString(),
            endTime: b.endTime.toISOString(),

            status: b.status,
            concerns: b.concerns,

            instructor: {
            _id: b.instructorId._id.toString(),
            name: b.instructorId.name,
            role: b.instructorId.role,
            profilePicture: b.instructorId.profilePicture,
            },

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

            amountPaid: b.amountPaid,
            currency: b.currency,
            isRefunded: b.isRefunded,
            refundedAmount: b.refundedAmount,
            refundStatus: b.refundStatus,

            cancellation: b.cancellation
            ? {
                cancelledBy: b.cancellation.cancelledBy,
                cancelledAt: b.cancellation.cancelledAt,
                reason: b.cancellation.reason,
                }
            : undefined,
        };
    }
    
}
