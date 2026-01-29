import { Schema, model, Document } from 'mongoose';
import { Role } from '../constants/roles.enum';
import { AuthProvider } from '../constants/authProvider.enum';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  provider: AuthProvider;
  
  role: Role;
  profilePicture?: {
    key?: string | '';
    url?: string | '';
  };

  instructorProfile?: {
    bio?: string;
    expertise?: string;
  };

  lastSeen?: Date;  //this field not added in frontend slice

  isVerified: boolean;
  isBlocked: boolean;

  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, select: false },
  provider: {
    type: String,
    enum: Object.values(AuthProvider),
    required: true
  },
  role: { type: String, enum: Object.values(Role), default: Role.STUDENT },
  profilePicture: {
    type: {
      key: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: true,
      },
    },
    required: false, // entire img field is optional
  },
  instructorProfile: {
    bio: { type: String },
    expertise: { type: String },
  },
  // Updated on socket disconnect
  lastSeen: {
    type: Date,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  isBlocked: { 
    type: Boolean, 
    default: false 
  },

  resetPasswordToken: {
    type: String,
    default: null,
    required: false,
  },
  resetPasswordExpiry: {
    type: Date,
    default: null,
    required: false,
  },
}, { timestamps: true });

// User search (name/email)
UserSchema.index({ name: "text", email: "text" });

export const UserModel = model<IUser>('User', UserSchema);
