import { Router } from "express";
import { authRateLimiter } from "../middlewares/rateLimiter";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Role } from "../constants/roles.enum";
import { roleGuard } from "../middlewares/roleGuardMiddleware";
import { cancelBooking, createPaymentIntent, getBookingById, getBookings, getWishlistSessions, toggleWishlist } from "../controllers/studentController";

const router = Router();
router.use(authMiddleware, roleGuard(Role.STUDENT));

// Create PaymentIntent (stripe auth)
router.post("/create-payment-intent", createPaymentIntent);

router.get("/bookings/:status", getBookings);
router.post("/cancel-booking", cancelBooking);
router.patch("/wishlist/:sessionId", toggleWishlist );
router.get("/wishlist", getWishlistSessions );
router.get("/bookings/details/:bookingId", getBookingById); //for search to show booked page details

export const studentRoutes = router;
