// Never store raw token in DB
// creating random token link for password recovery

import crypto from "crypto";

export function generateResetPasswordToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return {
    token,         // send to email
    hashedToken,   // store in DB
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
  };
}



export const hashResetPasswordToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};




