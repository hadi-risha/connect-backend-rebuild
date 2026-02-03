import { config } from "./index";
type Secret = string | Buffer;

export const jwtConfig: { access: { secret: Secret; expiresIn: string | number } } = {
  access: {
    secret: config.jwt.accessSecret as Secret,
    expiresIn: config.jwt.accessExpires, 
  },
};
