import nodemailer from "nodemailer";
import { config } from "../../config";

export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER!,
        pass: process.env.BREVO_SMTP_PASS!,
      },
    });

    await transporter.sendMail({
      from: config.otp.emailUser,
      // from: `"Connect App" <${process.env.BREVO_SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. Valid for 2 minutes`
    });
  } catch (error) {
    console.log("mailer err", error)
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

