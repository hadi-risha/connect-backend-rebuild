import { UserModel, IUser } from "../models/User.model";
import { BaseRepository } from "./BaseRepository";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  
  findByEmail(email: string) {
    return this.model.findOne({ email });
  }


  verifyUser(email: string) {
    return this.model.updateOne(
      { email },
      { $set: { isVerified: true } }
    );
  }


  findByEmailWithPassword(email: string) {
    return this.model.findOne({ email }).select("+password");
  }


  setResetPasswordToken( userId: string, token: string, expiry: Date) {
    return this.model.findByIdAndUpdate( 
      userId, 
      { resetPasswordToken: token, resetPasswordExpiry: expiry,},
      { new: true }
    );
  }


  findValidResetToken( email: string, hashedToken: string) {
    return this.model.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });
  }


  updatePasswordAfterReset( userId: string, hashedPassword: string ) {
    return this.model.findByIdAndUpdate(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
    }, {new: true});
  }
}
