import { IBaseRepository } from "./IBaseRepository";
import { IWishlist } from "../../models/Wishlist.model";
import { Types } from "mongoose";

export interface IWishlistRepository extends IBaseRepository<IWishlist> {
  delete(filter: any): any;

  findByStudent(studentId: string): any;

  findByStudentId(
    studentId: Types.ObjectId
  ): Promise<Pick<IWishlist, "sessionId">[]>;

  exists(
    studentId: Types.ObjectId,
    sessionId: Types.ObjectId
  ): Promise<boolean>;

  getWishlistSessionIds(studentId: Types.ObjectId): Promise<string[]>;
}
