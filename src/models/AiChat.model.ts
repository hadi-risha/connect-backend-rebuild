import mongoose, { Schema } from "mongoose";

interface ChatHistoryPart {
    text: string;
}

interface ChatHistory {
    role: 'user' | 'model';
    parts: ChatHistoryPart[];
    //   img?: { url: string };
    img?: string;
}

export interface IAiChat extends Document {
    userId: mongoose.Types.ObjectId;
    history: ChatHistory[];
}
  
const ChatSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true,
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true,
                    },
                },
            ],
            // img: {
            //     type: { 
            //         url: { 
            //             type: String 
            //         } 
            //     },
            //     required: false,
            // },
            img: {
                type: String,
                required: false,
            },
        },
        ],
    },
    { timestamps: true }
);
  
export const AiChatModel = mongoose.model<IAiChat>('AiChat', ChatSchema);
  