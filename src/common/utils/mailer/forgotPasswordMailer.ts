import SibApiV3Sdk from "sib-api-v3-sdk";
import { config } from "../../../config";

export const sendForgotPasswordEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = config.otp.brevoApiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { email: config.otp.emailUser, name: "Connect App" },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <h2>Password Reset</h2>
        <p>You requested to reset your password.</p>
        <p>Click below to continue:</p>
        <a href="${resetUrl}" style="
          background:#4F46E5;
          padding:10px 16px;
          color:white;
          text-decoration:none;
          border-radius:6px;
          display:inline-block;
          margin-top:10px;
        ">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

  } catch (error) {
    console.log("Brevo Forgot Password mail error:", error);
    throw new Error("Failed to send reset email. Please try again.");
  }
};
