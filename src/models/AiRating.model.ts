import mongoose, { Schema, Document } from "mongoose";

export interface IRating extends Document {
  userId: string;  
  rating: number;  // ( 1 to 5 stars)
}

const aiRatingSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,  
      ref: 'User',  
      required: true,  
    },
    rating: {
      type: Number,  
      required: true,  
      min: 1,  
      max: 5,  
    },
  },
  { timestamps: true }  
);

const AiRatingModel = mongoose.model<IRating>("AiRating", aiRatingSchema);

export default AiRatingModel;
