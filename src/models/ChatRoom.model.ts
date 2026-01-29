import { Schema, model, Types, Document } from "mongoose";
import { ChatType } from "../constants/chatType.enum";

export interface IChatLastRead {
  user: Types.ObjectId;
  message: Types.ObjectId;
  readAt: Date;
}

export interface IChatRoom extends Document {
  type: ChatType;

  members: Types.ObjectId[];
  owner?: Types.ObjectId;              
  admins?: Types.ObjectId[];           

  // 1–1 chat uniqueness
  oneToOneKey?: string;                // ONLY for ONE_TO_ONE

  name?: string;
  description?: string;
  image?: {
    key?: string;
    url?: string;
  };
  isPublic?: boolean;                  // for group discovery

  lastMessage?: Types.ObjectId;
  lastRead?: IChatLastRead[];

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}
const ChatRoomSchema = new Schema<IChatRoom>(
  {
    type: {
      type: String,
      enum: Object.values(ChatType),
      required: true,
      index: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],


    //Used ONLY for ONE_TO_ONE chats(Format: userId1_userId2 (sorted))
    oneToOneKey: {
      type: String,
    },

    name: {
      type: String,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      key: { type: String },
      url: { type: String },
    },

    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },

    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    // Per-user read state (FAST & SCALABLE)
    lastRead: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: Schema.Types.ObjectId,
          ref: "Message",
          required: true,
        },
        readAt: {
          type: Date,
          required: true,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate ONE-TO-ONE chats
ChatRoomSchema.index(
  { oneToOneKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: ChatType.ONE_TO_ONE,
    },
  }
);

// Group search
ChatRoomSchema.index({ name: "text", description: "text" });

export const ChatRoomModel = model<IChatRoom>("ChatRoom", ChatRoomSchema);
