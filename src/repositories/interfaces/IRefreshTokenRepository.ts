import { IBaseRepository } from "./IBaseRepository";
import { IRefreshToken } from "../../models/RefreshToken.model";

export interface IRefreshTokenRepository
  extends IBaseRepository<IRefreshToken> {
  create(data: Partial<IRefreshToken>): any;

  findByTokenHash(tokenHash: string): any;

  deleteById(id: string): any;

  deleteByTokenHash(tokenHash: string): any;

  deleteAllForUser(userId: string): any;
}
