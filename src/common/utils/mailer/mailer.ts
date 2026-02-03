import SibApiV3Sdk from "sib-api-v3-sdk";
import { config } from "../../../config";

export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = config.otp.brevoApiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { email: config.otp.emailUser, name: "Connect App" },
      to: [{ email }],
      subject: "Your OTP Code",
      textContent: `Your OTP code is ${otp}. Valid for 2 minutes`,
    });

  } catch (error) {
    console.log("Brevo API mail error:", error);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};
