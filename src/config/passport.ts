import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {config} from "./index";
import { UserRepository } from "../repositories/UserRepository";
import { AuthProvider } from "../constants/authProvider.enum";
import { ApiError } from "../common/errors/ApiError";
import { StatusCodes } from "../constants/statusCodes.enum";

const userRepo = new UserRepository();

type GoogleProfile = {
  id: string;
  displayName: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
};


/*  Strategy init log */
console.log("Initializing Google OAuth Strategy");
console.log("Client ID: ", config.google.clientId ? "Loaded" : "Missing");
console.log("Callback URL:", config.google.callbackUrl);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl, //BACKEND URL
    },
    async (_accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (err: any, user?: any) => void) => {
      console.log("\n Google OAuth Callback Triggered");
      try {
        /* Raw Google profile */
        console.log("Google Profile ID:", profile.id);
        console.log("Emails:", profile.emails);
        console.log("Display Name:", profile.displayName);
        console.log("Photos:", profile.photos);

        const email = profile.emails?.[0].value;

        if (!email) {
          console.error("No email found in Google profile");
          return done(new Error("Google account has no email"));
        }

        console.log("Searching user by email:", email);
        let user = await userRepo.findByEmail(email);
        if (user) {
          console.log("user already exist: ", user)
        }

        // New Google user
        if (!user) {
            console.log("Creating new Google user");
          user = await userRepo.create({
            name: profile.displayName,
            email,
            provider: AuthProvider.GOOGLE,
            isVerified: true, // skip otp
          });
          console.log("New user created: ", user)
        }

        // Passport expects errors via done(err), so return via done
        if (user.isBlocked) {
            console.warn("Blocked user attempted login:", user.email);
            return done(
                new ApiError(StatusCodes.FORBIDDEN, "Account is blocked", "USER_BLOCKED")
            );
        }

        if (user.provider !== AuthProvider.GOOGLE) {
            return done(
                new ApiError(
                StatusCodes.BAD_REQUEST,
                "Please login using email & password",
                "WRONG_PROVIDER"
                )
            );
        }

        /* Success payload */
        const authPayload = {
          id: user.id,
          role: user.role,
        };

        console.log("🎉 Google login successful:", authPayload);

        return done(null, authPayload);
      } catch (err) {
        console.error("Google OAuth Error:", err);
        return done(err as Error);
      }
    }
  )
);

export default passport;
