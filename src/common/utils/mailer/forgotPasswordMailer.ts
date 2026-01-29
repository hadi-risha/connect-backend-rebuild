import nodemailer from "nodemailer";
import { config } from "../../../config";

export const sendForgotPasswordEmail = async (
  email: string,
  resetUrl: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.otp.emailUser,
      pass: config.otp.emailPass,
    },
  });

  await transporter.sendMail({
    from: `"Connect" <${config.otp.emailUser}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  });
};
