import { config } from "./index";
import type { SignOptions } from "jsonwebtoken"; // use type-only import
type Secret = string | Buffer;

export const jwtConfig: { access: { secret: Secret; expiresIn: string | number } } = {
  access: {
    secret: config.jwt.accessSecret as Secret,
    expiresIn: config.jwt.accessExpires, // now TS knows it's string | number
  },
};
