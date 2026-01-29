import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  title: string;
  content: string;
  createdBy: Types.ObjectId; 
  isVisible: boolean; 

  updatedAt: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const NotificationModel = model<INotification>(
  "Notification",
  NotificationSchema
);
