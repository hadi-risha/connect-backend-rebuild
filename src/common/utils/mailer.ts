import nodemailer from "nodemailer";
import { config } from "../../config";

export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.otp.emailUser,
        pass: config.otp.emailPass
      }
    });

    await transporter.sendMail({
      from: config.otp.emailUser,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. Valid for 2 minutes`
    });
  } catch (error) {
    console.log("mailer err", error)
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

