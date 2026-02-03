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

// JWT custom types
type JwtSecret = string | Buffer;
type JwtExpiresIn = string | number;

// Config interfaces
interface OtpConfig {
  emailUser?: string;
  emailPass?: string;
}

interface JwtConfig {
  accessSecret: JwtSecret;
  accessExpires: JwtExpiresIn;
}

interface GoogleConfig {
  callbackUrl: string;
  clientId: string;
  clientSecret: string;
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
  // frontendUrl: process.env.FRONTEND_URL,
  frontendUrl: requireEnv("FRONTEND_URL"),

  otp: {
    // emailUser: process.env.EMAIL_USER,
    // emailPass: process.env.EMAIL_PASS,
    emailUser: requireEnv("EMAIL_USER"),
    emailPass: requireEnv("EMAIL_PASS"),

  },

  jwt: {
    accessSecret: requireEnv("JWT_ACCESS_SECRET") as JwtSecret,
    accessExpires: requireEnv("JWT_ACCESS_EXPIRES") as JwtExpiresIn,
  },

  google: {
    callbackUrl: requireEnv("GOOGLE_CALLBACK_URL"),
    clientId: requireEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
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
