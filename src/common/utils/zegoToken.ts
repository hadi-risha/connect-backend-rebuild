import crypto from "crypto";

interface ZegoTokenPayload {
  app_id: number;
  user_id: string;
  room_id: string;
  privilege: Record<number, number>;
  expire_time: number;
}

export function generateZegoToken(
  appId: number,
  serverSecret: string,
  userId: string,
  roomId: string,
  expireSeconds = 3600
): string {
  const payload: ZegoTokenPayload = {
    app_id: appId,
    user_id: userId,
    room_id: roomId,
    privilege: {
      1: 1, // login room
      2: 1, // publish stream
    },
    expire_time: Math.floor(Date.now() / 1000) + expireSeconds,
  };

  const payloadBase64 = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64");

  const signature = crypto
    .createHmac("sha256", serverSecret)
    .update(payloadBase64)
    .digest("hex");

  return `${payloadBase64}.${signature}`;
}
