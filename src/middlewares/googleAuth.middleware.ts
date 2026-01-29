import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user) => {
      if (err) {
        return res.redirect(
          `${config.frontendUrl}/login?error=true&code=${err.code}&message=${encodeURIComponent(err.message)}`
        );
      }

      if (!user) {
        return res.redirect(`${config.frontendUrl}/login?error=true`);
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};
