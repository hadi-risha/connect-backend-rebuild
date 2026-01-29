import { Schema, model, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  studentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicates
WishlistSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export const WishlistModel = model<IWishlist>("Wishlist", WishlistSchema);
