// // central config loader (env)
import { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Ensures env variable exists at startup
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(` Missing environment variable: ${name}`);
  }
  return value;
}

// Config interfaces
interface OtpConfig {
  emailUser?: string;
  emailPass?: string;
}

interface JwtConfig {
  // accessSecret: string;
  // accessExpires: string;
  accessSecret: Secret;
  accessExpires: SignOptions["expiresIn"];
}

interface GoogleConfig {
  callbackUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
}

interface ZegoConfig {
  appId: number;
  serverSecret: string;
}

interface AdminConfig {
  email: string;
  password: string;
}

interface AppConfig {
  env: string;
  port: number;
  mongoUri: string;
  frontendUrl?: string;

  otp: OtpConfig;
  jwt: JwtConfig;
  google: GoogleConfig;
  imagekit: ImageKitConfig;
  stripe: StripeConfig;
  zegoCloud: ZegoConfig;
  admin: AdminConfig
}


export const config: AppConfig = {
  env: requireEnv("NODE_ENV"),
  port: Number(requireEnv("PORT")),

  mongoUri: requireEnv("MONGO_URI"),
  frontendUrl: process.env.FRONTEND_URL,

  otp: {
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
  },

  jwt: {
    // accessSecret: requireEnv("JWT_ACCESS_SECRET"),
    // accessExpires: requireEnv("JWT_ACCESS_EXPIRES"),
    accessSecret: requireEnv("JWT_ACCESS_SECRET") as Secret,
    accessExpires: requireEnv("JWT_ACCESS_EXPIRES") as SignOptions["expiresIn"],
  },

  google: {
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },

  imagekit: {
    publicKey: requireEnv("IMAGEKIT_PUBLIC_KEY"),
    privateKey: requireEnv("IMAGEKIT_PRIVATE_KEY"),
    urlEndpoint: requireEnv("IMAGEKIT_URL_ENDPOINT"),
  },

  stripe: {
    publishableKey: requireEnv("STRIPE_PUBLISHABLE_KEY"),
    secretKey: requireEnv("STRIPE_SECRET_KEY"),
    webhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
  },

  zegoCloud: {
    appId: Number(requireEnv("ZEGO_APP_ID")), // NUMBER
    serverSecret: requireEnv("ZEGO_SERVER_SECRET"), // STRING
  },

  admin: {
    email: requireEnv("ADMIN_EMAIL"),
    password: requireEnv("ADMIN_PASS"),
  }
};
