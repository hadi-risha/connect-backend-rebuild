import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "express-async-errors";
import passport from "passport";
import "./config/passport"
import { routes } from "./routes";
import { config } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { morganMiddleware } from "./middlewares/morgan.middleware";
import { stripeWebhookHandler } from "./controllers/stripeWebhookController";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl, 
    credentials: true
  })
);

// Stripe
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  (req, _res, next) => {
    console.log("STRIPE WEBHOOK ROUTE HIT");
    next();
  },
  stripeWebhookHandler
);

app.use(express.json());
app.use(cookieParser());
app.use(morganMiddleware);

app.use(passport.initialize())

app.use("/api", routes);

app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

app.use(errorHandler);



// local stripe webhook connection
// stripe login
// stripe listen --forward-to http://localhost:3001/api/webhooks/stripe