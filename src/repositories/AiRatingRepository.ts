import { BaseRepository } from "./BaseRepository";
import AiRatingModel from "../models/AiRating.model";
import { IRating } from "../models/AiRating.model";
import { Types } from "mongoose";
import { IAiRatingRepository } from "./interfaces/IAiRatingRepository";

export class AiRatingRepository extends BaseRepository<IRating> implements IAiRatingRepository {
  constructor() {
    super(AiRatingModel);
  }

  createRating(userId: string, rating: number) {
    return this.create({
      userId,
      rating,
    });
  }


  findByUserId(userId: string) {
    return this.findOne({
      userId: new Types.ObjectId(userId),
    });
  }

  
  async getAllRatingsWithUsers() {
    return AiRatingModel.find()
      .populate({
        path: "userId",
        select: "name email role profilePicture",
      })
      .sort({ createdAt: -1 })
      .lean();
  }
  
}
