import { RefreshTokenModel, IRefreshToken } from "../models/RefreshToken.model";
import { BaseRepository } from "./BaseRepository";
import { IRefreshTokenRepository } from "./interfaces/IRefreshTokenRepository";

export class RefreshTokenRepository extends BaseRepository<IRefreshToken> implements IRefreshTokenRepository {
  constructor() {
    super(RefreshTokenModel);
  }

  
  create(data: Partial<IRefreshToken>) {
    return this.model.create(data);
  }

  findByTokenHash(tokenHash: string) {
    return this.model.findOne({ tokenHash });
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  deleteByTokenHash(tokenHash: string) {
    return this.model.deleteOne({ tokenHash });
  }

  deleteAllForUser(userId: string) {
    return this.model.deleteMany({ userId });
  }
}
