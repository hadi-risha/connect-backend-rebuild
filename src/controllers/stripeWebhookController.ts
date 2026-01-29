import { Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config";
import { StudentService } from "../services/StudentService";
import { stripe } from "../integrations/stripe";
import { BookingRepository } from "../repositories/BookingRepository";

const studentService = new StudentService();
const bookingRepo = new BookingRepository();

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe.webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.log("booking from stripewebhookcontroller")
      await studentService.createBookingFromWebhook(pi);
      break;
    }

    case "refund.updated": {
      const refund = event.data.object as Stripe.Refund;
      console.log("refund from stripewebhookcontroller")

      const booking = await bookingRepo.findOne({ stripeRefundId: refund.id });
      if (!booking || booking.isRefunded) return;

      await bookingRepo.update(
        { stripeRefundId: refund.id },
        {
          refundStatus: refund.status,
          isRefunded: refund.status === "succeeded",
          refundedAmount:
            refund.status === "succeeded"
              ? refund.amount / 100
              : undefined,
        }
      );
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};
