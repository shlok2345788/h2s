import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  instituteName: string;
  email: string;
  password?: string; // Optional for Google OAuth users
  googleId?: string; // Optional for Google OAuth
  authProvider: 'email' | 'google' | 'both';
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    instituteName: {
      type: String,
      required: [true, 'Please provide an institute name'],
      trim: true,
      maxlength: [100, 'Institute name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values
    },
    authProvider: {
      type: String,
      enum: ['email', 'google', 'both'],
      default: 'email',
    },
    apiKey: {
      type: String,
      unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password || '', salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcryptjs.compare(candidatePassword, this.password);
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ apiKey: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
