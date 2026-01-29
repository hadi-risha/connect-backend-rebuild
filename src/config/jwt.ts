import { config } from "./index";
import { Secret, SignOptions } from "jsonwebtoken";

export const jwtConfig = {
  access: {
    // secret: config.jwt.accessSecret!,
    // expiresIn: config.jwt.accessExpires
     secret: config.jwt.accessSecret as Secret,
    expiresIn: config.jwt.accessExpires as SignOptions["expiresIn"],
  },
};
