import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { Role } from "../constants/roles.enum";

// type for user payload
type AuthUser = {
  id: string;
  role: Role;
};

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "google",
    { session: false },
    (err: Error | null, user: AuthUser | false) => {
      if (err) {
        return res.redirect(
          `${config.frontendUrl}/login?error=true&code=${(err as any).code}&message=${encodeURIComponent(err.message)}`
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
