import { Schema, model, Types, Document } from "mongoose";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  deviceInfo?: string;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tokenHash: {
    type: String,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  deviceInfo: {
    type: String
  }
}, {
  timestamps: true
});

export const RefreshTokenModel = model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);
