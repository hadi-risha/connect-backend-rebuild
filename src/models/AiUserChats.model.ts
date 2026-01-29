import mongoose, { Schema } from "mongoose";

interface Chat {
  _id: string;
  title: string;
  createdAt: Date;
}

export interface IAiUserChats extends Document {
  userId: Schema.Types.ObjectId;  
  chats: Chat[];
}


const userChatsSchema = new mongoose.Schema(
  {
    userId: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    chats: [
      {
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

export const AiUserChatsModel = mongoose.model<IAiUserChats>('AiUserChats', userChatsSchema);

