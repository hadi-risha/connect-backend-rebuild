import { Schema, model, Types, Document } from "mongoose";

export interface IMessageReaction {
  emoji: string;
  users: Types.ObjectId[];
}

export interface IMessage extends Document {
  chatRoom: Types.ObjectId;
  sender: Types.ObjectId;
  type: "text" | "image" | "audio";
  content?: string;
  image?: {
    key?: string;
    url?: string;
  };

  audio?: {
    key?: string;
    url?: string;
    duration?: number;
  };

  replyTo?: Types.ObjectId;
  reactions?: IMessageReaction[];
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}


const MessageSchema = new Schema<IMessage>(
  {
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
      index: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["text", "image", "audio"],
      required: true,
      index: true,
    },

    content: {
      type: String,
      trim: true,
    },

    image: {
      key: { type: String },
      url: { type: String },
    },

    audio: {
      key: { type: String },
      url: { type: String },
      duration: { type: Number },
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    /**
     * Reactions grouped by emoji
     * Prevents duplicates naturally
     */
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        users: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pagination & performance
MessageSchema.index({ chatRoom: 1, createdAt: -1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
