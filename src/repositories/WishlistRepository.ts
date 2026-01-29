import { Types } from "mongoose";
import { WishlistModel, IWishlist } from "../models/Wishlist.model";
import { BaseRepository } from "./BaseRepository";
import { IWishlistRepository } from "./interfaces/IWishlistRepository";

export class WishlistRepository extends BaseRepository<IWishlist> implements IWishlistRepository {
  constructor() {
    super(WishlistModel);
  }
  

  delete(filter: any) {
    return this.model.deleteOne(filter);
  }


  findByStudent(studentId: string) {
    return this.model
      .find({ studentId })
      .populate({
        path: "sessionId",
        select:
          "title introduction coverPhoto duration fees category instructorId",
      })
      .lean();
  }


  findByStudentId(
      studentId: Types.ObjectId
  ): Promise<Pick<IWishlist, "sessionId">[]> {
      return this.model
      .find({ studentId })
      .select("sessionId")
      .lean();
  }


  async exists(studentId: Types.ObjectId, sessionId: Types.ObjectId) {
    return !!(await this.model.exists({ studentId, sessionId }));
  }


  async getWishlistSessionIds(studentId: Types.ObjectId) {
    const list = await this.model
    .find({ studentId })
    .select("sessionId")
    .lean();

    return list.map((w: any) => w.sessionId.toString());
  }
}
