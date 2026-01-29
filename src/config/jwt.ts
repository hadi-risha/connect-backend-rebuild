import { config } from "./index";


export const jwtConfig = {
  access: {
    secret: config.jwt.accessSecret!,
    expiresIn: config.jwt.accessExpires
  },
};
