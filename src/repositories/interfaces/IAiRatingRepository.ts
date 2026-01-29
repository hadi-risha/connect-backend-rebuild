import { IBaseRepository } from "./IBaseRepository";
import { IRating } from "../../models/AiRating.model";

export interface IAiRatingRepository extends IBaseRepository<IRating> {
  createRating(userId: string, rating: number): any;

  findByUserId(userId: string): any;

  getAllRatingsWithUsers(): any;
}
