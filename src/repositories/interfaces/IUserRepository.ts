import { IBaseRepository } from "./IBaseRepository";
import { IUser } from "../../models/User.model";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): any;

  verifyUser(email: string): any;

  findByEmailWithPassword(email: string): any;

  setResetPasswordToken(
    userId: string,
    token: string,
    expiry: Date
  ): any;

  findValidResetToken(
    email: string,
    hashedToken: string
  ): any;

  updatePasswordAfterReset(
    userId: string,
    hashedPassword: string
  ): any;
}
